import ConfidenceMeter from './ConfidenceMeter';

/**
 * Big verdict display card.
 * Props: result { label, confidence, explanation, top_words, model_used, processing_time_ms }
 *        type: 'text' | 'image' | 'video'
 */
export default function ResultCard({ result, type }) {
  const isReal = result.label === 'REAL';
  const cls = isReal ? 'real' : 'fake';
  const icon = isReal ? '✅' : '⚠️';
  const verdictText = isReal ? 'REAL' : (type === 'text' ? 'FAKE NEWS' : 'AI-GENERATED');
  const pulseCls = isReal ? 'pulse-real' : 'pulse-fake';

  return (
    <div className="result-section fade-in">
      {/* Main verdict */}
      <div className={`verdict-card ${cls} ${pulseCls}`}>
        <div className={`verdict-badge ${cls}`}>
          <span>{icon}</span>
          <span>{verdictText}</span>
        </div>
        <div className={`verdict-confidence ${cls}`}>
          {Math.round(result.confidence * 100)}%
        </div>
        <div className="verdict-label-text">Confidence Score</div>
        {result.explanation && (
          <p className="verdict-explanation">{result.explanation}</p>
        )}
      </div>

      {/* Confidence bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
        <ConfidenceMeter confidence={result.confidence} label={result.label} />
      </div>

      {/* Meta info */}
      <div className="info-grid">
        <div className="glass-card info-block">
          <div className="info-block-label">Detection Type</div>
          <div className="info-block-value">
            {type === 'text' ? '📰 Text / NLP' : type === 'image' ? '🖼️ Image Vision' : '🎬 Video Analysis'}
          </div>
        </div>
        <div className="glass-card info-block">
          <div className="info-block-label">Model Used</div>
          <div className="info-block-value mono">{result.model_used || '—'}</div>
        </div>
        <div className="glass-card info-block">
          <div className="info-block-label">Processing Time</div>
          <div className="info-block-value mono">
            {result.processing_time_ms ? `${Math.round(result.processing_time_ms)} ms` : '—'}
          </div>
        </div>
      </div>

      {/* Top words (text only) */}
      {result.top_words && result.top_words.length > 0 && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div className="info-block-label" style={{ marginBottom: '10px' }}>Key Tokens Detected</div>
          <div className="token-cloud">
            {result.top_words.map((w) => (
              <span key={w} className="token-chip">{w}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
