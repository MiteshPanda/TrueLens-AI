/**
 * WebEvidencePanel — displays the web cross-check results for text analysis.
 * Props: evidence — the web_evidence object from the API response
 */
export default function WebEvidencePanel({ evidence }) {
  if (!evidence) return null;

  const { queries, sources, web_label, web_score, web_summary,
    high_cred_count, low_cred_count, debunk_count, confirm_count, searched } = evidence;

  const credColor = {
    high: 'var(--real-color)',
    low: 'var(--fake-color)',
    neutral: 'var(--text-muted)',
  };

  const credBg = {
    high: 'rgba(34,214,122,0.10)',
    low: 'rgba(255,71,87,0.10)',
    neutral: 'rgba(255,255,255,0.05)',
  };

  const credLabel = { high: 'Credible', low: 'Unreliable', neutral: 'Neutral' };

  const webPct = Math.round((web_score || 0.5) * 100);
  const webCls = web_label === 'REAL' ? 'real' : web_label === 'FAKE' ? 'fake' : '';

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.2rem' }}>🌐</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Web Cross-Check</span>
          {!searched && (
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', color: 'var(--text-muted)' }}>
              offline
            </span>
          )}
        </div>
        {searched && web_label !== 'UNCERTAIN' && (
          <div style={{
            padding: '4px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700,
            background: web_label === 'REAL' ? 'var(--real-bg)' : 'var(--fake-bg)',
            color: web_label === 'REAL' ? 'var(--real-color)' : 'var(--fake-color)',
            border: `1px solid ${web_label === 'REAL' ? 'rgba(34,214,122,0.3)' : 'rgba(255,71,87,0.3)'}`,
          }}>
            {web_label === 'REAL' ? '✅' : '⚠️'} Web: {web_label} ({webPct}%)
          </div>
        )}
      </div>

      {/* Summary */}
      <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
        {web_summary}
      </p>

      {/* Stats row */}
      {searched && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {[
            { label: 'Credible Sources', value: high_cred_count, color: 'var(--real-color)' },
            { label: 'Low-Cred Sources', value: low_cred_count, color: 'var(--fake-color)' },
            { label: 'Confirm Signals', value: confirm_count, color: 'var(--real-color)' },
            { label: 'Debunk Signals', value: debunk_count, color: 'var(--fake-color)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              minWidth: '100px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Queries sent */}
      {queries && queries.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
            Queries Searched
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {queries.map((q, i) => (
              <div key={i} style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(99,120,255,0.08)', border: '1px solid rgba(99,120,255,0.2)',
                fontSize: '0.82rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)',
              }}>
                🔍 {q}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources list */}
      {sources && sources.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
            Sources Found ({sources.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
            {sources.map((s, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                background: credBg[s.credibility] || credBg.neutral,
                border: `1px solid ${s.credibility === 'high' ? 'rgba(34,214,122,0.2)' : s.credibility === 'low' ? 'rgba(255,71,87,0.2)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1, lineHeight: 1.3 }}>
                    {s.title || s.domain}
                  </a>
                  <span style={{
                    padding: '2px 8px', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 700,
                    flexShrink: 0, color: credColor[s.credibility] || credColor.neutral,
                    background: credBg[s.credibility] || credBg.neutral,
                  }}>
                    {credLabel[s.credibility] || 'Neutral'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginBottom: '4px' }}>
                  🔗 {s.domain}
                </div>
                {s.snippet && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {s.snippet.slice(0, 160)}{s.snippet.length > 160 ? '…' : ''}
                  </div>
                )}
                {(s.debunk_signals > 0 || s.confirm_signals > 0) && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {s.confirm_signals > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--real-color)', fontWeight: 600 }}>
                        ✅ {s.confirm_signals} confirm
                      </span>
                    )}
                    {s.debunk_signals > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--fake-color)', fontWeight: 600 }}>
                        ⚠️ {s.debunk_signals} debunk
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
