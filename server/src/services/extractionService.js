const { parseReportText } = require('./reportParser');
const { redact } = require('./redactionService');
const { isEnabled, askForItems } = require('./aiClient');
const { normalizeName } = require('./ruleEngine');

const MIN_PARSED = 3;
const CONFIDENCE_LIMIT = 0.8;
const MAX_ITEMS = 100;

const numbersIn = (text) => {
  const found = new Set();
  const matches = String(text).match(/\d[\d,]*(?:\.\d+)?/g) || [];

  matches.forEach((match) => {
    const number = Number(match.replace(/,/g, ''));
    if (Number.isFinite(number)) {
      found.add(number);
    }
  });

  return found;
};

const asNumber = (input) => {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const number = Number(input);
  return Number.isFinite(number) ? number : NaN;
};

const groundItems = (items, text) => {
  const numbers = numbersIn(text);
  const lines = String(text)
    .split('\n')
    .map((line) => ({
      norm: ` ${normalizeName(line)} `,
      nums: numbersIn(line),
    }));

  const result = [];

  items.slice(0, MAX_ITEMS).forEach((raw) => {
    if (!raw || typeof raw !== 'object') {
      return;
    }

    const name = String(raw.name || '').trim();
    const value = asNumber(raw.value);

    if (!name || name.length > 150 || !/^[A-Za-z]/.test(name)) {
      return;
    }

    if (value === null || Number.isNaN(value) || !numbers.has(value)) {
      return;
    }

    let verify = false;
    let refLow = asNumber(raw.refLow);
    let refHigh = asNumber(raw.refHigh);

    if (Number.isNaN(refLow) || (refLow !== null && !numbers.has(refLow))) {
      refLow = null;
      verify = true;
    }

    if (Number.isNaN(refHigh) || (refHigh !== null && !numbers.has(refHigh))) {
      refHigh = null;
      verify = true;
    }

    if (refLow !== null && refHigh !== null && refLow > refHigh) {
      refLow = null;
      refHigh = null;
      verify = true;
    }

    const clean = normalizeName(name);
    const sameLine = lines.some(
      (line) => clean && line.norm.includes(` ${clean} `) && line.nums.has(value)
    );

        const nameFound = lines.some(
      (line) => clean && line.norm.includes(` ${clean} `)
    );

    if (!nameFound) {
      return;
    }

    if (!sameLine) {
      verify = true;
    }

    let confidence = asNumber(raw.confidence);

    if (confidence === null || Number.isNaN(confidence)) {
      confidence = 0;
    }

    confidence = Math.round(Math.min(1, Math.max(0, confidence)) * 100) / 100;

    if (confidence < CONFIDENCE_LIMIT) {
      verify = true;
    }

    result.push({
      name,
      value,
      unit: String(raw.unit || '').trim().slice(0, 50),
      refLow,
      refHigh,
      confidence,
      verify,
    });
  });

  return result;
};

const keyOf = (item) => `${normalizeName(item.name)}|${item.value}`;

const extractItems = async (text, { useAi }) => {
  const parsed = parseReportText(text).map((item) => ({
    ...item,
    confidence: null,
    verify: false,
  }));

  const outcome = { items: parsed, usedAi: false, aiFailed: false };

  if (!useAi || !isEnabled() || parsed.length >= MIN_PARSED) {
    return outcome;
  }

  try {
    const safeText = redact(text);
    const aiItems = await askForItems(safeText);

    if (!aiItems) {
      outcome.aiFailed = true;
      return outcome;
    }

    const seen = new Set(parsed.map(keyOf));
    const extra = groundItems(aiItems, safeText).filter((item) => {
      const key = keyOf(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    outcome.items = parsed.concat(extra);
    outcome.usedAi = true;
    return outcome;
  } catch (error) {
    console.error('AI reading failed:', error.message);
    outcome.aiFailed = true;
    return outcome;
  }
};

module.exports = { extractItems, groundItems, numbersIn };