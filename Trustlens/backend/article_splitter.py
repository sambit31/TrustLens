import re


def clean_text(text):
    # Normalize line breaks
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Join words broken by PDF line breaks
    # Example:
    # govern-
    # ment
    # -> government
    text = re.sub(r"-\n(?=\w)", "", text)

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{2,}", "\n", text)

    return text.strip()


def is_probable_noise(line):
    line = line.strip()

    if not line:
        return True

    # Very short isolated lines are often page numbers,
    # dates, section labels, etc.
    if len(line) <= 2:
        return True

    # Page numbers
    if re.fullmatch(r"\d+", line):
        return True

    # Common PDF artifacts
    if re.fullmatch(r"[|•·\-_=]+", line):
        return True

    return False


def looks_like_headline(line):
    line = line.strip()

    if len(line) < 20:
        return False

    words = line.split()

    # A headline normally contains multiple words
    if len(words) < 4:
        return False

    # Don't treat long paragraphs as headlines
    if len(line) > 160:
        return False

    # Sentences ending with punctuation are more likely
    # to be article body text
    if line.endswith((".", ",", ";", ":")):
        return False

    # Email / URL-like lines
    if "@" in line:
        return False

    if "http://" in line.lower() or "https://" in line.lower():
        return False

    # Lines containing mostly numbers are unlikely to be headlines
    digit_count = sum(char.isdigit() for char in line)

    if digit_count > len(line) * 0.3:
        return False

    return True


def split_articles(text):

    text = clean_text(text)

    lines = text.split("\n")

    articles = []

    current_title = None
    current_text = []

    for line in lines:

        line = line.strip()

        if is_probable_noise(line):
            continue

        if looks_like_headline(line):

            # Save previous article
            if current_title and current_text:

                articles.append({
                    "title": current_title,
                    "text": " ".join(current_text)
                })

            # Start new article
            current_title = line
            current_text = []

        else:

            if current_title:
                current_text.append(line)

    # Save final article
    if current_title and current_text:

        articles.append({
            "title": current_title,
            "text": " ".join(current_text)
        })

    return articles