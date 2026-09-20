from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
from io import BytesIO
from pypdf import PdfReader


app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load ML model
model = joblib.load("../ml/model.pkl")

# Load TF-IDF vectorizer
vectorizer = joblib.load("../ml/tfidf_vectorizer.pkl")


# Request model
class NewsRequest(BaseModel):
    text: str


# Home
@app.get("/")
def home():
    return {
        "message": "TrustLens API is running"
    }


# News prediction
@app.post("/predict")
def predict_news(request: NewsRequest):

    # Convert news text into TF-IDF
    news_tfidf = vectorizer.transform([request.text])

    # Prediction
    prediction = model.predict(news_tfidf)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(news_tfidf)[0]

    fake_probability = probabilities[0] * 100
    real_probability = probabilities[1] * 100

    if prediction == 0:
        result = "Fake News"
    else:
        result = "Real News"

    return {
        "prediction": result,
        "fake_probability": round(fake_probability, 2),
        "real_probability": round(real_probability, 2)
    }


# Document analysis
@app.post("/analyze-document")
async def analyze_document(file: UploadFile = File(...)):

    # Read uploaded PDF
    contents = await file.read()

    # Read PDF
    pdf = PdfReader(BytesIO(contents))

    # Extract text
    text = ""

    for page in pdf.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    # Check if text was extracted
    if not text.strip():
        return {
            "error": "Could not extract text from this PDF"
        }

    # Convert document text into TF-IDF
    document_tfidf = vectorizer.transform([text])

    # Prediction
    prediction = model.predict(document_tfidf)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(document_tfidf)[0]

    fake_probability = probabilities[0] * 100
    real_probability = probabilities[1] * 100

    if prediction == 0:
        result = "Fake News"
    else:
        result = "Real News"

    return {
        "filename": file.filename,
        "prediction": result,
        "fake_probability": round(fake_probability, 2),
        "real_probability": round(real_probability, 2),
        "extracted_text_length": len(text)
    }