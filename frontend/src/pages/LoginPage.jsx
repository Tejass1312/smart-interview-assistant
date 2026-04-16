// src/pages/LoginPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function LoginPage() {
  const { login, loading, error, setError } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear errors on typing
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
  };

  // ── Client-side validation ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.email.trim())              errs.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)                  errs.password = 'Password is required.';
    else if (form.password.length < 6)   errs.password = 'Password must be at least 6 characters.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    login(form.email, form.password);
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <div className="auth-brand__logo">IQ</div>
          <h1 className="auth-brand__name">InterviewIQ</h1>
          <p className="auth-brand__tagline">
            Practice. Evaluate. Improve.
          </p>
        </div>
        <div className="auth-panel__features">
          {[
            { icon: '⚡', text: 'AI-powered answer evaluation' },
            { icon: '📊', text: 'Track your progress over time' },
            { icon: '🎯', text: 'Role-specific question banks' },
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
            <h2 className="auth-form-header__title">Welcome back</h2>
            <p className="auth-form-header__sub">Sign in to your account to continue</p>
          </div>

          {/* API error banner */}
          {error && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-banner__icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

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
              <div className="auth-field__label-row">
                <label className="auth-field__label" htmlFor="password">Password</label>
                <a href="#" className="auth-field__forgot">Forgot password?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className={`auth-field__input ${fieldErrors.password ? 'auth-field__input--error' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="auth-field__error">{fieldErrors.password}</span>
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
                  Signing in…
                </>
              ) : (
                'Sign In →'
              )}
            </button>

          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-switch__link">Create one free</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
