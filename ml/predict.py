"""Command-line prediction using the trained TrustLens pipeline."""
from pathlib import Path
import joblib

from preprocessing import prepare_for_model

ROOT = Path(__file__).resolve().parent
model = joblib.load(ROOT / "artifacts" / "trustlens_pipeline.joblib")

news = prepare_for_model(input("Enter news: "))
if not news:
    raise SystemExit("Please enter some text.")

prediction = int(model.predict([news])[0])
probabilities = model.predict_proba([news])[0]
classes = list(model.classes_)
real_probability = float(probabilities[classes.index(1)])
fake_probability = float(probabilities[classes.index(0)])

if max(fake_probability, real_probability) < 0.70:
    result = "Uncertain"
elif prediction == 0:
    result = "Likely Fake"
else:
    result = "Likely Real"

print(f"\nModel signal: {result}")
print(f"Fake-class probability: {fake_probability * 100:.2f}%")
print(f"Real-class probability: {real_probability * 100:.2f}%")
print("Note: this is a text-classification signal, not independent fact verification.")
