// src/pages/SignupPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function SignupPage() {
  const { signup, loading, error, setError } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
  };

  // ── Client-side validation ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())                    errs.name     = 'Full name is required.';
    else if (form.name.trim().length < 2)     errs.name     = 'Name must be at least 2 characters.';

    if (!form.email.trim())                   errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email  = 'Enter a valid email.';

    if (!form.password)                       errs.password = 'Password is required.';
    else if (form.password.length < 6)        errs.password = 'Password must be at least 6 characters.';

    if (!form.confirm)                        errs.confirm  = 'Please confirm your password.';
    else if (form.confirm !== form.password)  errs.confirm  = 'Passwords do not match.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Password strength ─────────────────────────────────────
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { level: 1, label: 'Weak',   color: '#f87171' },
      { level: 2, label: 'Fair',   color: '#fbbf24' },
      { level: 3, label: 'Good',   color: '#34d399' },
      { level: 4, label: 'Strong', color: '#00d4aa' },
    ];
    return levels[Math.min(score, 4) - 1] || { level: 0, label: '', color: '' };
  };

  const strength = getStrength(form.password);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    signup(form.name.trim(), form.email, form.password);
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <div className="auth-brand__logo">IQ</div>
          <h1 className="auth-brand__name">InterviewIQ</h1>
          <p className="auth-brand__tagline">
            Your AI interview coach. Start for free.
          </p>
        </div>
        <div className="auth-panel__features">
          {[
            { icon: '🚀', text: 'Get started in under 2 minutes' },
            { icon: '🤖', text: 'Gemini AI evaluates every answer' },
            { icon: '📈', text: 'Dashboard tracks your improvement' },
          ].map(f => (
            <div key={f.text} className="auth-feature">
              <span className="auth-feature__icon">{f.icon}</span>
              <span className="auth-feature__text">{f.text}</span>
            </div>
          ))}
        </div>
        <div className="auth-panel__glow" />
      </div>

      {/* Right panel — form */}
      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">

          <div className="auth-form-header">
            <h2 className="auth-form-header__title">Create your account</h2>
            <p className="auth-form-header__sub">Free forever. No credit card needed.</p>
          </div>

          {/* API error banner */}
          {error && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-banner__icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className={`auth-field__input ${fieldErrors.name ? 'auth-field__input--error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
              />
              {fieldErrors.name && (
                <span className="auth-field__error">{fieldErrors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`auth-field__input ${fieldErrors.email ? 'auth-field__input--error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
              {fieldErrors.email && (
                <span className="auth-field__error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`auth-field__input ${fieldErrors.password ? 'auth-field__input--error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="auth-field__error">{fieldErrors.password}</span>
              )}
              {/* Password strength indicator */}
              {form.password && !fieldErrors.password && (
                <div className="auth-strength">
                  <div className="auth-strength__bars">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="auth-strength__bar"
                        style={{
                          background: i <= strength.level ? strength.color : 'var(--auth-border)',
                          transition: 'background 0.3s',
                        }}
                      />
                    ))}
                  </div>
                  <span className="auth-strength__label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                className={`auth-field__input ${fieldErrors.confirm ? 'auth-field__input--error' : ''}`}
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
              {fieldErrors.confirm && (
                <span className="auth-field__error">{fieldErrors.confirm}</span>
              )}
              {/* Match indicator */}
              {form.confirm && form.password && !fieldErrors.confirm && (
                <span className="auth-field__match">
                  {form.confirm === form.password ? '✓ Passwords match' : ''}
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account…
                </>
              ) : (
                'Create Account →'
              )}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-switch__link">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
