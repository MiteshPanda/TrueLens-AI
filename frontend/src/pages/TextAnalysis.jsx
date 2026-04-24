import { useState } from 'react';
import { predictText } from '../api';
import ResultCard from '../components/ResultCard';
import WebEvidencePanel from '../components/WebEvidencePanel';

const SAMPLE_FAKE = `SHOCKING: Scientists BANNED from revealing the truth about 5G towers and vaccines! The government doesn't want you to know that mainstream media is LYING to you. Wake up sheeple — this exclusive bombshell exposes the deep state cover-up that will destroy everything you thought you knew! Share before it's CENSORED!`;

const SAMPLE_REAL = `According to a study published in the New England Journal of Medicine, researchers at Harvard University found that the new vaccine shows 94% efficacy against severe disease. The clinical trial involved 43,000 participants across six countries. Health officials confirmed the results and announced the policy update on Tuesday.`;

export default function TextAnalysis() {
  const [text, setText] = useState('');
  const [useWeb, setUseWeb] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim().length < 10) { setError('Please enter at least 10 characters.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await predictText(text.trim(), false, useWeb);
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (type) => {
    setText(type === 'fake' ? SAMPLE_FAKE : SAMPLE_REAL);
    setResult(null); setError('');
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h2>📰 Fake News Detection</h2>
          <p>
            Paste a news article or headline. The system runs a <strong>two-stage analysis</strong>:
            linguistic heuristics <em>and</em> a live web cross-check against credible sources.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* ── Input panel ── */}
          <div>
            <div className="glass-card" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">News Article / Headline</label>
                  <textarea
                    id="text-input"
                    className="textarea"
                    placeholder="Paste news article, headline, or any text content here..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={10}
                  />
                  <div className="char-count">{text.length} characters</div>
                </div>

                {/* Web toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', marginBottom: '16px',
                  background: useWeb ? 'rgba(99,120,255,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${useWeb ? 'rgba(99,120,255,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s',
                }} onClick={() => setUseWeb(w => !w)}>
                  <div style={{
                    width: '38px', height: '20px', borderRadius: '10px', position: 'relative',
                    background: useWeb ? 'var(--accent-blue)' : 'rgba(255,255,255,0.15)',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '3px',
                      left: useWeb ? '21px' : '3px', transition: 'left 0.2s',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.87rem', fontWeight: 600, color: useWeb ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      🌐 Web Cross-Check {useWeb ? '(enabled)' : '(disabled)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {useWeb ? 'Claims will be verified against DuckDuckGo + credible sources' : 'Linguistic analysis only (faster, no internet)'}
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{ color: 'var(--fake-color)', fontSize: '0.87rem', marginBottom: '16px', padding: '10px 14px', background: 'var(--fake-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,71,87,0.3)' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
                    {loading ? (useWeb ? '🌐 Searching web...' : '⏳ Analyzing...') : '🔍 Analyze'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setText(''); setResult(null); setError(''); }}>
                    🗑️ Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Sample loaders */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => loadSample('fake')}>
                ⚠️ Load Fake Sample
              </button>
              <button className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => loadSample('real')}>
                ✅ Load Real Sample
              </button>
            </div>

            {/* Pipeline explanation */}
            <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
                Two-Stage Detection Pipeline
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '🔤', title: 'Stage 1 — Linguistic Analysis', desc: 'Detects sensationalist language, emotional triggers, ALL-CAPS, unsourced claims' },
                  { icon: '🌐', title: 'Stage 2 — Web Cross-Check', desc: 'Searches DuckDuckGo, scores source credibility (Reuters, BBC, Snopes…), checks for debunking' },
                  { icon: '⚖️', title: 'Fusion', desc: 'Web evidence (60%) + linguistics (40%) → final verdict' },
                ].map(s => (
                  <div key={s.title} style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{s.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Results panel ── */}
          <div>
            {loading && (
              <div className="glass-card spinner-wrap">
                <div className="spinner" />
                <div className="spinner-text">
                  {useWeb
                    ? 'Searching the web & cross-checking claims…'
                    : 'Running linguistic analysis…'}
                </div>
                {useWeb && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Querying DuckDuckGo · scoring sources · fusing results
                  </div>
                )}
              </div>
            )}

            {!loading && result && (
              <>
                <ResultCard result={result} type="text" />
                {result.web_evidence && (
                  <WebEvidencePanel evidence={result.web_evidence} />
                )}
                {/* Linguistic score breakdown */}
                {result.linguistic_score != null && (
                  <div className="glass-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                      Linguistic Score
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Fake probability (language only)</span>
                      <span style={{ fontWeight: 700, color: result.linguistic_score > 0.5 ? 'var(--fake-color)' : 'var(--real-color)', fontFamily: 'var(--font-mono)' }}>
                        {Math.round(result.linguistic_score * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!loading && !result && (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Submit text to see the detection result here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
