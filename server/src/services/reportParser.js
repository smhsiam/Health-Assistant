const { findTest } = require('./ruleEngine');

const MAX_ITEMS = 100;
const NUMBER = /^\d+(\.\d+)?$/;
const SINGLE_LINE =
  /^([A-Za-z][A-Za-z0-9 ()\/.%-]*?)\s+(\d[\d,]*(?:\.\d+)?)\s+([^\s\d<>-][^\s]*)\s*(.*)$/;

const cleanNumberText = (text) =>
  String(text || '')
    .trim()
    .replace(/(\d),(?=\d{3}\b)/g, '$1');

const parseRange = (text) => {
  const clean = cleanNumberText(text)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2264/g, '<=')
    .replace(/\u2265/g, '>=');

  if (/male|female/i.test(clean)) {
    return { low: null, high: null };
  }

  const between = clean.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/i);
  if (between) {
    const low = Number(between[1]);
    const high = Number(between[2]);
    return low <= high ? { low, high } : { low: null, high: null };
  }

  const upper = clean.match(/^\s*(?:<=?|up\s*to|upto)\s*(\d+(?:\.\d+)?)/i);
  if (upper) {
    return { low: null, high: Number(upper[1]) };
  }

  const lower = clean.match(/^\s*>=?\s*(\d+(?:\.\d+)?)/);
  if (lower) {
    return { low: Number(lower[1]), high: null };
  }

  return { low: null, high: null };
};

const looksLikeRange = (text) => /^[<>]|^\d/.test(String(text || '').trim());

const validName = (name) =>
  /^[A-Za-z]/.test(name) &&
  !name.endsWith(':') &&
  name.length >= 2 &&
  name.length <= 150;

const buildItem = (name, valueText, unit, rangeText) => {
  const cleanName = String(name).trim();

  if (!validName(cleanName)) {
    return null;
  }

  const range = parseRange(rangeText);

  return {
    name: cleanName,
    value: Number(valueText),
    unit: String(unit || '').trim().slice(0, 50),
    refLow: range.low,
    refHigh: range.high,
  };
};

const fromCells = (cells) => {
  const valueText = cleanNumberText(cells[1]);

  if (!NUMBER.test(valueText)) {
    return null;
  }

  const rest = cells.slice(2);
  let unit = '';
  let rangeText = '';

  if (looksLikeRange(rest[0])) {
    rangeText = rest.join(' ');
  } else {
    unit = rest[0];
    rangeText = rest.slice(1).join(' ');
  }

  return buildItem(cells[0], valueText, unit, rangeText);
};

const fromSingleLine = (line) => {
  const match = line.trim().match(SINGLE_LINE);

  if (!match) {
    return null;
  }

  const valueText = cleanNumberText(match[2]);

  if (!NUMBER.test(valueText)) {
    return null;
  }

  const item = buildItem(match[1], valueText, match[3], match[4]);

  if (!item) {
    return null;
  }

  const hasRange = item.refLow !== null || item.refHigh !== null;
  const unitLooksReal = /[\/%]/.test(item.unit);

  if (!findTest(item.name) && !unitLooksReal && !hasRange) {
    return null;
  }

  return item;
};

const parseReportText = (text) => {
  const items = [];

  String(text || '')
    .split('\n')
    .forEach((line) => {
      if (items.length >= MAX_ITEMS) {
        return;
      }

      const cells = line
        .split(/\s{2,}/)
        .map((cell) => cell.trim())
        .filter(Boolean);

      const item = cells.length >= 3 ? fromCells(cells) : fromSingleLine(line);

      if (item) {
        items.push(item);
      }
    });

  return items;
};

module.exports = { parseReportText, parseRange };