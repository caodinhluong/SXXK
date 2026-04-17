const BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_CHATBOT_API_KEY || 'sxxk-chatbot-secret-key';

const adminHeaders = () => ({
  'X-Chatbot-Key': API_KEY,
});

// ── File management ───────────────────────────────────────

export async function listFiles() {
  const res = await fetch(`${BASE_URL}/api/v1/files`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error(`List files failed: ${res.status}`);
  return res.json(); // { files: [...] }
}

export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/api/v1/files/upload`);
    xhr.setRequestHeader('X-Chatbot-Key', API_KEY);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data);
        else reject(new Error(data.detail || `Upload failed: ${xhr.status}`));
      } catch {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

export async function reindexFile(filename) {
  const res = await fetch(
    `${BASE_URL}/api/v1/files/reindex/${encodeURIComponent(filename)}`,
    { method: 'POST', headers: adminHeaders() }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Reindex failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteFile(filename) {
  const res = await fetch(
    `${BASE_URL}/api/v1/files/${encodeURIComponent(filename)}`,
    { method: 'DELETE', headers: adminHeaders() }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Delete failed: ${res.status}`);
  }
  return res.json();
}

export function getDownloadUrl(filename) {
  return `${BASE_URL}/api/v1/files/download/${encodeURIComponent(filename)}`;
}

// ── Chat (admin preview – no auth needed) ─────────────────

export async function createSession(title = 'Admin preview') {
  const res = await fetch(`${BASE_URL}/api/v1/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
  return res.json();
}

export function streamAnswer(sessionId, question, { onChunk, onDone, onError } = {}) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/answer/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question }),
        signal: controller.signal,
      });
      if (!res.ok) { onError?.(`Lỗi kết nối: ${res.status}`); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6).trim());
              if (currentEvent === 'chunk') onChunk?.(payload.content ?? '');
              else if (currentEvent === 'done') onDone?.(payload);
              else if (currentEvent === 'error') onError?.(payload.message ?? 'Lỗi');
            } catch { /* ignore */ }
            currentEvent = '';
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError?.(err.message);
    }
  })();

  return () => controller.abort();
}

// ── Health ────────────────────────────────────────────────

export async function checkReady() {
  const res = await fetch(`${BASE_URL}/api/v1/health/ready`).catch(() => null);
  if (!res) return { ok: false, detail: 'Chatbot service không phản hồi' };
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data };
}
