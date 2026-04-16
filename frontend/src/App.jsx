import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InterviewProvider } from './hooks/useInterview';

// Existing components
import Navbar    from './components/Navbar';
import Home      from './pages/Home';
import Interview from './pages/Interview';
import Results   from './pages/Results';

// Auth pages
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';
import DashboardPage  from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { tokenHelper } from './services/api';

export default function App() {
  return (
    <BrowserRouter>
      <InterviewProvider>
        <Routes>

          {/* ── Default: go to /home if logged in, else /login ── */}
          <Route
            path="/"
            element={
              tokenHelper.exists()
                ? <Navigate to="/home" replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* ── Auth routes — no Navbar ──────────────────────── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Protected dashboard ──────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ── Protected app routes — with Navbar ───────────── */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Navbar />
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Navbar />
                <Results />
              </ProtectedRoute>
            }
          />

          {/* ── 404 fallback ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </InterviewProvider>
    </BrowserRouter>
  );
}