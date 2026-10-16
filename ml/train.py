"""Train and evaluate the TrustLens baseline text classifier.

Run from the TrustLens directory:
    python ml/train.py

Expected raw datasets:
    ml/dataset/Fake.csv
    ml/dataset/True.csv
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from preprocessing import load_raw_dataset, prepare_for_model, save_cleaned_dataset

ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "artifacts"
DATASET_DIR = ROOT / "dataset"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42

# The same claim with and without a wire-agency dateline. After the
# leak fix, the dateline should barely change the prediction.
LEAK_PROBE = "Aliens have secretly replaced the moon with a hologram, officials said on Tuesday."


def main():
    data = load_raw_dataset(DATASET_DIR)
    save_cleaned_dataset(data, DATASET_DIR / "cleaned_news.csv")

    print(f"Total unique articles: {len(data):,}")
    print("Class distribution:")
    print(data["label"].value_counts().sort_index())

    X_train, X_test, y_train, y_test = train_test_split(
        data["content"], data["label"],
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=data["label"],
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            strip_accents="unicode",
            stop_words="english",
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.98,
            max_features=100_000,
            sublinear_tf=True,
        )),
        ("classifier", LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        )),
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob)),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
    }

    # Most influential words for each class
    vectorizer = pipeline.named_steps["tfidf"]
    coefficients = pipeline.named_steps["classifier"].coef_[0]
    words = np.array(vectorizer.get_feature_names_out())
    order = np.argsort(coefficients)
    metrics["top_fake_words"] = words[order[:25]].tolist()
    metrics["top_real_words"] = words[order[-25:]][::-1].tolist()

    # Leak check: does adding "(Reuters) -" still flip the verdict?
    plain = pipeline.predict_proba([prepare_for_model(LEAK_PROBE)])[0][1]
    dated = pipeline.predict_proba([prepare_for_model("WASHINGTON (Reuters) - " + LEAK_PROBE)])[0][1]
    metrics["leak_check"] = {
        "real_probability_plain": round(float(plain) * 100, 2),
        "real_probability_with_reuters_dateline": round(float(dated) * 100, 2),
    }
    metrics["dataset_rows_after_cleaning"] = int(len(data))

    print("\nEvaluation")
    print(json.dumps(metrics, indent=2))
    print("\nClassification report")
    print(classification_report(y_test, y_pred, target_names=["Fake", "Real"], zero_division=0))

    joblib.dump(pipeline, MODEL_DIR / "trustlens_pipeline.joblib")
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    # Keep legacy filenames working for existing code/users.
    joblib.dump(pipeline, ROOT / "model.pkl")
    joblib.dump(pipeline.named_steps["tfidf"], ROOT / "tfidf_vectorizer.pkl")
    joblib.dump(pipeline.named_steps["classifier"], ROOT / "classifier.pkl")

    print(f"\nSaved model to {MODEL_DIR / 'trustlens_pipeline.joblib'}")


if __name__ == "__main__":
    main()
