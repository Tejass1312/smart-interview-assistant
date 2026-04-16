// src/components/ProtectedRoute.jsx
// Wraps any route that requires authentication.
// Redirects to /login if no token found.

import { Navigate } from 'react-router-dom';
import { tokenHelper } from '../services/api';

export default function ProtectedRoute({ children }) {
  if (!tokenHelper.exists()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
