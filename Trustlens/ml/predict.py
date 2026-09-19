import joblib

# Load trained model
model = joblib.load("model.pkl")

# Load TF-IDF vectorizer
vectorizer = joblib.load("tfidf_vectorizer.pkl")

# Take news from user
news = input("Enter news: ")

# Convert news into TF-IDF numbers
news_tfidf = vectorizer.transform([news])

# Make prediction
prediction = model.predict(news_tfidf)[0]

# Get probabilities
probabilities = model.predict_proba(news_tfidf)[0]

# Probability of each class
fake_probability = probabilities[0] * 100
real_probability = probabilities[1] * 100

# Show result
if prediction == 0:
    print("\nPrediction: Fake News")
else:
    print("\nPrediction: Real News")

print(f"Fake Probability: {fake_probability:.2f}%")
print(f"Real Probability: {real_probability:.2f}%")