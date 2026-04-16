"""
app.py
──────
Smart Interview Assistant — Flask Backend
Hybrid evaluation: spaCy similarity score + Gemini AI feedback
"""
import os
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from dotenv import load_dotenv

from nlp_utils import score_answer, REFERENCE_ANSWERS
from gemini_utils import get_gemini_feedback
from auth_routes import auth_bp, bcrypt
from db import db  # your existing MongoDB connection

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── JWT & Auth ────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
JWTManager(app)
bcrypt.init_app(app)
app.register_blueprint(auth_bp, url_prefix='/api')


# ── Health check ──────────────────────────────────────────
@app.route("/")
def home():
    return "Smart Interview Assistant Backend Running 🚀"


# ── Get questions ─────────────────────────────────────────
@app.route("/get-questions", methods=["POST"])
def get_questions():
    role = request.json.get("role", "")
    QUESTIONS = {
        "frontend": [
            {"id": "fe_1", "question": "What is the difference between null and undefined in JavaScript?"},
            {"id": "fe_2", "question": "How does React reconciliation work and what does the key prop do?"},
            {"id": "fe_3", "question": "Describe the Critical Rendering Path and how to optimize Time to Interactive."},
            {"id": "fe_4", "question": "What is CSS Specificity? How does the browser resolve selector conflicts?"},
            {"id": "fe_5", "question": "A React component is re-rendering 60+ times per second. How do you debug this?"},
        ],
        "backend": [
            {"id": "be_1", "question": "Compare SQL and NoSQL databases. For a social media platform with 10M users, which would you choose?"},
            {"id": "be_2", "question": "Explain REST vs GraphQL and the real trade-offs between them."},
            {"id": "be_3", "question": "A user reports their password was reset without their knowledge. Describe your incident response."},
            {"id": "be_4", "question": "Design the data model and API for a distributed rate limiter across multiple server instances."},
            {"id": "be_5", "question": "What happens inside a database during a transaction? Explain isolation levels and phantom reads."},
        ],
        "ai": [
            {"id": "ai_1", "question": "Explain the bias-variance tradeoff. How do you diagnose and fix each?"},
            {"id": "ai_2", "question": "You trained a classifier with 95% accuracy but stakeholders are unhappy. What metrics do you investigate?"},
            {"id": "ai_3", "question": "Describe the Transformer architecture. Why did attention replace RNNs?"},
            {"id": "ai_4", "question": "Your model degrades 2 weeks after deployment. What is happening and how do you fix it?"},
            {"id": "ai_5", "question": "How would you fine-tune a large language model for a domain-specific task with limited labeled data?"},
        ],
    }
    return jsonify(QUESTIONS.get(role, []))


# ── Legacy single evaluate ────────────────────────────────
@app.route("/evaluate", methods=["POST"])
def evaluate_single():
    data           = request.get_json()
    user_answer    = data.get("answer", "")
    correct_answer = data.get("correct_answer", "")
    question_text  = data.get("question", "")
    role           = data.get("role", "general")

    if not correct_answer:
        return jsonify({"error": "No reference answer provided"}), 400

    nlp_result  = score_answer("custom", user_answer, custom_reference=correct_answer)
    spacy_score = nlp_result["score"]
    gemini      = get_gemini_feedback(role, question_text or correct_answer, user_answer, spacy_score)

    return jsonify({
        "score":               round(spacy_score / 10, 2),
        "score_100":           spacy_score,
        "feedback":            gemini["ai_feedback"],
        "strengths":           gemini["strengths"],
        "weaknesses":          gemini["weaknesses"],
        "suggestions":         gemini["suggestions"],
        "key_concepts_missed": gemini["key_concepts_missed"],
        "interview_tip":       gemini["interview_tip"],
        "gemini_used":         gemini["gemini_used"],
    })


# ── Evaluate ALL answers ──────────────────────────────────
@app.route("/api/evaluate", methods=["POST"])
def evaluate_all():
    data    = request.get_json()
    role    = data.get("role", "general")
    answers = data.get("answers", [])

    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    evaluated  = []
    any_gemini = False

    for item in answers:
        qid          = item.get("id", "")
        question_txt = item.get("question", "")
        user_answer  = item.get("answer", "")

        nlp_result  = score_answer(question_id=qid, user_answer=user_answer)
        spacy_score = nlp_result["score"]
        word_count  = nlp_result["word_count"]
        gemini      = get_gemini_feedback(role, question_txt, user_answer, spacy_score)

        if gemini["gemini_used"]:
            any_gemini = True

        evaluated.append({
            "id":                  qid,
            "score":               spacy_score,
            "feedback":            gemini["ai_feedback"],
            "strengths":           gemini["strengths"],
            "weaknesses":          gemini["weaknesses"],
            "suggestions":         gemini["suggestions"],
            "key_concepts_missed": gemini["key_concepts_missed"],
            "interview_tip":       gemini["interview_tip"],
            "word_count":          word_count,
            "gemini_used":         gemini["gemini_used"],
        })

    overall = round(sum(e["score"] for e in evaluated) / len(evaluated))

    return jsonify({
        "overall":     overall,
        "gemini_used": any_gemini,
        "evaluated":   evaluated,
    })


# ── NEW: Save interview result ────────────────────────────
@app.route("/api/save-interview", methods=["POST"])
@jwt_required()
def save_interview():
    """
    Saves a completed interview for the logged-in user.

    Request:  { "role": "frontend", "score": 74 }
    Response: { "message": "Interview saved successfully", "id": "..." }
    """
    current_user = get_jwt_identity()   # email from JWT
    data         = request.get_json()
    role         = data.get("role")
    score        = data.get("score")

    if not role or score is None:
        return jsonify({"error": "role and score are required"}), 400

    if not isinstance(score, (int, float)) or not (0 <= score <= 100):
        return jsonify({"error": "score must be between 0 and 100"}), 400

    interview_doc = {
        "userId": current_user,
        "role":   role,
        "score":  round(score),
        "date":   datetime.now(timezone.utc).isoformat(),
    }

    try:
        result = db["interviews"].insert_one(interview_doc)
        print(f"[DB] Interview saved for {current_user} — role: {role}, score: {score}")
        return jsonify({
            "message": "Interview saved successfully",
            "id":      str(result.inserted_id),
        }), 201

    except Exception as e:
        print(f"[DB] Save error: {e}")
        return jsonify({"error": "Failed to save interview"}), 500


# ── VIP test route ────────────────────────────────────────
@app.route("/api/vip-area", methods=["GET"])
@jwt_required()
def vip_area():
    current_user = get_jwt_identity()
    return jsonify({"message": "Welcome to the VIP area!", "user": current_user}), 200
# ── NEW: Get user interview history ──────────────────────
# Add this route to your existing app.py

@app.route("/api/user-history", methods=["GET"])
@jwt_required()
def user_history():
    """
    Returns all interviews for the logged-in user.

    Response:
    {
        "total":        5,
        "average_score": 68,
        "interviews": [
            {
                "id":    "...",
                "role":  "frontend",
                "score": 74,
                "date":  "2026-04-09T10:30:00+00:00"
            },
            ...
        ]
    }
    """
    current_user = get_jwt_identity()

    try:
        interviews_cursor = db["interviews"].find(
            {"userId": current_user},
            {"_id": 1, "role": 1, "score": 1, "date": 1}
        ).sort("date", -1)  # newest first

        interviews = []
        for doc in interviews_cursor:
            interviews.append({
                "id":    str(doc["_id"]),
                "role":  doc.get("role", "unknown"),
                "score": doc.get("score", 0),
                "date":  doc.get("date", ""),
            })

        total         = len(interviews)
        average_score = round(
            sum(i["score"] for i in interviews) / total
        ) if total > 0 else 0

        return jsonify({
            "total":         total,
            "average_score": average_score,
            "interviews":    interviews,
        }), 200

    except Exception as e:
        print(f"[DB] user_history error: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500


if __name__ == "__main__":
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port)