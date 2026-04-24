import { useState, useRef } from 'react';
import { predictImage, predictVideo } from '../api';
import ResultCard from '../components/ResultCard';
import FrameTimeline from '../components/FrameTimeline';

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];

function getFileType(filename) {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  return 'unknown';
}

export default function MediaAnalysis() {
  const [tab, setTab] = useState('image');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setPreviewUrl('');
    setResult(null);
    setError('');
  };

  const handleFile = (f) => {
    if (!f) return;
    const ftype = getFileType(f.name);
    if (tab === 'image' && ftype !== 'image') {
      setError(`Please upload an image file (${IMAGE_EXTS.join(', ')})`);
      return;
    }
    if (tab === 'video' && ftype !== 'video') {
      setError(`Please upload a video file (${VIDEO_EXTS.join(', ')})`);
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file first.'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = tab === 'image'
        ? await predictImage(file)
        : await predictVideo(file);
      setResult(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h2>🎬 Media Deepfake Detection</h2>
          <p>Upload an image or video. Our AI model will determine if it's <strong>Real</strong> or <strong>AI-Generated / Deepfake</strong>.</p>
        </div>

        {/* Tab switcher */}
        <div className="tab-switcher">
          <button
            id="tab-image"
            className={`tab-btn ${tab === 'image' ? 'active' : ''}`}
            onClick={() => { setTab('image'); resetState(); }}
          >🖼️ Image</button>
          <button
            id="tab-video"
            className={`tab-btn ${tab === 'video' ? 'active' : ''}`}
            onClick={() => { setTab('video'); resetState(); }}
          >🎬 Video</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Upload panel */}
          <div>
            <div className="glass-card" style={{ padding: '28px' }}>
              {/* Drop zone */}
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <span className="upload-icon">{tab === 'image' ? '🖼️' : '🎬'}</span>
                <h3>Drop {tab} here or click to browse</h3>
                <p>
                  {tab === 'image'
                    ? 'JPG, PNG, WEBP, GIF — max 50MB'
                    : 'MP4, MOV, AVI, MKV — max 200MB'}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept={tab === 'image' ? 'image/*' : 'video/*'}
                  onChange={e => handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="media-preview" style={{ marginTop: '16px' }}>
                  {tab === 'image'
                    ? <img src={previewUrl} alt="Preview" />
                    : <video src={previewUrl} controls />
                  }
                </div>
              )}

              {file && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(99,120,255,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  📎 <strong style={{ color: 'var(--text-primary)' }}>{file.name}</strong> &nbsp;·&nbsp;
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}

              {error && (
                <div style={{ color: 'var(--fake-color)', fontSize: '0.87rem', marginTop: '12px', padding: '10px 14px', background: 'var(--fake-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,71,87,0.3)' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !file}>
                  {loading ? '⏳ Analyzing...' : '🔍 Analyze'}
                </button>
                <button className="btn btn-ghost" onClick={resetState}>
                  🗑️ Clear
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
                Detection Signals
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div><span style={{ color: 'var(--real-color)', fontWeight: 700 }}>✅ REAL</span> — Natural pixel distribution, authentic camera artifacts</div>
                <div><span style={{ color: 'var(--fake-color)', fontWeight: 700 }}>⚠️ AI-GENERATED</span> — GAN fingerprints, unnatural uniformity, face geometry anomalies</div>
                {tab === 'video' && <div>🎬 Each frame is scored individually, then averaged into a final verdict</div>}
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div>
            {loading && (
              <div className="glass-card spinner-wrap">
                <div className="spinner" />
                <div className="spinner-text">
                  {tab === 'video' ? 'Extracting and analyzing frames...' : 'Running image analysis...'}
                </div>
              </div>
            )}
            {!loading && result && (
              <>
                <ResultCard result={result} type={tab} />
                {tab === 'video' && result.frame_results && (
                  <div style={{ marginTop: '16px' }}>
                    <FrameTimeline frames={result.frame_results} />
                  </div>
                )}
              </>
            )}
            {!loading && !result && (
              <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                  {tab === 'image' ? '🖼️' : '🎬'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Upload a {tab} to see the deepfake detection result
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
