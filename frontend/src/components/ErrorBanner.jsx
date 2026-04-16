import './ErrorBanner.css';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="error-banner">
      <span className="error-banner__icon">⚠</span>
      <span>{message}</span>
    </div>
  );
}
