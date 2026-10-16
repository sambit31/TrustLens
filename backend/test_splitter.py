"""Quick manual check of the article splitter.

Usage (from the Trustlens folder or the backend folder):
    python backend/test_splitter.py [path/to/file.pdf]
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from article_splitter import split_articles  # noqa: E402

DEFAULT_PDF = Path(__file__).resolve().parent / "Times of India_Delhi_20260910 (1).pdf"

def main():
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF

    # split_articles needs the PDF itself (it uses layout information),
    # not text that was already extracted from it.
    articles = split_articles(pdf_path)

    print("Total articles detected:", len(articles))
    print("\n-----------------------------")

    for i, article in enumerate(articles[:10], start=1):
        print(f"\nARTICLE {i}  (page {article['page']}, {article['method']})")
        print("TITLE:")
        print(article["title"])
        print("\nTEXT:")
        print(article["text"][:300])
        print("\n-----------------------------")


if __name__ == "__main__":
    main()
