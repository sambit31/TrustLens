from article_splitter import split_articles
from pypdf import PdfReader


pdf_path = "./Times of India_Delhi_20260910 (1).pdf"

reader = PdfReader(pdf_path)

text = ""

for page in reader.pages:

    page_text = page.extract_text()

    if page_text:
        text += page_text + "\n"


articles = split_articles(text)

print("Total articles detected:", len(articles))

print("\n-----------------------------")

for i, article in enumerate(articles[:10], start=1):

    print(f"\nARTICLE {i}")

    print("TITLE:")
    print(article["title"])

    print("\nTEXT:")
    print(article["text"][:300])

    print("\n-----------------------------")