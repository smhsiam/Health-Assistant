require('dotenv').config();

const baseUrl = String(process.env.AI_BASE_URL || '').trim().replace(/\/+$/, '');
const key = String(process.env.AI_API_KEY || '').trim();

const run = async () => {
  if (!baseUrl || !key) {
    console.log('Fill AI_BASE_URL and AI_API_KEY in server/.env first');
    return;
  }

  const response = await fetch(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!response.ok) {
    let detail = '';

    try {
      const body = await response.json();
      const first = Array.isArray(body) ? body[0] : body;
      const raw =
        first && (first.error ? first.error.message || first.error : first.message);
      detail =
        typeof raw === 'string'
          ? raw.replace(/[A-Za-z0-9_-]{30,}/g, '[hidden]').slice(0, 250)
          : '';
    } catch (error) {
      detail = '';
    }

    console.log(`Could not list models: status ${response.status} ${detail}`);
    return;
  }

  const body = await response.json();
  const list = Array.isArray(body.data) ? body.data : [];
  const ids = list
    .map((item) => String(item.id || '').replace(/^models\//, ''))
    .filter((id) => id.startsWith('gemini'))
    .sort();

  console.log('Models found:', ids.length);
  ids.forEach((id) => console.log(id));
};

run().catch((error) => {
  console.error('Call failed:', error.message);
});