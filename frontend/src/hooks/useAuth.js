// src/hooks/useAuth.js
// Reusable hook for signup / login logic

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, tokenHelper } from '../services/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  // ── Parse a human-readable error from Axios error ────────
  const parseError = (err) => {
    if (!err.response) {
      return 'Cannot connect to server. Make sure Flask is running.';
    }
    const msg = err.response?.data?.message || err.response?.data?.error;
    if (msg) return msg;
    switch (err.response.status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Invalid email or password.';
      case 409: return 'An account with this email already exists.';
      case 500: return 'Server error. Please try again later.';
      default:  return 'Something went wrong. Please try again.';
    }
  };

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res   = await authAPI.login(email, password);
      const token = res.data.access_token;
      tokenHelper.save(token);
      navigate('/dashboard');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    setLoading(true);
    setError('');
    try {
      await authAPI.signup(name, email, password);
      // Auto-login after successful signup
      const res   = await authAPI.login(email, password);
      const token = res.data.access_token;
      tokenHelper.save(token);
      navigate('/dashboard');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    tokenHelper.remove();
    navigate('/login');
  };

  return { login, signup, logout, loading, error, setError };
}
