// Central API configuration
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function predictText(text, useBert = false, useWeb = true) {
  const res = await fetch(`${API_BASE}/predict/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, use_bert: useBert, use_web: useWeb }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  return res.json();
}

export async function predictImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/predict/image`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  return res.json();
}

export async function predictVideo(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/predict/video`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  return res.json();
}
