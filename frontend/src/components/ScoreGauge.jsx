import './ScoreGauge.css';

export default function ScoreGauge({ score, role }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  const grade =
    score >= 85 ? { label: 'Excellent', color: '#34d399' } :
    score >= 70 ? { label: 'Strong',    color: '#00d4aa' } :
    score >= 50 ? { label: 'Developing',color: '#fbbf24' } :
                  { label: 'Needs Work',color: '#f87171' };

  return (
    <div className="gauge">
      <div className="gauge__svg-wrap">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <circle
            cx="70" cy="70" r="52"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            cx="70" cy="70" r="52"
            fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            filter="url(#glow)"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>

        <div className="gauge__center">
          <div className="gauge__score" style={{ color: grade.color }}>
            {score}
          </div>
          <div className="gauge__denom">/100</div>
        </div>
      </div>

      <div className="gauge__info">
        <div className="gauge__grade" style={{ color: grade.color }}>
          {grade.label}
        </div>
        <div className="gauge__role">{role} Interview</div>
      </div>
    </div>
  );
}
