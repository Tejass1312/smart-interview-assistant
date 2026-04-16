import { createContext, useContext, useState, useCallback } from 'react';
import { tokenHelper } from '../services/api';

const InterviewContext = createContext(null);

const API_BASE = 'http://localhost:5000';

export function InterviewProvider({ children }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [answers, setAnswers]           = useState({});
  const [results, setResults]           = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError]               = useState(null);

  const setAnswer = useCallback((questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  }, []);

  // ── Save result to MongoDB (non-blocking) ─────────────────
  const saveInterview = useCallback(async (role, score) => {
    const token = tokenHelper.get();
    if (!token) return; // skip if not logged in

    try {
      await fetch(`${API_BASE}/api/save-interview`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role, score }),
      });
      console.log('[Interview] Result saved to DB');
    } catch (err) {
      console.warn('[Interview] Could not save result:', err.message);
    }
  }, []);

  // ── Evaluate + auto-save ──────────────────────────────────
  const evaluate = useCallback(async (questions) => {
    setIsEvaluating(true);
    setError(null);

    const payload = {
      role:    selectedRole?.id,
      answers: questions.map(q => ({
        id:       q.id,
        question: q.question,
        answer:   answers[q.id] || '',
      })),
    };

    try {
      const response = await fetch(`${API_BASE}/api/evaluate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      const evaluated = questions.map(q => {
        const api = data.evaluated.find(e => e.id === q.id) || {};
        return {
          ...q,
          answer:              answers[q.id] || '',
          score:               api.score               ?? 0,
          feedback:            api.feedback            ?? 'No feedback returned.',
          strengths:           api.strengths           ?? [],
          weaknesses:          api.weaknesses          ?? [],
          suggestions:         api.suggestions         ?? [],
          key_concepts_missed: api.key_concepts_missed ?? [],
          interview_tip:       api.interview_tip       ?? '',
          word_count:          api.word_count          ?? 0,
          gemini_used:         api.gemini_used         ?? false,
        };
      });

      const final = {
        evaluated,
        overall:     data.overall,
        role:        selectedRole,
        gemini_used: data.gemini_used,
      };

      setResults(final);

      // Auto-save to MongoDB after successful evaluation
      await saveInterview(selectedRole?.id, data.overall);

      return final;

    } catch (err) {
      console.warn('Backend unavailable, using fallback:', err.message);
      setError('Could not reach the backend. Showing estimated scores.');

      const evaluated = questions.map(q => {
        const answer    = answers[q.id] || '';
        const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
        const score     = Math.min(100, Math.round(
          (wordCount >= 80 ? 50 : wordCount >= 40 ? 35 : wordCount >= 15 ? 20 : 5)
          + Math.random() * 20
        ));
        return {
          ...q,
          answer,
          score,
          feedback:            score >= 70 ? 'Good depth shown. (Offline estimate)' : 'Needs more detail. (Offline estimate)',
          strengths:           [],
          weaknesses:          ['Backend offline — start Flask to get AI feedback'],
          suggestions:         ['Run: python app.py in your backend folder'],
          key_concepts_missed: [],
          interview_tip:       'Structure answers as: definition, mechanism, example, trade-off.',
          word_count:          wordCount,
          gemini_used:         false,
        };
      });

      const overall = Math.round(evaluated.reduce((s, q) => s + q.score, 0) / evaluated.length);
      const final   = { evaluated, overall, role: selectedRole, gemini_used: false };
      setResults(final);
      return final;

    } finally {
      setIsEvaluating(false);
    }
  }, [answers, selectedRole, saveInterview]);

  const reset = useCallback(() => {
    setSelectedRole(null);
    setAnswers({});
    setResults(null);
    setIsEvaluating(false);
    setError(null);
  }, []);

  return (
    <InterviewContext.Provider value={{
      selectedRole, setSelectedRole,
      answers, setAnswer,
      results, isEvaluating,
      error, evaluate, reset,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used inside InterviewProvider');
  return ctx;
}