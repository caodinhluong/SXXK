const BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

// ── Session ──────────────────────────────────────────────

export async function createSession(title = 'Cuộc trò chuyện mới') {
  const res = await fetch(`${BASE_URL}/api/v1/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
  return res.json();
}

export async function getSessionMessages(sessionId) {
  const res = await fetch(`${BASE_URL}/api/v1/chat/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`Load history failed: ${res.status}`);
  return res.json();
}

// ── Streaming answer ──────────────────────────────────────

/**
 * Stream a chat answer via SSE.
 *
 * @param {string} sessionId
 * @param {string} question
 * @param {{ onStart, onChunk, onDone, onError }} callbacks
 * @returns {() => void}  abort function
 */
export function streamAnswer(sessionId, question, { onStart, onChunk, onDone, onError } = {}) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/chat/answer/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question }),
        signal: controller.signal,
      });
      if (!res.ok) {
        onError?.(`Lỗi kết nối: ${res.status}`);
        return;
      }

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
            const raw = line.slice(6).trim();
            try {
              const payload = JSON.parse(raw);
              if (currentEvent === 'start') onStart?.(payload);
              else if (currentEvent === 'chunk') onChunk?.(payload.content ?? '');
              else if (currentEvent === 'done') onDone?.(payload);
              else if (currentEvent === 'error') onError?.(payload.message ?? 'Lỗi không xác định');
            } catch { /* ignore parse errors */ }
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

// ── Non-streaming answer (fallback) ───────────────────────

export async function sendAnswer(sessionId, question) {
  const res = await fetch(`${BASE_URL}/api/v1/chat/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  });
  if (!res.ok) throw new Error(`Answer failed: ${res.status}`);
  return res.json();
}

// ── Health check ──────────────────────────────────────────

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/v1/health/live`);
  return res.ok;
}
