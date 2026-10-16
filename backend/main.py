from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from typing import Optional

import httpx
import joblib
from bs4 import BeautifulSoup

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Works both as `uvicorn backend.main:app` (from Trustlens/)
# and as `uvicorn main:app` (from Trustlens/backend/).
try:
    from backend.article_splitter import extract_full_text, split_articles
    from backend.database import init_db, save_analysis
    from backend.history_routes import router as history_router
except ImportError:
    from article_splitter import extract_full_text, split_articles
    from database import init_db, save_analysis
    from history_routes import router as history_router

# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parents[1]

# Use the exact same text cleaning as training (ml/preprocessing.py)
sys.path.insert(0, str(ROOT / "ml"))
from preprocessing import prepare_for_model  # noqa: E402

MODEL_PATH = ROOT / "ml" / "artifacts" / "trustlens_pipeline.joblib"
LEGACY_MODEL_PATH = ROOT / "ml" / "model.pkl"


# ============================================================
# LOAD ML MODEL
# ============================================================

model = None
model_error: Optional[str] = None

for candidate in (MODEL_PATH, LEGACY_MODEL_PATH):
    if not candidate.exists():
        continue
    try:
        model = joblib.load(candidate)
        model_error = None
        break
    except Exception as exc:  # corrupted file / incompatible scikit-learn
        model_error = f"Could not load {candidate.name}: {exc}"

if model is None and model_error is None:
    model_error = "No model file found. Run `python ml/train.py` first."


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="TrustLens API",
    version="2.1.0"
)


# Database (creates trustlens.db on first run) + dashboard endpoints
init_db()
app.include_router(history_router)
# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    # Any local dev port (Vite may pick 5174, 5175, ... if 5173 is busy),
    # plus any extra origins listed in TRUSTLENS_CORS_ORIGINS.
    allow_origins=[
        origin.strip()
        for origin in os.getenv("TRUSTLENS_CORS_ORIGINS", "").split(",")
        if origin.strip()
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class NewsRequest(BaseModel):
    text: str = Field(
        min_length=10,
        max_length=100_000
    )


class URLRequest(BaseModel):
    url: str = Field(
        min_length=8,
        max_length=2_000
    )


# ============================================================
# MODEL CHECK
# ============================================================

def require_model():
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "ML model is not available. "
                f"{model_error or ''} "
                "Make sure trustlens_pipeline.joblib exists inside ml/artifacts/."
            ).strip(),
        )

def explain_prediction(model_text: str, top_n: int = 8):
    """
    Which words pushed this text towards Fake or Real?

    For TF-IDF + logistic regression:
        contribution of a word = its TF-IDF value * its model weight
    Negative contribution -> towards Fake, positive -> towards Real.
    """

    try:
        vectorizer = model.named_steps["tfidf"]
        classifier = model.named_steps["classifier"]
    except (AttributeError, KeyError):
        return None  # model is not a TF-IDF pipeline

    vector = vectorizer.transform([model_text])
    words = vectorizer.get_feature_names_out()
    weights = classifier.coef_[0]

    # Class order check: weight > 0 must mean "Real" (class 1)
    if list(classifier.classes_) != [0, 1]:
        return None

    contributions = [
        (words[i], float(value * weights[i]))
        for i, value in zip(vector.indices, vector.data)
    ]

    fake_words = sorted(
        (c for c in contributions if c[1] < 0),
        key=lambda c: c[1],
    )[:top_n]

    real_words = sorted(
        (c for c in contributions if c[1] > 0),
        key=lambda c: c[1],
        reverse=True,
    )[:top_n]

    return {
        "fake_words": [
            {"word": w, "weight": round(abs(v), 4)} for w, v in fake_words
        ],
        "real_words": [
            {"word": w, "weight": round(v, 4)} for w, v in real_words
        ],
    }
# ============================================================
# CLASSIFICATION
# ============================================================

def classify(text: str) -> dict:

    require_model()

    text = text.strip()

    if len(text) < 10:
        raise HTTPException(
            status_code=422,
            detail="Please provide at least 10 characters of text."
        )

    model_text = prepare_for_model(text)

    if len(model_text) < 10:
        raise HTTPException(
            status_code=422,
            detail="Not enough readable text left to analyze after cleaning.",
        )

    # Prediction probabilities
    probabilities = model.predict_proba([model_text])[0]

    classes = list(model.classes_)

    try:
        fake_probability = float(
            probabilities[classes.index(0)]
        )

        real_probability = float(
            probabilities[classes.index(1)]
        )

    except ValueError:

        raise HTTPException(
            status_code=500,
            detail="Model classes are not compatible with TrustLens."
        )

    predicted_class = 0 if fake_probability >= real_probability else 1

    max_probability = max(
        fake_probability,
        real_probability
    )

    # ========================================================
    # VERDICT
    # ========================================================

    if max_probability < 0.70:

        verdict = "Uncertain"

        description = (
            "The model does not have a strong classification "
            "signal. Verify the claims independently."
        )

    elif predicted_class == 0:

        verdict = "Likely Fake"

        description = (
            "The text resembles patterns associated with "
            "the fake-news class in the training data."
        )

    else:

        verdict = "Likely Real"

        description = (
            "The text resembles patterns associated with "
            "the real-news class in the training data."
        )

    return {
        "prediction": verdict,

        "fake_probability": round(
            fake_probability * 100,
            2
        ),

        "real_probability": round(
            real_probability * 100,
            2
        ),

        "model_signal": round(
            max_probability * 100,
            2
        ),

        "word_count": len(
            text.split()
        ),

        "character_count": len(text),

        "description": description,

        "explanation": explain_prediction(model_text),

        "verification_status": "not_verified",

        "disclaimer": (
            "This is a machine-learning text signal. "
            "It does not independently establish whether "
            "a claim is true or false."
        ),
    }


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "TrustLens API is running",
        "model_loaded": model is not None,
        "version": "2.1.0",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_error": model_error,
    }


# ============================================================
# MODEL METRICS (read by the homepage / dashboard)
# ============================================================

METRICS_PATH = ROOT / "ml" / "artifacts" / "metrics.json"


@app.get("/metrics")
def metrics():

    if not METRICS_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="metrics.json not found. Run `python ml/train.py`.",
        )

    import json

    return json.loads(METRICS_PATH.read_text(encoding="utf-8"))


# ============================================================
# TEXT PREDICTION
# ============================================================

@app.post("/predict")
def predict_news(request: NewsRequest):

    result = classify(request.text)
    result["analysis_id"] = save_analysis("text", result, text=request.text)
    return result


# ============================================================
# PDF ARTICLE EXTRACTION
# ============================================================

def extract_pdf_articles(contents: bytes):
    """
    Split the uploaded PDF into articles using its layout
    (font sizes, columns, coordinates) and also return the
    plain full text for the whole-document fallback.
    """

    try:
        articles = split_articles(contents)
        full_text = extract_full_text(contents)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not read this PDF: {exc}",
        ) from exc

    if not full_text and not articles:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract readable text from this PDF. "
                "Scanned (image-only) PDFs are not supported yet."
            ),
        )

    if not articles:
        articles = [
            {
                "title": "Extracted document",
                "text": full_text,
                "method": "fallback",
                "page": 1,
                "bbox": None,
            }
        ]

    return articles, full_text


# ============================================================
# PDF DOCUMENT ANALYSIS
# ============================================================

@app.post("/analyze-document")
async def analyze_document(
    file: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None),
    document: Optional[UploadFile] = File(None),
):
    # ========================================================
    # CHECK FILE NAME
    # ========================================================

    uploaded_file = file or pdf or document

    if uploaded_file is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "No PDF file received. Send it as multipart form "
                "field 'file' (or 'pdf' / 'document')."
            ),
        )
    filename = uploaded_file.filename or ""
    # ========================================================
    # CHECK CONTENT TYPE
    # ========================================================


    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail=f"Only PDF files are supported. Received: {filename}"
        )


    # ========================================================
    # READ FILE
    # ========================================================

    contents = await uploaded_file.read()

    if not contents:
        raise HTTPException(
            status_code=422,
            detail="Uploaded PDF is empty."
        )

    # ========================================================
    # SIZE LIMIT
    # ========================================================

    MAX_SIZE = 25 * 1024 * 1024

    if len(contents) > MAX_SIZE:

        raise HTTPException(
            status_code=413,
            detail=(
                "PDF is too large. "
                "Maximum size is 25 MB."
            ),
        )

    # ========================================================
    # CHECK PDF SIGNATURE
    # ========================================================

    if not contents.startswith(b"%PDF"):

        raise HTTPException(
            status_code=415,
            detail="The uploaded file is not a valid PDF."
        )

    # ========================================================
    # EXTRACT ARTICLES
    # ========================================================

    # CPU-heavy work runs in a thread so the server stays responsive
    articles, full_text = await run_in_threadpool(
        extract_pdf_articles,
        contents
    )

    # ========================================================
    # ANALYZE EACH ARTICLE
    # ========================================================

    results = []

    MAX_ARTICLES = 100

    for index, article in enumerate(
        articles[:MAX_ARTICLES],
        start=1
    ):

        title = (
            article.get("title")
            or f"Article {index}"
        )

        body = (
            article.get("text")
            or ""
        )

        text = (
            f"{title} {body}"
        ).strip()

        if len(text) < 30:
            continue

        # ----------------------------------------------------
        # ML classification
        # ----------------------------------------------------

        result = classify(
            text
        )

        # ----------------------------------------------------
        # Article metadata
        # ----------------------------------------------------

        article_result = {

            "index": index,

            "title": title,

            "text_preview": text[:500],

            "page": article.get(
                "page"
            ),

            "method": article.get(
                "method"
            ),

            "bbox": article.get(
                "bbox"
            ),

            "line_count": article.get(
                "line_count"
            ),

            "column_count": article.get(
                "column_count"
            ),

            **result,
        }

        results.append(
            article_result
        )

    # ========================================================
    # WHOLE DOCUMENT FALLBACK
    # ========================================================

    if not results:

        if len(full_text) < 10:

            raise HTTPException(
                status_code=422,
                detail=(
                    "The PDF contains insufficient "
                    "readable text."
                ),
            )

        results = [
            {
                "index": 1,

                "title": "Whole document",

                "text_preview": full_text[:500],

                "page": None,

                "method": "document_fallback",

                "bbox": None,

                **classify(full_text),
            }
        ]

    # ========================================================
    # COUNTS
    # ========================================================

    fake_count = sum(
        result["prediction"] == "Likely Fake"
        for result in results
    )

    real_count = sum(
        result["prediction"] == "Likely Real"
        for result in results
    )

    uncertain_count = sum(
        result["prediction"] == "Uncertain"
        for result in results
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    response = {

        "success": True,

        "filename": filename,

        "prediction": "Document analyzed",

        "article_count": len(results),

        "fake_count": fake_count,

        "real_count": real_count,

        "uncertain_count": uncertain_count,

        "extracted_text_length": len(
            full_text
        ),

        "articles": results,

        "disclaimer": (
            "Each article receives a text-classification "
            "signal. The document is not independently "
            "fact-checked."
        ),
    }

    response["analysis_id"] = save_analysis("document", response, source=filename)
    return response


# ============================================================
# URL TEXT EXTRACTION
# ============================================================

def extract_url_text(url: str):

    parsed = urlparse(
        url
    )

    # --------------------------------------------------------
    # Validate URL
    # --------------------------------------------------------

    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.netloc
    ):

        raise HTTPException(
            status_code=422,
            detail=(
                "Enter a valid http:// or https:// news URL."
            ),
        )

    # --------------------------------------------------------
    # Download page
    # --------------------------------------------------------

    try:

        with httpx.Client(
            follow_redirects=True,
            timeout=15,
            headers={
                # Many news sites reject unknown bots with 403
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/128.0 Safari/537.36 TrustLens/2.1"
                ),
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
        ) as client:

            response = client.get(
                url
            )

            response.raise_for_status()

    except httpx.HTTPStatusError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "The website refused the request "
                f"(HTTP {exc.response.status_code}). "
                "Some sites block automated access; "
                "try pasting the article text instead."
            ),
        ) from exc

    except httpx.HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Could not retrieve the URL: {exc}"
            ),
        ) from exc

    # --------------------------------------------------------
    # Verify HTML
    # --------------------------------------------------------

    content_type = response.headers.get(
        "content-type",
        ""
    )

    if "html" not in content_type.lower():

        raise HTTPException(
            status_code=415,
            detail=(
                "The URL did not return an HTML page."
            ),
        )

    # --------------------------------------------------------
    # Parse HTML
    # --------------------------------------------------------

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    # Remove unwanted elements
    for tag in soup(
        [
            "script",
            "style",
            "noscript",
            "nav",
            "footer",
            "header",
            "form",
            "aside",
        ]
    ):

        tag.decompose()

    # --------------------------------------------------------
    # Title
    # --------------------------------------------------------

    title = ""

    if soup.title:

        title = soup.title.get_text(
            " ",
            strip=True
        )

    # --------------------------------------------------------
    # Article container
    # --------------------------------------------------------

    article = soup.find(
        "article"
    )

    container = (
        article
        if article
        else soup
    )

    # --------------------------------------------------------
    # Paragraphs
    # --------------------------------------------------------

    paragraphs = [
        p.get_text(
            " ",
            strip=True
        )
        for p in container.find_all(
            "p"
        )
    ]

    text = " ".join(
        paragraph
        for paragraph in paragraphs
        if len(paragraph) > 20
    )

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    if len(text) < 100:

        text = container.get_text(
            " ",
            strip=True
        )

    text = text[:100_000]

    return title, text


# ============================================================
# URL ANALYSIS
# ============================================================

@app.post("/analyze-url")
def analyze_url(
    request: URLRequest
):

    title, text = extract_url_text(
        request.url
    )

    if len(text) < 50:

        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract enough article "
                "text from this page."
            ),
        )

    result = classify(
        f"{title} {text}"
    )

    response = {

        "success": True,

        "url": request.url,

        "title": title,

        "source_text_length": len(
            text
        ),

        **result,
    }

    response["analysis_id"] = save_analysis("url", response, text=text, source=request.url)
    return response