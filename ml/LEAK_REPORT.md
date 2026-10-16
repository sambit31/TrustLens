# Dataset leak fix (Upgrade 1)

## Problem

The ISOT dataset (`Fake.csv` / `True.csv`) contains formatting artifacts
that reveal the label without reading the article.

| Artifact | Fake % | True % |
|---|---|---|
| Starts with `CITY (Reuters) -` dateline | 0.0 | 98.5 |
| Mentions "Reuters" anywhere | 1.4 | 99.8 |
| "Featured image via ..." | 34.8 | 0.0 |
| Twitter embeds / @handles | 26.1 | 1.3 |
| Title tags such as (VIDEO), WATCH | 31.5 | 0.0 |
| Image credits (Getty, "Photo by", via YouTube) | 22.9 | 0.0 |
| Broken apostrophes ("couldn t") | 62.6 | 8.1 |
| Articles with an empty body | 2.7 | 0.0 |
| Duplicate article bodies | 6,026 | 225 |

**Proof:** a logistic regression given only 9 yes/no checks for these
artifacts, and no article words at all, scored **99.80%** accuracy,
higher than the original TF-IDF model (98.93%).

The original model's most important "real" word was `reuters`, and its
top "fake" words included `featured image` and `getty images`.
Adding `WASHINGTON (Reuters) -` to a made-up sentence raised its
"real" probability from 59.4% to 99.6%.

## Fix

`ml/preprocessing.py -> prepare_for_model()` removes agency datelines
and names, image credits, Twitter embeds, links, title tags, and
normalises apostrophes. Articles with fewer than 20 words are dropped,
and duplicate bodies are removed so copies cannot appear in both the
training and the test set.

The same function is used in training, `evaluate.py`, `predict.py`
and the backend, so user input is cleaned exactly like training data.

## Results

| | Before | After |
|---|---|---|
| Artifact-only model accuracy | 99.80% | 74.93% (chance: 55.08%) |
| TF-IDF model accuracy | 98.93% | 97.99% |
| F1 | 99.01% | 98.18% |
| Effect of adding a Reuters dateline | 59.4% → 99.6% real | 20.9% → 20.9% real |
| Articles used | 39,094 | 38,015 |

The remaining artifact-only signal (74.93%) comes from contractions,
which fake articles use far more often. That is a genuine
writing-style difference (informal blogs vs formal wire reports), so
it is kept.

## Remaining limitation

Every "real" article comes from a single source (Reuters, 2016-2017,
mostly US politics). The model therefore learns "sounds like a formal
wire report" rather than "is true". For example, the made-up sentence
"Aliens have secretly replaced the moon with a hologram, officials said
on Tuesday" still scores 93% real because of "officials said on
Tuesday". This cannot be fixed by cleaning; it needs more diverse data
(Upgrade 3) and evidence-based fact checking (Upgrade 7).
