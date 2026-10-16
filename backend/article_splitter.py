"""
Newspaper / document PDF article splitter.

Strategy (layout-aware, not tied to any specific newspaper):

1. Read every text line on a page with its bounding box and font size
   (PyMuPDF keeps lines inside their own column, so text from
   neighbouring columns is never glued together).
2. Estimate the page's body-text font size (the most common size).
3. Lines set clearly larger than body text are headline lines.
   Nearby headline lines are merged into headline blocks.
4. Each headline "owns" the body-sized text below it, within its own
   horizontal span, until another headline starts underneath.
5. Body lines are read column by column (left to right, top to bottom)
   and de-hyphenated.

Pages without any usable headline fall back to one article per page,
so ordinary (non-newspaper) PDFs still work.
"""

from __future__ import annotations

import re
from collections import Counter

import pymupdf


# ============================================================
# TUNING CONSTANTS
# ============================================================

HEADLINE_RATIO = 1.35       # headline font >= body font * ratio
BODY_SIZE_TOLERANCE = 0.25  # body lines within +-25% of body size
MIN_ARTICLE_WORDS = 40      # drop fragments shorter than this
X_TOLERANCE = 12            # points of slack around a headline's width
COLUMN_BREAK_GAP = 4.0      # vertical gap (in body line heights) that ends a column


# ============================================================
# TEXT HELPERS
# ============================================================

def clean_text(text: str) -> str:
    text = text.replace("\u00ad", "")  # soft hyphens
    text = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", text)  # control characters
    text = re.sub(r"[ \t\u00a0]+", " ", text)
    return text.strip()


def join_lines(lines: list[str]) -> str:
    """Join lines, removing end-of-line hyphenation ("gov- ernment")."""
    out = ""
    for line in lines:
        line = clean_text(line)
        if not line:
            continue
        if out.endswith("-") and line[:1].islower():
            out = out[:-1] + line
        elif out:
            out += " " + line
        else:
            out = line
    return out.strip()


def is_meaningful_title(text: str) -> bool:
    letters = sum(ch.isalpha() for ch in text)
    return letters >= 6 and len(text.split()) >= 2


# ============================================================
# LINE EXTRACTION
# ============================================================

def get_page_lines(page) -> list[dict]:
    data = page.get_text("dict", flags=pymupdf.TEXTFLAGS_TEXT)
    lines = []

    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue

        for line in block.get("lines", []):
            # Skip rotated / vertical text (sidebars, watermarks)
            direction = line.get("dir", (1, 0))
            if abs(direction[0] - 1) > 0.05:
                continue

            spans = [s for s in line.get("spans", []) if s["text"].strip()]
            if not spans:
                continue

            text = clean_text("".join(s["text"] for s in line["spans"]))
            if not text:
                continue

            # Font size weighted by characters
            total = sum(len(s["text"].strip()) for s in spans)
            size = sum(s["size"] * len(s["text"].strip()) for s in spans) / total

            x0, y0, x1, y1 = line["bbox"]
            lines.append({
                "text": text,
                "size": size,
                "x0": x0, "y0": y0, "x1": x1, "y1": y1,
            })

    return lines


def estimate_body_size(lines: list[dict]) -> float | None:
    counter: Counter = Counter()
    for line in lines:
        counter[round(line["size"] * 2) / 2] += len(line["text"])
    if not counter:
        return None
    return counter.most_common(1)[0][0]


# ============================================================
# HEADLINE BLOCKS
# ============================================================

def horizontal_overlap(a0, a1, b0, b1) -> float:
    return max(0.0, min(a1, b1) - max(a0, b0))


def is_drop_cap(line: dict, body_size: float) -> bool:
    """A single oversized letter that starts an article's first paragraph."""
    return (
        line["size"] >= body_size * HEADLINE_RATIO
        and len(line["text"]) <= 2
        and line["text"][:1].isalpha()
    )


def attach_drop_caps(lines: list[dict], body_size: float) -> list[dict]:
    """Glue drop-cap letters onto the body line they belong to."""
    caps = [l for l in lines if is_drop_cap(l, body_size)]
    rest = [l for l in lines if not is_drop_cap(l, body_size)]

    for cap in caps:
        candidates = [
            l for l in rest
            if cap["y0"] - body_size * 1.5 <= l["y0"] <= cap["y1"]
            and -body_size <= l["x0"] - cap["x1"] < body_size * 3
        ]
        if candidates:
            first = min(candidates, key=lambda l: (l["y0"], l["x0"]))
            # "A" + "Greek woman..." needs a space; "M" + "aharashtra" does not
            separator = " " if first["text"][:1].isupper() else ""
            first["text"] = cap["text"] + separator + first["text"]

    return rest


def build_headline_blocks(lines: list[dict], body_size: float) -> list[dict]:
    head_lines = [
        line for line in lines
        if line["size"] >= body_size * HEADLINE_RATIO
    ]
    head_lines.sort(key=lambda l: (l["y0"], l["x0"]))

    blocks: list[dict] = []

    for line in head_lines:
        target = None
        for block in blocks:
            last = block["lines"][-1]
            gap = line["y0"] - block["y1"]
            overlap = horizontal_overlap(line["x0"], line["x1"], block["x0"], block["x1"])
            same_row = abs(line["y0"] - last["y0"]) < 3
            adjacent_x = 0 <= line["x0"] - last["x1"] < line["size"] * 1.5
            if (overlap > 0 and -2 <= gap < line["size"] * 0.9) or (same_row and adjacent_x):
                target = block
                break

        if target is None:
            blocks.append({
                "lines": [line],
                "x0": line["x0"], "y0": line["y0"],
                "x1": line["x1"], "y1": line["y1"],
            })
        else:
            target["lines"].append(line)
            target["x0"] = min(target["x0"], line["x0"])
            target["x1"] = max(target["x1"], line["x1"])
            target["y0"] = min(target["y0"], line["y0"])
            target["y1"] = max(target["y1"], line["y1"])

    for block in blocks:
        block["lines"].sort(key=lambda l: (round(l["y0"]), l["x0"]))
        max_size = max(l["size"] for l in block["lines"])
        title_lines = [l["text"] for l in block["lines"] if l["size"] >= max_size * 0.8]
        deck_lines = [l["text"] for l in block["lines"] if l["size"] < max_size * 0.8]
        block["title"] = join_lines(title_lines)
        block["deck"] = join_lines(deck_lines)

    return [b for b in blocks if is_meaningful_title(b["title"])]


# ============================================================
# BODY ASSIGNMENT
# ============================================================

def region_bottom(block: dict, blocks: list[dict], page_height: float) -> float:
    bottom = page_height
    for other in blocks:
        if other is block or other["y0"] < block["y1"] - 2:
            continue
        overlap = horizontal_overlap(block["x0"], block["x1"], other["x0"], other["x1"])
        narrower = min(block["x1"] - block["x0"], other["x1"] - other["x0"]) or 1
        if overlap / narrower > 0.3:
            bottom = min(bottom, other["y0"])
    return bottom


def read_columns(lines: list[dict], body_size: float) -> tuple[str, int]:
    """Order lines column by column and cut columns at large gaps."""
    if not lines:
        return "", 0

    columns: list[list[dict]] = []
    for line in sorted(lines, key=lambda l: l["x0"]):
        for column in columns:
            if abs(column[0]["x0"] - line["x0"]) <= body_size * 2:
                column.append(line)
                break
        else:
            columns.append([line])

    columns.sort(key=lambda c: min(l["x0"] for l in c))
    ordered: list[str] = []
    max_gap = body_size * 1.3 * COLUMN_BREAK_GAP

    for column in columns:
        column.sort(key=lambda l: l["y0"])
        previous = None
        for line in column:
            if previous is not None and line["y0"] - previous["y1"] > max_gap:
                break  # unrelated content further down the page
            ordered.append(line["text"])
            previous = line

    return join_lines(ordered), len(columns)


def analyze_page(page) -> list[dict]:
    lines = get_page_lines(page)
    body_size = estimate_body_size(lines)
    if body_size is None:
        return []

    lines = attach_drop_caps(lines, body_size)
    blocks = build_headline_blocks(lines, body_size)
    body_lines = [
        l for l in lines
        if abs(l["size"] - body_size) <= body_size * BODY_SIZE_TOLERANCE
    ]

    for block in blocks:
        block["bottom"] = region_bottom(block, blocks, page.rect.height)
        block["body"] = []

    # Give each body line to the closest headline above it.
    for line in body_lines:
        center = (line["x0"] + line["x1"]) / 2
        best = None
        for block in blocks:
            if not (block["x0"] - X_TOLERANCE <= center <= block["x1"] + X_TOLERANCE):
                continue
            if not (block["y1"] - 2 <= line["y0"] < block["bottom"]):
                continue
            if best is None or block["y1"] > best["y1"]:
                best = block
        if best is not None:
            best["body"].append(line)

    articles = []
    for block in blocks:
        body, column_count = read_columns(block["body"], body_size)
        if block["deck"]:
            body = f"{block['deck']} {body}".strip()
        if len(body.split()) < MIN_ARTICLE_WORDS:
            continue

        xs = [block["x0"], block["x1"]] + [l["x0"] for l in block["body"]] + [l["x1"] for l in block["body"]]
        ys = [block["y1"]] + [l["y1"] for l in block["body"]]
        articles.append({
            "title": block["title"],
            "text": body,
            "method": "layout",
            "bbox": [round(min(xs), 1), round(block["y0"], 1), round(max(xs), 1), round(max(ys), 1)],
            "column_count": column_count,
            "line_count": len(block["body"]),
        })

    # Fallback: page with text but no recognisable headlines
    if not articles:
        ordered = sorted(lines, key=lambda l: (l["y0"], l["x0"]))
        page_text = join_lines([l["text"] for l in ordered])
        if len(page_text.split()) >= MIN_ARTICLE_WORDS:
            first = next((l["text"] for l in ordered if is_meaningful_title(l["text"])), "Untitled page")
            articles.append({
                "title": first[:160],
                "text": page_text,
                "method": "page_fallback",
                "bbox": None,
                "column_count": None,
                "line_count": len(lines),
            })

    return articles


# ============================================================
# DUPLICATE REMOVAL
# ============================================================

def normalize_for_comparison(text: str) -> str:
    return re.sub(r"\W+", " ", text.lower()).strip()


def remove_duplicates(articles: list[dict]) -> list[dict]:
    unique, seen = [], set()
    for article in articles:
        key = normalize_for_comparison(article["title"] + " " + article["text"][:200])
        if key and key not in seen:
            seen.add(key)
            unique.append(article)
    return unique


# ============================================================
# PUBLIC API
# ============================================================

def open_pdf(pdf_source):
    """Open a PDF from a file path or raw bytes."""
    if isinstance(pdf_source, (bytes, bytearray)):
        return pymupdf.open(stream=bytes(pdf_source), filetype="pdf")
    return pymupdf.open(str(pdf_source))


def extract_full_text(pdf_source) -> str:
    """Plain text of the whole PDF (path or bytes)."""
    with open_pdf(pdf_source) as doc:
        return "\n".join(page.get_text("text") for page in doc).strip()


def split_articles(pdf_source) -> list[dict]:
    """Split a PDF (file path or raw bytes) into article dictionaries."""
    all_articles = []
    with open_pdf(pdf_source) as doc:
        for page_number, page in enumerate(doc, start=1):
            for article in analyze_page(page):
                article["page"] = page_number
                all_articles.append(article)
    return remove_duplicates(all_articles)
