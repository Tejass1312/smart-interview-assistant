import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { QUESTIONS } from '../data/questions';
import QuestionCard from '../components/QuestionCard';
import './Interview.css';

export default function Interview() {
  const navigate = useNavigate();
  const { selectedRole, answers, setAnswer, evaluate, isEvaluating } = useInterview();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const topRef = useRef(null);

  const questions = selectedRole ? QUESTIONS[selectedRole.id] : [];
  const total = questions.length;
  const answeredCount = questions.filter(q => (answers[q.id] || '').trim().length > 0).length;
  const progress = ((currentIndex) / total) * 100;
  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!selectedRole) navigate('/');
  }, [selectedRole, navigate]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentIndex]);

  const goTo = (idx) => {
    if (idx >= 0 && idx < total) setCurrentIndex(idx);
  };

  const handleSubmit = async () => {
    if (!confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    await evaluate(questions);
    navigate('/results');
  };

  if (!selectedRole) return null;

  const allAnswered = answeredCount === total;
  const unanswered = total - answeredCount;

  return (
    <main className="interview page" ref={topRef}>
      <div className="container--narrow">

        {/* ─── Header bar ─────────────────────────────── */}
        <div className="interview__header">
          <div className="interview__header-left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              ← Exit
            </button>
            <div className="interview__role-badge" style={{ background: selectedRole.colorDim, borderColor: `${selectedRole.color}30` }}>
              <span style={{ color: selectedRole.color }}>{selectedRole.icon}</span>
              <span style={{ color: selectedRole.color, fontWeight: 600 }}>{selectedRole.label}</span>
            </div>
          </div>

          <div className="interview__header-right">
            <span className="interview__answered">
              {answeredCount}/{total} answered
            </span>
          </div>
        </div>

        {/* ─── Progress ───────────────────────────────── */}
        <div className="interview__progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
          <div className="interview__step-dots">
            {questions.map((q, i) => {
              const isAnswered = (answers[q.id] || '').trim().length > 0;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  className={`interview__dot ${isCurrent ? 'interview__dot--current' : ''} ${isAnswered ? 'interview__dot--done' : ''}`}
                  onClick={() => goTo(i)}
                  title={`Q${i + 1}: ${q.category}`}
                />
              );
            })}
          </div>
        </div>

        {/* ─── Question Card ──────────────────────────── */}
        <div key={currentQ.id} className="interview__card-wrap animate-fade-up">
          <QuestionCard
            question={currentQ}
            index={currentIndex}
            total={total}
            value={answers[currentQ.id] || ''}
            onChange={(text) => setAnswer(currentQ.id, text)}
            isActive
          />
        </div>

        {/* ─── Navigation ─────────────────────────────── */}
        <div className="interview__nav">
          <button
            className="btn btn-secondary"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <div className="interview__nav-center">
            <span className="interview__counter">
              {currentIndex + 1} <span>of {total}</span>
            </span>
          </div>

          {currentIndex < total - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => goTo(currentIndex + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className={`btn btn-primary ${confirmSubmit ? 'btn--confirm' : ''}`}
              onClick={handleSubmit}
              disabled={isEvaluating}
            >
              {isEvaluating ? (
                <>
                  <span className="spinner" />
                  Evaluating…
                </>
              ) : confirmSubmit ? (
                '✓ Confirm Submit'
              ) : (
                'Submit →'
              )}
            </button>
          )}
        </div>

        {/* ─── Confirm warning ────────────────────────── */}
        {confirmSubmit && !isEvaluating && (
          <div className="interview__confirm animate-fade-up">
            <div className="interview__confirm-inner">
              {unanswered > 0 ? (
                <p>
                  <span className="interview__confirm-warn">⚠</span>
                  {' '}{unanswered} question{unanswered > 1 ? 's' : ''} unanswered.
                  {' '}Click Confirm to submit anyway.
                </p>
              ) : (
                <p>
                  <span className="interview__confirm-ok">✓</span>
                  {' '}All questions answered! Click Confirm to get your results.
                </p>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmSubmit(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ─── Evaluating overlay ─────────────────────── */}
        {isEvaluating && (
          <div className="interview__evaluating animate-fade-in">
            <div className="interview__eval-box">
              <div className="interview__eval-spinner" />
              <div className="interview__eval-text">
                <h3>Evaluating your answers</h3>
                <p>Our NLP model is analyzing depth, accuracy, and key concepts…</p>
              </div>
              <div className="interview__eval-items">
                {questions.map((q, i) => (
                  <div key={q.id} className="interview__eval-item" style={{ animationDelay: `${i * 200}ms` }}>
                    <span className="interview__eval-dot" />
                    <span>{q.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Question quick-nav ─────────────────────── */}
        <div className="interview__quicknav">
          <p className="interview__quicknav-label">Jump to question</p>
          <div className="interview__quicknav-grid">
            {questions.map((q, i) => {
              const isAnswered = (answers[q.id] || '').trim().length > 0;
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => goTo(i)}
                  className={`interview__qnav-btn ${isCurrent ? 'interview__qnav-btn--current' : ''} ${isAnswered ? 'interview__qnav-btn--done' : ''}`}
                >
                  <span className="interview__qnav-num">Q{i + 1}</span>
                  <span className="interview__qnav-cat">{q.category}</span>
                  {isAnswered && <span className="interview__qnav-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
