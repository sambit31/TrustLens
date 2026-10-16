"""Dataset preparation utilities for TrustLens.

The ISOT Fake/True news dataset contains formatting artifacts that
reveal the label without reading the article, for example:

    True.csv  -> 98.5% start with "CITY (Reuters) - "
    Fake.csv  -> "Featured image via ...", "(VIDEO)" title tags,
                 Twitter embeds, broken apostrophes ("couldn t")

A model given only nine yes/no checks for such artifacts (and no
real words) scores 99.8% accuracy. `prepare_for_model` removes these
shortcuts so the classifier has to learn from the actual writing.

The SAME function is applied at training time and at prediction time
(backend, predict.py, evaluate.py) so both see identical text.
"""
from pathlib import Path
import re

import pandas as pd

MIN_WORDS = 20  # articles shorter than this after cleaning are dropped

_PATTERNS = [
    # Agency datelines: "WASHINGTON (Reuters) - ", "LONDON/PARIS (Reuters) -"
    (re.compile(r"^[^\n]{0,120}?\((?:Reuters|AP|AFP)\)\s*[-–—]*\s*"), " "),
    # Any remaining agency names ("told Reuters", "Reuters reported")
    (re.compile(r"\b(?:Reuters|Thomson Reuters)\b", re.I), " "),
    # Image / media credits
    (re.compile(r"featured image[^.\n]*", re.I), " "),
    (re.compile(r"\b(?:photo|image|images|picture)s?\s+(?:by|via|credit|from)\b[^.\n]*", re.I), " "),
    (re.compile(r"\b(?:getty images|screen ?shot|screengrab|via youtube|via twitter|via facebook)\b[^.\n]*", re.I), " "),
    (re.compile(r"\b21st century wire\b[^.\n]*", re.I), " "),
    (re.compile(r"\bread more\s*:?[^.\n]*", re.I), " "),
    # Twitter embeds and handles
    (re.compile(r"pic\.twitter\.com/\S+", re.I), " "),
    (re.compile(r"—\s*[^—\n]{0,80}\(@\w+\)\s*\w+\s+\d{1,2},\s*\d{4}"), " "),
    (re.compile(r"@\w+"), " "),
    # Links
    (re.compile(r"https?://\S+|www\.\S+|\b\S+\.(?:com|org|net|co\.uk)/\S*", re.I), " "),
    # Title tags: (VIDEO), [VIDEO], (TWEETS), (IMAGES), WATCH:, BREAKING:
    (re.compile(r"[\[(]\s*(?:video|videos|tweets?|images?|photos?|audio|details|screenshots?)\s*[\])]", re.I), " "),
    (re.compile(r"\b(?:watch|breaking|just in|must see|update)\s*:", re.I), " "),
    # Apostrophes: Fake.csv lost them ("couldn t"), True.csv kept them.
    # Replace all with a space so both classes look the same.
    (re.compile(r"[’‘'`´]"), " "),
    # Quotes, control characters, repeated punctuation
    (re.compile(r"[“”\"]"), " "),
    (re.compile(r"[\x00-\x1f\x7f]"), " "),
]


def prepare_for_model(text) -> str:
    """Normalise any article text (training data or user input)."""
    text = "" if text is None or (isinstance(text, float) and pd.isna(text)) else str(text)
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# Kept for backward compatibility with older scripts
def clean_text(text) -> str:
    return prepare_for_model(text)


def load_raw_dataset(dataset_dir: Path) -> pd.DataFrame:
    fake_path = dataset_dir / "Fake.csv"
    true_path = dataset_dir / "True.csv"
    if not fake_path.exists() or not true_path.exists():
        raise FileNotFoundError(
            f"Expected {fake_path} and {true_path}. Put the datasets in ml/dataset/."
        )

    fake = pd.read_csv(fake_path)
    true = pd.read_csv(true_path)
    fake["label"] = 0
    true["label"] = 1
    data = pd.concat([fake, true], ignore_index=True)

    for column in ("title", "text"):
        if column not in data.columns:
            raise ValueError(f"Dataset is missing required column: {column}")
        data[column] = data[column].fillna("").map(prepare_for_model)

    # Drop title-only / near-empty articles (2.7% of Fake.csv has no body)
    data = data[data["text"].str.split().str.len() >= MIN_WORDS]

    # Many Fake.csv articles are reposted with a different title.
    # Deduplicate on the body so copies cannot land in both train and test.
    data = data.drop_duplicates(subset=["text"])

    data["content"] = (data["title"] + " " + data["text"]).str.strip()
    data = data[["content", "label"]].reset_index(drop=True)
    return data


def save_cleaned_dataset(data: pd.DataFrame, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    data.to_csv(output_path, index=False)
