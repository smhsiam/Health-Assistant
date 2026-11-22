const prompt = require('../prompts/extractionV1');

const TIMEOUT_MS = 30000;

const readConfig = () => ({
  baseUrl: String(process.env.AI_BASE_URL || '').trim().replace(/\/+$/, ''),
  key: String(process.env.AI_API_KEY || '').trim(),
  model: String(process.env.AI_MODEL || '').trim(),
});

const isEnabled = () => {
  const { baseUrl, key, model } = readConfig();
  return Boolean(baseUrl && key && model);
};

const readErrorDetail = async (response) => {
  try {
    let body = await response.json();

    if (Array.isArray(body)) {
      body = body[0];
    }

    const raw = body && (body.error ? body.error.message || body.error : body.message);

    if (typeof raw !== 'string') {
      return '';
    }

    return raw.replace(/[A-Za-z0-9_-]{30,}/g, '[hidden]').slice(0, 250);
  } catch (error) {
    return '';
  }
};

const callOnce = async (system, user) => {
  const { baseUrl, key, model } = readConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

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
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await readErrorDetail(response);

      throw new Error(
        detail
          ? `AI service returned status ${response.status}: ${detail}`
          : `AI service returned status ${response.status}`
      );
    }

    const data = await response.json();
    const choice = data && data.choices && data.choices[0];
    const content = choice && choice.message && choice.message.content;

    if (typeof content !== 'string') {
      throw new Error('AI service returned no text');
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
};

const parseItems = (content) => {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end <= start) {
    return null;
  }

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return parsed && Array.isArray(parsed.items) ? parsed.items : null;
  } catch (error) {
    return null;
  }
};

const askForItems = async (text) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const content = await callOnce(prompt.system, prompt.buildUser(text));
    const items = parseItems(content);

    if (items) {
      return items;
    }
  }

  return null;
};

const askText = (system, user) => callOnce(system, user);

module.exports = { isEnabled, askForItems, askText };