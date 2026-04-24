/**
 * Frame timeline for video analysis results.
 * Props: frames — array of { frame, timestamp, label, confidence }
 */
export default function FrameTimeline({ frames }) {
  if (!frames || frames.length === 0) return null;

  const fakeCount = frames.filter(f => f.label === 'AI-GENERATED').length;
  const realCount = frames.length - fakeCount;

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div className="frame-timeline">
        <h4>Frame-by-Frame Analysis</h4>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--real-color)', fontWeight: 600 }}>✅ Real: {realCount}</span>
          <span style={{ color: 'var(--fake-color)', fontWeight: 600 }}>⚠️ AI-Gen: {fakeCount}</span>
          <span style={{ color: 'var(--text-muted)' }}>Total: {frames.length} frames sampled</span>
        </div>
        <div className="frames-track">
          {frames.map((fr) => {
            const cls = fr.label === 'REAL' ? 'real' : 'fake';
            const pct = Math.round(fr.confidence * 100);
            return (
              <div
                key={fr.frame}
                className={`frame-pip ${cls}`}
                title={`Frame ${fr.frame} @ ${fr.timestamp}s — ${fr.label} (${pct}%)`}
              >
                <span>{pct}%</span>
                <span className="frame-time">{fr.timestamp}s</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
