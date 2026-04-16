import { useState } from 'react';
import { DIFFICULTY_COLOR } from '../data/questions';
import './ResultCard.css';

export default function ResultCard({ result, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const diff = DIFFICULTY_COLOR[result.difficulty] || { color: '#8a9ab5', bg: 'rgba(138,154,181,0.1)' };

  const scoreColor =
    result.score >= 70 ? 'var(--success)' :
    result.score >= 40 ? 'var(--warning)' :
                         'var(--danger)';

  const scoreLabel =
    result.score >= 70 ? 'Strong' :
    result.score >= 40 ? 'Developing' :
                         'Needs Work';

  return (
    <div className={`rcard ${expanded ? 'rcard--expanded' : ''}`}>

      {/* ── Trigger row ─────────────────────────────────── */}
      <button className="rcard__trigger" onClick={() => setExpanded(v => !v)}>
        <div className="rcard__trigger-left">
          <div className="rcard__num">{String(index + 1).padStart(2, '0')}</div>
          <div className="rcard__title-group">
            <p className="rcard__category">{result.category}</p>
            <p className="rcard__question-preview">
              {result.question?.length > 90
                ? result.question.slice(0, 90) + '…'
                : result.question}
            </p>
          </div>
        </div>

        <div className="rcard__trigger-right">
          <div className="rcard__score-badge" style={{
            color: scoreColor,
            borderColor: `${scoreColor}40`,
            background: `${scoreColor}12`,
          }}>
            <span className="rcard__score-num">{result.score}</span>
            <span className="rcard__score-slash">/100</span>
          </div>
          <span className="tag rcard__label-tag" style={{
            color: scoreColor,
            background: `${scoreColor}12`,
            borderColor: `${scoreColor}33`,
          }}>
            {scoreLabel}
          </span>
          {result.gemini_used && (
            <span className="rcard__gemini-badge" title="Evaluated by Gemini AI">✦ AI</span>
          )}
          <svg
            className={`rcard__chevron ${expanded ? 'rcard__chevron--open' : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ── Expanded body ────────────────────────────────── */}
      {expanded && (
        <div className="rcard__body animate-fade-up">

          {/* Score bar */}
          <div className="rcard__section">
            <div className="rcard__meta-row">
              <span className="tag" style={{
                background: diff.bg, color: diff.color, borderColor: `${diff.color}33`
              }}>
                {result.difficulty}
              </span>
              <div className="rcard__score-bar-wrap">
                <div className="progress-track" style={{ width: 160 }}>
                  <div className="progress-fill" style={{
                    width: `${result.score}%`,
                    background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}aa)`,
                  }} />
                </div>
                <span style={{ color: scoreColor, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
                  {result.score}%
                </span>
              </div>
              {result.word_count > 0 && (
                <span className="rcard__wordcount">{result.word_count} words</span>
              )}
            </div>
          </div>

          {/* Your answer */}
          {result.answer && (
            <div className="rcard__section">
              <div className="rcard__section-label">Your Answer</div>
              <div className="rcard__answer-box">{result.answer}</div>
            </div>
          )}

          {/* AI Feedback */}
          <div className="rcard__section">
            <div className="rcard__section-label">
              {result.gemini_used ? '✦ Gemini AI Feedback' : 'Feedback'}
            </div>
            <p className="rcard__feedback">{result.feedback}</p>
          </div>

          {/* Strengths + Weaknesses side by side */}
          {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
            <div className="rcard__section rcard__sw-grid">
              {result.strengths?.length > 0 && (
                <div className="rcard__sw-col rcard__sw-col--strength">
                  <div className="rcard__section-label">Strengths</div>
                  <ul className="rcard__bullet-list">
                    {result.strengths.map((s, i) => (
                      <li key={i}>
                        <span className="rcard__bullet rcard__bullet--green" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.weaknesses?.length > 0 && (
                <div className="rcard__sw-col rcard__sw-col--weakness">
                  <div className="rcard__section-label">Weaknesses</div>
                  <ul className="rcard__bullet-list">
                    {result.weaknesses.map((w, i) => (
                      <li key={i}>
                        <span className="rcard__bullet rcard__bullet--red" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Key concepts missed */}
          {result.key_concepts_missed?.length > 0 && (
            <div className="rcard__section">
              <div className="rcard__section-label">Key Concepts Missed</div>
              <div className="rcard__concepts">
                {result.key_concepts_missed.map((c, i) => (
                  <span key={i} className="rcard__concept-tag">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="rcard__section">
              <div className="rcard__section-label">Suggestions</div>
              <ul className="rcard__improvements">
                {result.suggestions.map((item, i) => (
                  <li key={i} className="rcard__improvement-item">
                    <span className="rcard__improvement-dot" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview tip */}
          {result.interview_tip && (
            <div className="rcard__section">
              <div className="rcard__tip-box">
                <span className="rcard__tip-icon">💡</span>
                <div>
                  <div className="rcard__section-label" style={{ marginBottom: 4 }}>Interview Tip</div>
                  <p className="rcard__tip-text">{result.interview_tip}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}