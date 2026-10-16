import sys
from pathlib import Path

import pdfplumber


# Usage: python backend/test_layout.py [path/to/file.pdf]
DEFAULT_PDF = Path(__file__).resolve().parent / "Times of India_Delhi_20260910 (1).pdf"
pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF


if __name__ == "__main__":
    with pdfplumber.open(pdf_path) as pdf:

        for page_number, page in enumerate(pdf.pages[:2], start=1):

            print("\n==============================")
            print("PAGE:", page_number)
            print("==============================")

            text = page.extract_text(
                x_tolerance=2,
                y_tolerance=3,
                layout=True
            )

            if text:
                print(text[:5000])
