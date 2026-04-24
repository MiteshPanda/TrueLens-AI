export default function Home({ navigate }) {
  const stats = [
    { value: '85%+', label: 'Text Accuracy' },
    { value: '<3s',  label: 'Response Time' },
    { value: '3',    label: 'Input Modalities' },
    { value: '100%', label: 'Open Source' },
  ];

  const features = [
    {
      icon: '📰',
      iconCls: 'blue',
      title: 'Fake News Detection',
      desc: 'BERT-based NLP model analyzes news articles and headlines, classifying them as Real or Fake with a confidence score and key token highlights.',
      page: 'text',
    },
    {
      icon: '🖼️',
      iconCls: 'green',
      title: 'Image Deepfake Detection',
      desc: 'Upload any image — our vision model detects AI-generated or manipulated images using pixel-statistics and deep feature analysis.',
      page: 'media',
    },
    {
      icon: '🎬',
      iconCls: 'purple',
      title: 'Video Deepfake Detection',
      desc: 'Frame-by-frame video analysis using OpenCV + CNN classifiers. Each frame is scored and aggregated into a final verdict with a visual timeline.',
      page: 'media',
    },
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">🛡️ Multi-Modal AI Detection Platform</div>
          <h1>
            Detect <span>Fake News</span> &amp;<br />
            <span>Deepfakes</span> Instantly
          </h1>
          <p className="hero-sub">
            An AI-powered system that classifies news as Real or Fake and identifies
            AI-generated images &amp; deepfake videos — with confidence scores and explainability.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => navigate('text')}>
              📰 Analyze Text
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('media')}>
              🎬 Analyze Media
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {stats.map(s => (
              <div key={s.label} className="glass-card stat-card">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Three Detection Modes</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
              Click a card to start analyzing
            </p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div
                key={f.title}
                className="glass-card feature-card"
                onClick={() => navigate(f.page)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(f.page)}
              >
                <div className={`feature-icon ${f.iconCls}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  Try it now →
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ marginTop: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>How It Works</h2>
          </div>
          <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              { step: '01', title: 'Submit Content', desc: 'Paste text or upload an image / video file' },
              { step: '02', title: 'AI Processing', desc: 'BERT or CNN model analyzes patterns and features' },
              { step: '03', title: 'Get Verdict', desc: 'Real vs AI-Generated result with confidence score' },
              { step: '04', title: 'Understand Why', desc: 'Key tokens or frame timeline explain the decision' },
            ].map(s => (
              <div key={s.step} className="glass-card info-block" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: 900,
                  background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                }}>{s.step}</div>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Differentiator */}
        <section style={{ marginTop: '60px' }}>
          <div className="glass-card" style={{ padding: '36px', background: 'linear-gradient(135deg, rgba(99,120,255,0.08), rgba(168,85,247,0.06))' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ color: 'var(--real-color)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>✅ REAL Content</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Factual language patterns', 'References to verifiable sources', 'Consistent pixel/temporal data', 'Natural compression artifacts', 'Authentic facial geometry'].map(i => (
                    <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--real-color)' }}>→</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ color: 'var(--fake-color)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>⚠️ AI-Generated / FAKE</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Sensationalist / emotional language', 'No verifiable sources', 'Unnatural pixel uniformity', 'GAN fingerprint artifacts', 'Temporal inconsistencies in video'].map(i => (
                    <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--fake-color)' }}>→</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
