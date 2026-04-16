import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { ROLES } from '../data/questions';
import ScoreGauge from '../components/ScoreGauge';
import ResultCard from '../components/ResultCard';
import './Results.css';
import ErrorBanner from '../components/ErrorBanner';

function StatPill({ label, value, color }) {
  return (
    <div
      className="stat-pill"
      style={{
        borderColor: `${color}30`,
        background: `${color}08`,
      }}
    >
      <span className="stat-pill__value" style={{ color }}>
        {value}
      </span>
      <span className="stat-pill__label">{label}</span>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const { results, reset, selectedRole, error } = useInterview(); // ✅ FIXED
  const topRef = useRef(null);

  useEffect(() => {
    if (!results) {
      navigate('/');
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [results, navigate]);

  if (!results) return null;

  const { evaluated, overall, role } = results;

  const strong = evaluated.filter(q => q.score >= 70).length;
  const developing = evaluated.filter(q => q.score >= 40 && q.score < 70).length;
  const needsWork = evaluated.filter(q => q.score < 40).length;

  const avgWords = Math.round(
    evaluated.reduce(
      (s, q) =>
        s +
        (q.answer || '')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      0
    ) / evaluated.length
  );

  const roleData = ROLES.find(r => r.id === role?.id) || role;

  const handleRetry = () => {
    reset();
    navigate('/');
  };

  const handleSameRole = () => {
    navigate('/interview');
  };

  const grade =
    overall >= 85
      ? {
          label: 'Excellent',
          desc: "Outstanding performance. You're interview-ready for this role.",
        }
      : overall >= 70
      ? {
          label: 'Strong',
          desc: "Solid answers across the board. Polish a few areas and you're set.",
        }
      : overall >= 50
      ? {
          label: 'Developing',
          desc: 'Good foundation. Focus on depth, examples, and trade-off discussions.',
        }
      : {
          label: 'Needs Work',
          desc: 'Use the feedback below to study key concepts and try again.',
        };

  return (
    <main className="results page" ref={topRef}>
      <div className="container--narrow">

        {/* ✅ Error Banner */}
        <ErrorBanner message={error} />

        {/* ─── Hero score section ─────────────────────── */}
        <div className="results__hero animate-fade-up">
          <div className="results__hero-badge">
            <span className="tag tag--accent">Interview Complete</span>
          </div>

          <div className="results__hero-body">
            <div className="results__gauge-wrap">
              <ScoreGauge score={overall} role={roleData?.label || 'Technical'} />
            </div>

            <div className="results__hero-summary">
              <h1 className="results__grade-label">{grade.label}</h1>
              <p className="results__grade-desc">{grade.desc}</p>

              <div className="results__pills">
                <StatPill label="Strong" value={strong} color="var(--success)" />
                <StatPill label="Developing" value={developing} color="var(--warning)" />
                <StatPill label="Needs Work" value={needsWork} color="var(--danger)" />
                <StatPill label="Avg Words" value={avgWords} color="var(--info)" />
              </div>

              <div className="results__actions">
                <button className="btn btn-primary" onClick={handleSameRole}>
                  Retry Same Role
                </button>
                <button className="btn btn-secondary" onClick={handleRetry}>
                  Choose New Role
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Score breakdown ────────────────────── */}
        <div className="results__breakdown animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="results__breakdown-header">
            <h2 className="results__breakdown-title">Score Breakdown</h2>
            <span className="results__breakdown-role">
              <span style={{ color: roleData?.color }}>{roleData?.icon}</span>
              {' '}{roleData?.label} Track
            </span>
          </div>

          <div className="results__bars">
            {evaluated.map((q, i) => {
              const scoreColor =
                q.score >= 70
                  ? 'var(--success)'
                  : q.score >= 40
                  ? 'var(--warning)'
                  : 'var(--danger)';

              return (
                <div key={q.id} className="results__bar-row">
                  <span className="results__bar-label">
                    Q{i + 1} — {q.category}
                  </span>

                  <div className="results__bar-track">
                    <div
                      className="results__bar-fill"
                      style={{
                        width: `${q.score}%`,
                        background: `linear-gradient(90deg, ${scoreColor}cc, ${scoreColor})`,
                        animationDelay: `${i * 120 + 300}ms`,
                      }}
                    />
                  </div>

                  <span className="results__bar-score" style={{ color: scoreColor }}>
                    {q.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Per-question feedback ─────────────────── */}
        <div className="results__feedback animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h2 className="results__section-title">
            Per-Question Feedback
            <span className="results__section-sub"> — click to expand</span>
          </h2>

          <div className="results__cards">
            {evaluated.map((result, i) => (
              <ResultCard key={result.id} result={result} index={i} />
            ))}
          </div>
        </div>

        {/* ─── Bottom CTA ───────────────────────────── */}
        <div className="results__bottom-cta">
          <div className="divider" style={{ marginBottom: 32 }} />
          <div className="results__bottom-actions">
            <button className="btn btn-primary btn-lg" onClick={handleSameRole}>
              Retry This Interview
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handleRetry}>
              ← Back to Home
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}