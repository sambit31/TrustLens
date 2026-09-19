import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix

# Load cleaned dataset
data = pd.read_csv("dataset/cleaned_news.csv")

print("Dataset loaded successfully!")
print("Total articles:", len(data))

# Input
X = data["content"]

# Output
y = data["label"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining data:", len(X_train))
print("Testing data:", len(X_test))

# Create TF-IDF vectorizer
vectorizer = TfidfVectorizer(
    max_features=50000,
    stop_words="english"
)

# Convert training text into numbers
X_train_tfidf = vectorizer.fit_transform(X_train)

# Convert testing text into numbers
X_test_tfidf = vectorizer.transform(X_test)

print("\nTF-IDF completed!")
print("Training shape:", X_train_tfidf.shape)
print("Testing shape:", X_test_tfidf.shape)

# Create model
model = LogisticRegression(max_iter=1000)

# Train model
model.fit(X_train_tfidf, y_train)

print("\nModel training completed!")

# Make predictions on test data
y_pred = model.predict(X_test_tfidf)

print("\nPredictions completed!")
print(y_pred[:10])
# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nAccuracy:", accuracy)
print("Accuracy percentage:", accuracy * 100, "%")

# Calculate precision
precision = precision_score(y_test, y_pred)

# Calculate recall
recall = recall_score(y_test, y_pred)

# Calculate F1-score
f1 = f1_score(y_test, y_pred)

print("\nPrecision:", precision)
print("Recall:", recall)
print("F1 Score:", f1)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)


joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("\nModel saved successfully!")
print("TF-IDF vectorizer saved successfully!")