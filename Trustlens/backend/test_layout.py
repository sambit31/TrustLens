import pdfplumber


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"


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