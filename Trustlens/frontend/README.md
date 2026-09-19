# TrustLens — AI-Powered Fake News & Document Verification (Frontend)

A React + Vite + Tailwind CSS frontend for the TrustLens academic project. It connects to a FastAPI
backend that serves a TF-IDF + Logistic Regression fake-news classifier.

## 1. Install dependencies

```bash
cd trustlens
npm install
```

## 2. Configure the API URL

The API base URL is read from an environment variable. A `.env` file is already included:

```
VITE_API_URL=http://127.0.0.1:8000
```

Change this if your FastAPI backend runs somewhere else.

## 3. Run the frontend

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser.

## 4. Run your FastAPI backend

In a separate terminal, start your existing backend so it is listening on the URL configured
in `.env` (default `http://127.0.0.1:8000`), with a `POST /predict` endpoint that accepts
`{ "text": "..." }` and returns:

```json
{
  "prediction": "Fake News",
  "fake_probability": 81.2,
  "real_probability": 18.8
}
```

Make sure CORS is enabled on the FastAPI side for your frontend's origin, e.g.:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 5. Build for production

```bash
npm run build
npm run preview
```

## How a request flows

1. On `/analyze`, the person pastes text into the textarea and clicks **Analyze Content**.
2. `src/components/Analyzer.jsx` calls `analyzeNews(text)` from `src/services/api.js`.
3. `api.js` sends `POST {VITE_API_URL}/predict` with `{ text }` using Axios.
4. FastAPI cleans the text, vectorizes it with TF-IDF, and scores it with the logistic
   regression model.
5. FastAPI returns `{ prediction, fake_probability, real_probability }`.
6. React stores that response in state and renders `ResultCard.jsx`, `ProbabilityChart.jsx`,
   and the breakdown cards with the real values from your model.

## Project structure

```
trustlens/
  src/
    components/
      Navbar.jsx, Hero.jsx, Logo.jsx, FeatureCard.jsx, HowItWorks.jsx,
      StatsSection.jsx, ConfusionMatrix.jsx, TechStack.jsx, Footer.jsx,
      Analyzer.jsx, ResultCard.jsx, ProbabilityChart.jsx, ConfidenceCard.jsx,
      LoadingState.jsx, ErrorState.jsx
    pages/
      Home.jsx, Analyze.jsx, About.jsx, HowItWorksPage.jsx
    services/
      api.js
    App.jsx, main.jsx, index.css
  index.html
  .env / .env.example
  postcss.config.js
  package.json
```

## Assumptions made

- The backend endpoint is `POST /predict`, accepting `{ "text": string }` and returning
  `{ prediction, fake_probability, real_probability }` exactly as specified — no auth required.
- Document and URL analysis tabs are UI-only placeholders ("Coming Soon") since only the text
  endpoint currently exists.
- The statistics (accuracy 98.36%, precision 98.01%, recall 99.02%, F1 98.51%) and the confusion
  matrix numbers are the values you provided, displayed as-is and labeled as held-out test
  evaluation, not live/real-time metrics.
- Tailwind CSS v4 is used (installed via `@tailwindcss/postcss`), which is the current stable
  major version — styling is done via `@theme` tokens in `src/index.css` rather than a
  `tailwind.config.js` file.
- CORS must be enabled on your FastAPI backend for the Vite dev server origin, or requests
  from the browser will be blocked.
