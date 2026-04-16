import { useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { ROLES } from '../data/questions';
import './Home.css';

const STATS = [
  { value: '500+', label: 'Questions' },
  { value: '3',    label: 'Tech Roles' },
  { value: 'AI',   label: 'Evaluation' },
  { value: '100%', label: 'Free' },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Timed Practice',
    desc: 'Real interview pressure with per-question word targets and structured prompts.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'AI Scoring',
    desc: 'NLP-powered evaluation scores your answer on depth, accuracy, and key concepts.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Detailed Report',
    desc: 'Per-question feedback, score breakdown, and improvement areas to act on.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Role-specific',
    desc: 'Curated questions for Frontend, Backend, and AI/ML roles at Mid–Senior level.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { setSelectedRole } = useInterview();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    navigate('/interview');
  };

  return (
    <main className="home page">
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero__eyebrow animate-fade-up" style={{ animationDelay: '0ms' }}>
            <span className="tag tag--accent">
              <span className="hero__dot" />
              AI-Powered Mock Interviews
            </span>
          </div>

          <h1 className="hero__heading animate-fade-up" style={{ animationDelay: '80ms' }}>
            Practice interviews that<br />
            <span className="gradient-text">actually prepare you.</span>
          </h1>

          <p className="hero__subheading animate-fade-up" style={{ animationDelay: '160ms' }}>
            InterviewIQ simulates real technical interviews, evaluates your answers
            with NLP, and gives you specific feedback — not generic tips.
          </p>

          <div className="hero__stats animate-fade-up" style={{ animationDelay: '240ms' }}>
            {STATS.map(s => (
              <div key={s.label} className="hero__stat">
                <span className="hero__stat-value">{s.value}</span>
                <span className="hero__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Role Selector ────────────────────────────── */}
      <section className="roles-section">
        <div className="container">
          <div className="section-header">
            <div className="tag tag--accent">Choose Your Path</div>
            <h2 className="section-title">Select a Role to Begin</h2>
            <p className="section-desc">
              5 curated questions per role, calibrated for Mid–Senior engineers.
            </p>
          </div>

          <div className="roles-grid">
            {ROLES.map((role, i) => (
              <button
                key={role.id}
                className="role-card animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-card__glow" style={{ background: role.color }} />

                <div className="role-card__icon" style={{ color: role.color, background: role.colorDim }}>
                  {role.icon}
                </div>

                <div className="role-card__body">
                  <h3 className="role-card__title">{role.label}</h3>
                  <p className="role-card__desc">{role.description}</p>
                </div>

                <div className="role-card__footer">
                  <div className="role-card__meta">
                    <span>{role.level}</span>
                    <span className="role-card__dot" />
                    <span>{role.duration}</span>
                  </div>
                  <div className="role-card__cta" style={{ color: role.color }}>
                    Start →
                  </div>
                </div>

                <div className="role-card__border" style={{ borderColor: `${role.color}40` }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────── */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="tag tag--accent">Why InterviewIQ</div>
            <h2 className="section-title">Built for serious prep</h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────── */}
      <section className="cta-section">
        <div className="container--narrow">
          <div className="cta-card">
            <div className="cta-card__glow" />
            <h2 className="cta-card__heading">Ready to level up?</h2>
            <p className="cta-card__sub">
              Pick a role above and complete your first mock interview in under 20 minutes.
            </p>
            <div className="cta-card__actions">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  className="btn btn-secondary"
                  onClick={() => handleRoleSelect(role)}
                  style={{ borderColor: `${role.color}30` }}
                >
                  <span style={{ color: role.color, fontSize: 16 }}>{role.icon}</span>
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────── */}
      <footer className="home-footer">
        <div className="container">
          <div className="divider" style={{ marginBottom: 32 }} />
          <div className="home-footer__inner">
            <span className="home-footer__brand">InterviewIQ</span>
            <span className="home-footer__copy">
              Built with React + Flask + spaCy
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
