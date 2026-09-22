import pdfplumber


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"


with pdfplumber.open(pdf_path) as pdf:

    page = pdf.pages[1]

    words = page.extract_words()

    # Group words by their vertical position
    lines = {}

    for word in words:

        top = round(word["top"], 1)

        if top not in lines:
            lines[top] = []

        lines[top].append(word)

    print("PAGE SIZE:", page.width, "x", page.height)

    print("\nTEXT LINES:\n")

    for top in sorted(lines):

        line_words = sorted(
            lines[top],
            key=lambda word: word["x0"]
        )

        text = " ".join(
            word["text"]
            for word in line_words
        )

        min_x = min(word["x0"] for word in line_words)
        max_x = max(word["x1"] for word in line_words)

        print(
            f"Y={top:6.1f} | "
            f"X={min_x:6.1f}-{max_x:6.1f} | "
            f"{text}"
        )