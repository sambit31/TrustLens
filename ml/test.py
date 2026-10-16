"""Backward-compatible dataset preparation entry point."""
from pathlib import Path
from preprocessing import load_raw_dataset, save_cleaned_dataset

if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    data = load_raw_dataset(root / "dataset")
    save_cleaned_dataset(data, root / "dataset" / "cleaned_news.csv")
    print(f"Prepared {len(data):,} unique articles.")
