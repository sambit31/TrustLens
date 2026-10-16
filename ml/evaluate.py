"""Evaluate the saved TrustLens model on a fresh labeled CSV."""
from pathlib import Path
import argparse
import json
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

from preprocessing import prepare_for_model


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="CSV containing content and label columns")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    model = joblib.load(root / "artifacts" / "trustlens_pipeline.joblib")
    data = pd.read_csv(args.csv).dropna(subset=["content", "label"])
    y = data["label"].astype(int)
    data["content"] = data["content"].map(prepare_for_model)
    pred = model.predict(data["content"])
    prob = model.predict_proba(data["content"])[:, 1]

    print(classification_report(y, pred, target_names=["Fake", "Real"], zero_division=0))
    print("Confusion matrix:")
    print(confusion_matrix(y, pred))
    print("ROC-AUC:", round(roc_auc_score(y, prob), 4))


if __name__ == "__main__":
    main()
