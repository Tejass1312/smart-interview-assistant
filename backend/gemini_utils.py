"""
gemini_utils.py
Gemini AI feedback using google-genai SDK.
Tries multiple models in order if one is unavailable.
Install: pip install google-genai
"""

import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_client = None

# Models tried in order — first available wins
MODELS = [
    "gemini-2.5-flash-lite",   # Only model with free quota on this key
]


def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise EnvironmentError("GEMINI_API_KEY not found in .env file.")
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def _build_prompt(role, question, answer, spacy_score):
    safe_answer = answer.strip() if answer.strip() else "No answer provided"
    example = '{"ai_feedback": "Good answer.", "strengths": ["Clear"], "weaknesses": ["Missing examples"], "suggestions": ["Add code example"], "key_concepts_missed": ["typeof"], "interview_tip": "Use examples."}'
    return (
        f"You are a senior {role} engineer evaluating a technical interview answer.\n\n"
        f"QUESTION: {question}\n\n"
        f"CANDIDATE ANSWER: {safe_answer}\n\n"
        f"NLP SCORE: {spacy_score}/100\n\n"
        f"Return ONLY a raw JSON object with no markdown, no code fences, no text before or after.\n"
        f"Required keys: ai_feedback (string), strengths (array), weaknesses (array), "
        f"suggestions (array), key_concepts_missed (array), interview_tip (string).\n\n"
        f"Example output: {example}"
    )


def _try_generate(client, prompt):
    """Try each model in order, return (response_text, model_used) or raise."""
    last_error = None
    for model in MODELS:
        try:
            print(f"[Gemini] Trying {model}...")
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=2048,
                ),
            )
            print(f"[Gemini] Success with {model}")
            return response.text.strip(), model
        except Exception as e:
            print(f"[Gemini] {model} failed: {type(e).__name__}: {str(e)[:120]}")
            last_error = e
    raise last_error


def get_gemini_feedback(role, question, answer, spacy_score):
    fallback = _build_fallback(spacy_score)

    try:
        client = _get_client()
        prompt = _build_prompt(role, question, answer, spacy_score)

        raw_text, model_used = _try_generate(client, prompt)

        print(f"[Gemini] Raw response: {raw_text[:200]}")

        # Strip markdown fences
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text, flags=re.MULTILINE)
        raw_text = re.sub(r'\s*```\s*$', '', raw_text, flags=re.MULTILINE)
        raw_text = raw_text.strip()

        # Extract JSON object if there's extra text around it
        match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)

        parsed = json.loads(raw_text)

        for key in ["ai_feedback", "strengths", "weaknesses", "suggestions",
                    "key_concepts_missed", "interview_tip"]:
            if key not in parsed:
                parsed[key] = fallback.get(key, "")

        parsed["gemini_used"] = True
        parsed["model_used"] = model_used
        print(f"[Gemini] SUCCESS - gemini_used: True, model: {model_used}")
        return parsed

    except EnvironmentError as e:
        print(f"[Gemini] Config error: {e}")
        return {**fallback, "error": str(e)}

    except json.JSONDecodeError as e:
        print(f"[Gemini] JSON parse error: {e}")
        print(f"[Gemini] Raw text was: {raw_text[:300]}")
        return fallback

    except Exception as e:
        import traceback
        print(f"[Gemini] All models failed: {type(e).__name__}: {e}")
        print(traceback.format_exc())
        return fallback


def _build_fallback(spacy_score):
    if spacy_score >= 75:
        feedback = "Strong answer with good technical coverage. Gemini feedback unavailable."
        strengths = ["Good semantic alignment with expected answer", "Sufficient depth shown"]
        suggestions = ["Add a concrete code example to strengthen further"]
    elif spacy_score >= 45:
        feedback = "Partial answer. Key concepts may be missing. Gemini feedback unavailable."
        strengths = ["Some relevant concepts mentioned"]
        suggestions = ["Expand on core mechanisms", "Include a real-world example"]
    else:
        feedback = "Answer needs improvement. Gemini feedback unavailable."
        strengths = []
        suggestions = ["Review the core concept", "Structure: definition, mechanism, example, trade-off"]

    return {
        "ai_feedback":         feedback,
        "strengths":           strengths,
        "weaknesses":          ["Gemini API unavailable for detailed analysis"],
        "suggestions":         suggestions,
        "key_concepts_missed": [],
        "interview_tip":       "Practice structuring answers: definition, example, trade-off.",
        "gemini_used":         False,
    }