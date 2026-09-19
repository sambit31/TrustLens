import pandas as pd

# Load datasets
fake = pd.read_csv("dataset/Fake.csv")
real = pd.read_csv("dataset/True.csv")

# Add labels
fake["label"] = 0
real["label"] = 1

# Combine datasets
data = pd.concat([fake, real], ignore_index=True)

# Shuffle dataset
data = data.sample(frac=1, random_state=42).reset_index(drop=True)

# Combine title and text
data["content"] = data["title"] + " " + data["text"]

# Keep only required columns
data = data[["content", "label"]]

# Check missing values
print("\nMissing values:")
print(data.isnull().sum())

# Remove missing values
data = data.dropna()

# Remove duplicate articles
data = data.drop_duplicates()

# Final information
print("\nTotal articles after cleaning:", len(data))

print("\nFirst 5 rows:")
print(data.head())

print("\nLabel distribution:")
print(data["label"].value_counts())


data.to_csv("dataset/cleaned_news.csv", index=False)

print("\nCleaned dataset saved successfully!")