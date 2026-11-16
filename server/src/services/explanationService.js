const { findTest } = require('./ruleEngine');
const content = require('../data/explanations');

const formatNumber = (number) => Number(number).toLocaleString('en-US');

const toNumber = (input) =>
  input === null || input === undefined ? null : Number(input);

const rangeText = (low, high, lang) => {
  if (low !== null && high !== null) {
    return lang === 'bn'
      ? `${formatNumber(low)} থেকে ${formatNumber(high)}`
      : `${formatNumber(low)} to ${formatNumber(high)}`;
  }

  if (high !== null) {
    return lang === 'bn'
      ? `সর্বোচ্চ ${formatNumber(high)}`
      : `up to ${formatNumber(high)}`;
  }

  if (low !== null) {
    return lang === 'bn'
      ? `কমপক্ষে ${formatNumber(low)}`
      : `at least ${formatNumber(low)}`;
  }

  return '';
};

const fill = (text, values) =>
  Object.keys(values).reduce(
    (out, key) => out.split(`{${key}}`).join(values[key]),
    text
  );

const explainValue = (row) => {
  const test = findTest(row.test_name);
  const measures = test ? content.measures[test.key] : null;

  const low = toNumber(row.ref_low);
  const high = toNumber(row.ref_high);
  const unit = row.unit ? ` ${row.unit}` : '';
  const result = `${formatNumber(row.value)}${unit}`;
  const flagKey = ['normal', 'high', 'low'].includes(row.flag)
    ? row.flag
    : 'unknown';

  const output = { en: '', bn: '' };

  ['en', 'bn'].forEach((lang) => {
    const parts = [];

    if (measures) {
      parts.push(measures[lang]);
    }

    parts.push(
      fill(content.flags[flagKey][lang], {
        result,
        range: rangeText(low, high, lang),
      })
    );

    if (row.is_critical) {
      parts.push(content.critical[lang]);
    }

    output[lang] = parts.join(' ');
  });

  return output;
};

module.exports = { explainValue };