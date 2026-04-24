import { useEffect, useRef } from 'react';

/**
 * Animated confidence bar + percentage display.
 * Props: confidence (0-1), label ('real'|'fake'|'ai-generated')
 */
export default function ConfidenceMeter({ confidence, label }) {
  const cls = label === 'REAL' ? 'real' : 'fake';
  const pct = Math.round(confidence * 100);
  const fillRef = useRef(null);

  useEffect(() => {
    if (!fillRef.current) return;
    // Reset then animate
    fillRef.current.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (fillRef.current) fillRef.current.style.width = `${pct}%`;
      });
    });
  }, [pct]);

  return (
    <div className="confidence-bar-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
          Confidence
        </span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: cls === 'real' ? 'var(--real-color)' : 'var(--fake-color)' }}>
          {pct}%
        </span>
      </div>
      <div className="confidence-bar-track">
        <div
          ref={fillRef}
          className={`confidence-bar-fill ${cls}`}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}
