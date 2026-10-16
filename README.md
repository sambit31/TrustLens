# TrustLens

TrustLens is a full-stack fake-news **text classification and analysis** project built with React, FastAPI and scikit-learn.

> Important: the current ML layer predicts whether text resembles the fake/real classes in its training data. It does **not** prove that a claim is factually true or false. Independent evidence verification is the next upgrade layer.

## Current build

- Text analysis with TF-IDF + Logistic Regression
- Stratified train/test split
- Accuracy, precision, recall, F1 and ROC-AUC
- Duplicate removal and basic text cleaning
- `Uncertain` result when the model signal is weak
- PDF extraction and article-by-article classification
- Public URL article extraction and classification
- React result dashboard
- FastAPI `/predict`, `/analyze-document`, `/analyze-url`, `/health`

## Project structure

```text
Trustlens/
├── backend/
│   ├── main.py
│   └── article_splitter.py
├── ml/
│   ├── dataset/                 # put Fake.csv and True.csv here
│   ├── artifacts/               # generated model + metrics
│   ├── preprocessing.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
├── frontend/
└── requirements.txt
```

## 1. Install Python dependencies

From the `Trustlens` directory:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2. Add the dataset

Put the raw files here:

```text
ml/dataset/Fake.csv
ml/dataset/True.csv
```

Each file should contain at least `title` and `text` columns.

## 3. Train the model

```bash
python ml/train.py
```

The command creates:

```text
ml/dataset/cleaned_news.csv
ml/artifacts/trustlens_pipeline.joblib
ml/artifacts/metrics.json
```

Legacy model files are also generated at `ml/model.pkl`, `ml/tfidf_vectorizer.pkl` and `ml/classifier.pkl` for compatibility.

## 4. Start the API

Run this from the `Trustlens` directory (not from `backend/`):

```bash
uvicorn backend.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/health` to check whether the model is loaded.
If `model_loaded` is `false`, the `model_error` field explains why
(usually: run `python ml/train.py` first).

PDF splitting uses PyMuPDF and takes about 2 seconds for a 12-page
newspaper. To inspect what the splitter finds in a PDF:

```bash
python backend/test_splitter.py "path/to/newspaper.pdf"
```

## 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The default frontend API URL is `http://127.0.0.1:8000`. You can override it by
copying `frontend/.env.example` to `frontend/.env` and editing:

```text
VITE_API_URL=http://127.0.0.1:8000
```

The API accepts requests from any `localhost` / `127.0.0.1` port. To allow a
deployed frontend, set `TRUSTLENS_CORS_ORIGINS=https://your-site.com` before
starting the API.

> Do not copy `node_modules` between computers; always run `npm install`
> on the machine that runs the frontend.

## Next major upgrade: evidence verification

The next version should add:

```text
Article
  ↓
Claim extraction
  ↓
Evidence retrieval
  ↓
Evidence ranking
  ↓
Natural-language inference
  ↓
Supported / Contradicted / Unverified
```

This should be kept separate from the existing text classifier so that TrustLens does not confuse a linguistic prediction with proof of factual truth.
