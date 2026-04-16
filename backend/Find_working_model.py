"""
Run from backend folder: python find_working_model.py
Finds which Gemini model works with your current API key.
"""
import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
]

print("Testing all models...\n")
for model in MODELS:
    try:
        response = client.models.generate_content(
            model=model,
            contents="Say OK in one word.",
            config=types.GenerateContentConfig(max_output_tokens=10),
        )
        print(f"✅ WORKS: {model}  →  {response.text.strip()}")
    except Exception as e:
        err = str(e)[:80]
        print(f"❌ FAIL:  {model}  →  {err}")