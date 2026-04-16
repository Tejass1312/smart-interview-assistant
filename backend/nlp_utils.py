"""
nlp_utils.py
────────────
spaCy-based semantic similarity scoring.
Kept separate from Gemini logic — each module does one job.
"""

import spacy

_nlp = None  # lazy-loaded

# ── Reference answers for all 15 questions ───────────────────────────────────
REFERENCE_ANSWERS = {
    # Frontend
    "fe_1": "null is an intentional absence of value assigned by developers, while undefined means a variable has been declared but not yet assigned. typeof null returns object which is a known bug, typeof undefined returns undefined. Use null when you want to explicitly indicate no value, undefined appears automatically for uninitialized variables.",
    "fe_2": "React reconciliation uses a virtual DOM diffing algorithm with two heuristics: elements of different types produce different trees, and the key prop identifies which items have changed. React compares the previous and current virtual DOM trees and only updates the real DOM nodes that changed. Keys should be stable unique IDs not array indexes to prevent unnecessary re-renders and state bugs.",
    "fe_3": "The Critical Rendering Path includes DOM construction, CSSOM construction, render tree, layout, and paint. To optimize Time to Interactive: use code splitting with lazy loading to reduce initial bundle size, defer non-critical JavaScript with async and defer attributes, preload critical resources using resource hints, minimize render-blocking CSS.",
    "fe_4": "CSS specificity is calculated as a tuple of inline styles, ID selectors, class and attribute selectors, and element selectors. #hero p has specificity 0,1,0,1 which beats .card > p at 0,0,1,1 and p[data-theme] at 0,0,1,1. The ID selector makes #hero p win.",
    "fe_5": "Use React DevTools Profiler to identify which components are re-rendering and why. Common causes include new object or function references on every render fixed with useMemo and useCallback, state updates too high in the tree fixed with state colocation, and context causing unnecessary re-renders.",

    # Backend
    "be_1": "SQL databases provide ACID transactions, strong consistency, and work well for relational data with complex queries. NoSQL databases offer horizontal scalability, flexible schemas, and high availability via BASE consistency. For a social media platform use a combination: PostgreSQL for accounts, Redis for caching, and a document store for posts and feeds.",
    "be_2": "REST uses fixed endpoints and HTTP methods making it simple to cache and understand. GraphQL uses a single endpoint with typed queries allowing clients to request exact data needed eliminating over-fetching. However GraphQL introduces N+1 query problems, harder HTTP caching, schema versioning overhead, and steeper learning curve.",
    "be_3": "Immediately revoke all active sessions and notify the user. Investigate logs for the password reset flow looking for CSRF vulnerabilities, weak token entropy, token reuse, or missing expiry. Preventions include CSRF tokens, short-lived single-use reset tokens, rate limiting, and comprehensive audit logging.",
    "be_4": "A distributed rate limiter needs shared state across instances. Use Redis with atomic Lua scripts for the token bucket or sliding window algorithm. The sliding window log stores timestamps in a Redis sorted set. Handle Redis failures with a fallback to allow traffic to avoid cascading failures.",
    "be_5": "A transaction groups operations that either all succeed or all fail. Isolation levels control concurrent change visibility. READ COMMITTED prevents dirty reads, REPEATABLE READ prevents non-repeatable reads, SERIALIZABLE prevents phantom reads. A phantom read example: transaction A queries orders, transaction B inserts a new order, transaction A queries again and sees a new row.",

    # AI / ML
    "ai_1": "Bias is error from wrong assumptions causing underfitting with high training and validation error. Variance is sensitivity to training data causing overfitting with low training error but high validation error. Diagnose with learning curves. Fix high bias with more complex models. Fix high variance with more data, regularization, or dropout.",
    "ai_2": "Accuracy is misleading with class imbalance. Investigate precision and recall for each class. Precision is true positives divided by predicted positives. Recall is true positives divided by actual positives. F1 is their harmonic mean. AUC-ROC shows performance across thresholds. Consider the cost of false positives versus false negatives.",
    "ai_3": "Transformers use self-attention to compute relationships between all tokens in parallel unlike RNNs which process sequentially. Self-attention computes query key value matrices. Positional encoding adds sequence order information. This parallelization enables training on larger datasets. RNNs suffer from vanishing gradients over long sequences.",
    "ai_4": "Model degradation is caused by data drift where input distribution changes or concept drift where relationships change. Build a monitoring pipeline tracking input distributions and prediction distributions. Use statistical tests like KL divergence to detect drift. Set up automated retraining triggers and shadow deployment.",
    "ai_5": "For limited labeled data first try few-shot prompting. If insufficient use LoRA or QLoRA fine-tuning which trains small adapter matrices keeping base model weights frozen. Generate synthetic training data using the base model. Consider RLHF with limited preference data. Monitor for catastrophic forgetting.",
}


def _get_nlp():
    """Lazy-load spaCy model."""
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def score_answer(question_id: str, user_answer: str, custom_reference: str = None) -> dict:
    """
    Score a single answer using spaCy cosine similarity.

    Args:
        question_id:       e.g. "fe_1" — used to look up reference answer
        user_answer:       the candidate's raw answer text
        custom_reference:  override reference answer (for legacy /evaluate route)

    Returns:
        {
            "score":        int 0–100,
            "spacy_score":  int 0–100,   (same value, kept for clarity)
            "word_count":   int,
        }
    """
    nlp = _get_nlp()

    if not user_answer or not user_answer.strip():
        return {"score": 0, "spacy_score": 0, "word_count": 0}

    reference = custom_reference or REFERENCE_ANSWERS.get(question_id, "")
    if not reference:
        # No reference available — score by word count only
        wc = len(user_answer.strip().split())
        score = min(50, wc)
        return {"score": score, "spacy_score": score, "word_count": wc}

    doc_user = nlp(user_answer.lower())
    doc_ref  = nlp(reference.lower())

    similarity  = doc_user.similarity(doc_ref)   # 0.0 – 1.0
    word_count  = len(user_answer.strip().split())
    depth_bonus = 10 if word_count >= 100 else 6 if word_count >= 60 else 2 if word_count >= 20 else 0

    raw   = round(similarity * 85) + depth_bonus
    score = max(0, min(100, raw))

    return {
        "score":       score,
        "spacy_score": score,
        "word_count":  word_count,
    }