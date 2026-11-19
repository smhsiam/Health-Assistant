require('dotenv').config();

const baseUrl = String(process.env.AI_BASE_URL || '').trim().replace(/\/+$/, '');
const key = String(process.env.AI_API_KEY || '').trim();
const model = String(process.argv[2] || process.env.AI_MODEL || '').trim();
const LIMIT_MS = 60000;

const cleanMessage = (body) => {
  const first = Array.isArray(body) ? body[0] : body;
  const raw =
    first && (first.error ? first.error.message || first.error : first.message);

  if (typeof raw !== 'string') {
    return '';
  }

  return raw.replace(/[A-Za-z0-9_-]{30,}/g, '[hidden]').slice(0, 250);
};

const run = async () => {
  if (!baseUrl || !key || !model) {
    console.log('Fill AI_BASE_URL and AI_API_KEY in server/.env and give a model name');
    return;
  }

  console.log('Model:', model);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIMIT_MS);
  const started = Date.now();

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [{ role: 'user', content: 'Reply with the single word OK' }],
      }),
      signal: controller.signal,
    });

    const ms = Date.now() - started;
    const body = await response.json().catch(() => null);

    console.log('Status:', response.status, '| Time:', ms, 'ms');

    if (!response.ok) {
      console.log('Message:', cleanMessage(body) || 'none');
      return;
    }

    const choice = body && body.choices && body.choices[0];
    const text = choice && choice.message && choice.message.content;
    console.log('Reply:', String(text || '').slice(0, 100));
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`No answer within ${LIMIT_MS / 1000} seconds`);
    } else {
      console.log('Call failed:', error.message);
    }
  } finally {
    clearTimeout(timer);
  }
};

run();