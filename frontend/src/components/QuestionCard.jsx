import { useState } from 'react';
import { DIFFICULTY_COLOR } from '../data/questions';
import './QuestionCard.css';

export default function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  isActive,
}) {
  const [showHint, setShowHint] = useState(false);
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const diff = DIFFICULTY_COLOR[question.difficulty];

  return (
    <div className={`qcard ${isActive ? 'qcard--active' : ''}`}>
      <div className="qcard__header">
        <div className="qcard__meta">
          <span className="qcard__index">Q{index + 1} / {total}</span>
          <span
            className="tag"
            style={{ background: diff.bg, color: diff.color, borderColor: `${diff.color}33` }}
          >
            {question.difficulty}
          </span>
          <span className="tag tag--accent">{question.category}</span>
        </div>
      </div>

      <div className="qcard__body">
        <p className="qcard__question">{question.question}</p>

        {question.hint && (
          <div className="qcard__hint-row">
            <button
              className="qcard__hint-toggle"
              onClick={() => setShowHint(v => !v)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>

            {showHint && (
              <div className="qcard__hint animate-fade-in">
                <span className="qcard__hint-label">💡 Hint</span>
                <p>{question.hint}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="qcard__answer-section">
        <div className="qcard__answer-header">
          <label className="qcard__label">Your Answer</label>
          <span className={`qcard__wordcount ${wordCount >= 60 ? 'qcard__wordcount--good' : ''}`}>
            {wordCount} words {wordCount >= 60 ? '✓' : '(aim for 60+)'}
          </span>
        </div>

        <div className="qcard__textarea-wrap">
          <textarea
            className="qcard__textarea"
            placeholder="Type your answer here. Be specific — use examples, name trade-offs, and explain your reasoning..."
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={7}
          />
          <div className="qcard__textarea-border" />
        </div>

        <div className="qcard__progress-row">
          <div className="progress-track" style={{ flex: 1 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, (wordCount / 100) * 100)}%` }}
            />
          </div>
          <span className="qcard__target">
            {wordCount < 100 ? `${100 - wordCount} words to target` : 'Target reached!'}
          </span>
        </div>
      </div>
    </div>
  );
}
