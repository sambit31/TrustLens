import pdfplumber


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"


with pdfplumber.open(pdf_path) as pdf:

    page = pdf.pages[1]   # Page 2

    words = page.extract_words()

    print("PAGE WIDTH:", page.width)
    print("PAGE HEIGHT:", page.height)

    print("\nFIRST 100 WORDS WITH COORDINATES:\n")

    for word in words[:100]:

        print(
            f"{word['text']:<30} "
            f"x0={word['x0']:.1f} "
            f"x1={word['x1']:.1f} "
            f"top={word['top']:.1f} "
            f"bottom={word['bottom']:.1f}"
        )