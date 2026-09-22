import pdfplumber


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"


def get_lines(page):

    words = page.extract_words()

    lines = []

    for word in words:

        found = False

        for line in lines:

            if abs(line["top"] - word["top"]) <= 2:

                line["words"].append(word)
                found = True
                break

        if not found:

            lines.append({
                "top": word["top"],
                "words": [word]
            })

    for line in lines:

        line["words"].sort(key=lambda w: w["x0"])

        line["text"] = " ".join(
            w["text"] for w in line["words"]
        )

        line["x0"] = min(w["x0"] for w in line["words"])
        line["x1"] = max(w["x1"] for w in line["words"])

    lines.sort(key=lambda x: x["top"])

    return lines


with pdfplumber.open(pdf_path) as pdf:

    page = pdf.pages[1]

    lines = get_lines(page)

    print("\nPAGE 2 FLOW\n")

    previous = None

    for i, line in enumerate(lines):

        if previous:

            gap = line["top"] - previous["top"]

        else:

            gap = 0

        print(
            f"{i:3} | "
            f"Y={line['top']:6.1f} | "
            f"X={line['x0']:6.1f}-{line['x1']:6.1f} | "
            f"GAP={gap:5.1f} | "
            f"{line['text']}"
        )

        previous = line