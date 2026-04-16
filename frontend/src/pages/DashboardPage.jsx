// src/pages/DashboardPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenHelper } from '../services/api';
import './DashboardPage.css';

const API_BASE = 'http://localhost:5000';

// ── Role config ───────────────────────────────────────────
const ROLE_META = {
  frontend: { label: 'Frontend', icon: '◈', color: '#7c6ef5' },
  backend:  { label: 'Backend',  icon: '⬡', color: '#00d4aa' },
  ai:       { label: 'AI / ML',  icon: '✦', color: '#f5a623' },
};

// ── Score color helper ────────────────────────────────────
const scoreColor = (s) =>
  s >= 70 ? '#34d399' : s >= 40 ? '#fbbf24' : '#f87171';

// ── Format date ───────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

// ── Mini bar chart ────────────────────────────────────────
function ScoreChart({ interviews }) {
  // Show last 8 interviews oldest→newest for chart
  const data = [...interviews].reverse().slice(-8);

  return (
    <div className="chart">
      <div className="chart__bars">
        {data.map((item, i) => {
          const role  = ROLE_META[item.role] || { color: '#8a9ab5', icon: '•' };
          const color = scoreColor(item.score);
          return (
            <div key={item.id} className="chart__col">
              <div className="chart__bar-wrap">
                <div
                  className="chart__bar"
                  style={{
                    height:     `${item.score}%`,
                    background: color,
                    boxShadow:  `0 0 8px ${color}55`,
                    animationDelay: `${i * 80}ms`,
                  }}
                  title={`${item.score}/100`}
                />
              </div>
              <span className="chart__label" style={{ color: role.color }}>
                {role.icon}
              </span>
              <span className="chart__score" style={{ color }}>
                {item.score}
              </span>
            </div>
          );
        })}
      </div>
      <div className="chart__grid">
        {[100, 75, 50, 25, 0].map(v => (
          <div key={v} className="chart__grid-line">
            <span className="chart__grid-label">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ borderColor: `${color}25` }}>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

// ── Attempt row ───────────────────────────────────────────
function AttemptRow({ item, index }) {
  const role  = ROLE_META[item.role] || { label: item.role, icon: '•', color: '#8a9ab5' };
  const color = scoreColor(item.score);
  const grade = item.score >= 70 ? 'Strong' : item.score >= 40 ? 'Developing' : 'Needs Work';

  return (
    <div className="attempt-row" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="attempt-row__left">
        <span className="attempt-row__num">#{index + 1}</span>
        <span className="attempt-row__icon" style={{ color: role.color }}>{role.icon}</span>
        <div>
          <div className="attempt-row__role">{role.label}</div>
          <div className="attempt-row__date">{formatDate(item.date)}</div>
        </div>
      </div>

      <div className="attempt-row__right">
        <div className="attempt-row__bar-wrap">
          <div className="attempt-row__bar-track">
            <div
              className="attempt-row__bar-fill"
              style={{ width: `${item.score}%`, background: color }}
            />
          </div>
        </div>
        <span className="attempt-row__score" style={{ color }}>{item.score}</span>
        <span className="attempt-row__grade" style={{ color, background: `${color}12`, borderColor: `${color}30` }}>
          {grade}
        </span>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────
function Skeleton() {
  return (
    <div className="dash-skeleton">
      {[1,2,3].map(i => (
        <div key={i} className="dash-skeleton__card" />
      ))}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const token = tokenHelper.get();
      if (!token) { navigate('/login'); return; }

      try {
        const res = await fetch(`${API_BASE}/api/user-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) { navigate('/login'); return; }
        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Could not load dashboard. Make sure Flask is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    tokenHelper.remove();
    navigate('/login');
  };

  // ── Compute best role ─────────────────────────────────
  const bestRole = data?.interviews?.length > 0
    ? Object.entries(
        data.interviews.reduce((acc, i) => {
          if (!acc[i.role]) acc[i.role] = [];
          acc[i.role].push(i.score);
          return acc;
        }, {})
      ).map(([role, scores]) => ({
        role,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      })).sort((a, b) => b.avg - a.avg)[0]
    : null;

  return (
    <div className="dash-page">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-header__brand">
          <div className="dash-header__logo">IQ</div>
          <span className="dash-header__name">InterviewIQ</span>
        </div>
        <div className="dash-header__actions">
          <button className="dash-nav-btn" onClick={() => navigate('/home')}>
            New Interview
          </button>
          <button className="dash-nav-btn dash-nav-btn--ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dash-body">

        {/* ── Page title ──────────────────────────────── */}
        <div className="dash-title-row">
          <div>
            <h1 className="dash-title">Your Dashboard</h1>
            <p className="dash-subtitle">Track your interview performance over time</p>
          </div>
          <button className="dash-cta-btn" onClick={() => navigate('/home')}>
            + Start Interview
          </button>
        </div>

        {/* ── Loading ─────────────────────────────────── */}
        {loading && <Skeleton />}

        {/* ── Error ───────────────────────────────────── */}
        {error && (
          <div className="dash-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Content ─────────────────────────────────── */}
        {!loading && !error && data && (
          <>
            {/* Stat cards */}
            <div className="dash-stats">
              <StatCard
                label="Total Interviews"
                value={data.total}
                sub="attempts so far"
                color="#00d4aa"
              />
              <StatCard
                label="Average Score"
                value={data.total > 0 ? `${data.average_score}` : '—'}
                sub="out of 100"
                color={data.total > 0 ? scoreColor(data.average_score) : '#8a9ab5'}
              />
              <StatCard
                label="Best Role"
                value={bestRole ? ROLE_META[bestRole.role]?.icon || '•' : '—'}
                sub={bestRole ? `${ROLE_META[bestRole.role]?.label} (avg ${bestRole.avg})` : 'No data yet'}
                color={bestRole ? ROLE_META[bestRole.role]?.color || '#8a9ab5' : '#8a9ab5'}
              />
              <StatCard
                label="Latest Score"
                value={data.interviews[0] ? data.interviews[0].score : '—'}
                sub={data.interviews[0] ? formatDate(data.interviews[0].date) : 'No attempts yet'}
                color={data.interviews[0] ? scoreColor(data.interviews[0].score) : '#8a9ab5'}
              />
            </div>

            {/* Empty state */}
            {data.total === 0 && (
              <div className="dash-empty">
                <div className="dash-empty__icon">🎯</div>
                <h3>No interviews yet</h3>
                <p>Complete your first mock interview to see your stats here.</p>
                <button className="dash-cta-btn" onClick={() => navigate('/home')}>
                  Start Your First Interview
                </button>
              </div>
            )}

            {/* Chart */}
            {data.total > 0 && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <h2 className="dash-section__title">Score Progress</h2>
                  <span className="dash-section__sub">Last {Math.min(data.total, 8)} interviews</span>
                </div>
                <div className="dash-card">
                  <ScoreChart interviews={data.interviews} />
                </div>
              </div>
            )}

            {/* Attempts list */}
            {data.total > 0 && (
              <div className="dash-section">
                <div className="dash-section__header">
                  <h2 className="dash-section__title">All Attempts</h2>
                  <span className="dash-section__sub">{data.total} total</span>
                </div>
                <div className="dash-card dash-card--list">
                  {data.interviews.map((item, i) => (
                    <AttemptRow key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}