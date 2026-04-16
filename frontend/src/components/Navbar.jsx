import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { tokenHelper } from '../services/api';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { reset } = useInterview();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogoClick = () => {
    reset();
    navigate('/home');             // ← changed from '/'
  };

  const isHome = location.pathname === '/home';  // ← changed from '/'

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <button className="navbar__logo" onClick={handleLogoClick}>
          <span className="navbar__logo-mark">IQ</span>
          <span className="navbar__logo-name">Interview<span>IQ</span></span>
        </button>

        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/home" className={`navbar__link ${isHome ? 'navbar__link--active' : ''}`}>
            Home                   {/* ← changed from '/' */}
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar__link"
          >
            GitHub
          </a>
          <a href="#" className="navbar__link">Docs</a>
        </nav>

        <div className="navbar__actions">
          <Link to="/home" className="btn btn-ghost btn-sm" onClick={reset}>
            New Interview          {/* ← changed from '/' */}
          </Link>
          {tokenHelper.exists() ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}