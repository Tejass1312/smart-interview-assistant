"""
debug_gemini.py
Run from backend folder: python debug_gemini.py
Uses NEW google-genai SDK (not google.generativeai)
"""

import os
from dotenv import load_dotenv
load_dotenv()

# ── Step 1: Check key ─────────────────────────────────────
key = os.getenv("GEMINI_API_KEY")
if not key:
    print("❌ GEMINI_API_KEY not found in .env")
    exit()
print(f"✅ Key loaded: {key[:8]}...{key[-4:]}")

# ── Step 2: Import NEW SDK ────────────────────────────────
print("\nImporting google-genai (new SDK)...")
try:
    from google import genai
    from google.genai import types
    print("✅ google-genai imported successfully")
except ImportError:
    print("❌ Not installed. Run: pip install google-genai")
    exit()

# ── Step 3: Create client ─────────────────────────────────
print("\nCreating client...")
try:
    client = genai.Client(api_key=key)
    print("✅ Client created")
except Exception as e:
    print(f"❌ Client error: {e}")
    exit()

# ── Step 4: Test gemini-2.5-flash ─────────────────────────
print("\nTesting gemini-2.5-flash...")
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello in one word.",
    )
    print(f"✅ SUCCESS! Gemini replied: {response.text.strip()}")
except Exception as e:
    print(f"❌ gemini-2.5-flash failed: {e}")

# ── Step 5: Test gemini-2.0-flash-lite (lightest model) ───
print("\nTesting gemini-2.0-flash-lite...")
try:
    response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents="Say hello in one word.",
    )
    print(f"✅ SUCCESS! Gemini replied: {response.text.strip()}")
except Exception as e:
    print(f"❌ gemini-2.0-flash-lite failed: {e}")