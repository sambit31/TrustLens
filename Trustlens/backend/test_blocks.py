import pdfplumber


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"


def get_lines(page):
    words = page.extract_words()

    lines = []

    # Group words that have almost the same Y position
    for word in words:

        added = False

        for line in lines:

            if abs(line["top"] - word["top"]) <= 2:

                line["words"].append(word)
                added = True
                break

        if not added:

            lines.append({
                "top": word["top"],
                "words": [word]
            })

    # Sort words inside every line
    for line in lines:

        line["words"].sort(
            key=lambda word: word["x0"]
        )

        line["text"] = " ".join(
            word["text"]
            for word in line["words"]
        )

        line["x0"] = min(
            word["x0"]
            for word in line["words"]
        )

        line["x1"] = max(
            word["x1"]
            for word in line["words"]
        )

    lines.sort(key=lambda line: line["top"])

    return lines


with pdfplumber.open(pdf_path) as pdf:

    page = pdf.pages[1]

    lines = get_lines(page)

    print("TOTAL LINES:", len(lines))

    print("\n==============================")
    print("PAGE 2 TEXT BLOCKS")
    print("==============================")

    current_block = []
    previous_x0 = None
    previous_x1 = None
    previous_y = None

    block_number = 1

    for line in lines:

        x0 = line["x0"]
        x1 = line["x1"]
        y = line["top"]

        # Start first block
        if not current_block:

            current_block.append(line)

        else:

            vertical_gap = y - previous_y

            x_difference = abs(x0 - previous_x0)

            # Same text region
            same_region = x_difference < 40

            # Normal line spacing
            close_vertically = vertical_gap < 20

            if same_region and close_vertically:

                current_block.append(line)

            else:

                if len(current_block) >= 3:

                    print(
                        f"\n--- BLOCK {block_number} ---"
                    )

                    print(
                        f"X: {current_block[0]['x0']:.1f}"
                        f" - "
                        f"{current_block[0]['x1']:.1f}"
                    )

                    print(
                        f"Y: {current_block[0]['top']:.1f}"
                        f" - "
                        f"{current_block[-1]['top']:.1f}"
                    )

                    for item in current_block:

                        print(item["text"])

                    block_number += 1

                current_block = [line]

        previous_x0 = x0
        previous_x1 = x1
        previous_y = y

    # Last block
    if len(current_block) >= 3:

        print(
            f"\n--- BLOCK {block_number} ---"
        )

        for item in current_block:

            print(item["text"])