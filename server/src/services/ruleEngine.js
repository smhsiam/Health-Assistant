const referenceRanges = require('../data/referenceRanges');

const normalizeName = (name) =>
  String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const normalizeUnit = (unit) =>
  String(unit || '')
    .toLowerCase()
    .replace(/[\u00b5\u03bc]/g, 'u')
    .replace(/[\s.]/g, '');

const toNumber = (input) => {
  if (input === null || input === undefined || input === '') {
    return null;
  }
  const number = Number(input);
  return Number.isFinite(number) ? number : null;
};

const findTest = (name) => {
  const clean = normalizeName(name);
  return referenceRanges.find((test) => test.names.includes(clean)) || null;
};

const unitMatches = (test, unit) => test.units.includes(normalizeUnit(unit));

const classify = (value, low, high) => {
  if (low !== null && value < low) {
    return 'low';
  }
  if (high !== null && value > high) {
    return 'high';
  }
  return 'normal';
};

const pickRange = (test, sex) => {
  const key = String(sex || '').toLowerCase();
  const specific = test.ranges[key];

  if (specific) {
    return { low: specific.low, high: specific.high, source: 'standard' };
  }

  const sexBased = Boolean(test.ranges.male);
  return {
    low: test.ranges.any.low,
    high: test.ranges.any.high,
    source: sexBased ? 'standard_any_sex' : 'standard',
  };
};

const evaluate = (item, profile = {}) => {
  const test = findTest(item.name);
  const value = toNumber(item.value);
  const printedLow = toNumber(item.refLow);
  const printedHigh = toNumber(item.refHigh);
  const hasPrinted = printedLow !== null || printedHigh !== null;

  const result = {
    testKey: test ? test.key : null,
    category: test ? test.category : null,
    flag: 'unknown',
    refLow: null,
    refHigh: null,
    rangeSource: 'none',
    reason: '',
  };

  if (value === null) {
    result.reason = 'value_not_a_number';
    return result;
  }

  if (hasPrinted) {
    result.refLow = printedLow;
    result.refHigh = printedHigh;
    result.rangeSource = 'report';
    result.flag = classify(value, printedLow, printedHigh);
    return result;
  }

  if (!test) {
    result.reason = 'test_not_recognized';
    return result;
  }

  if (!unitMatches(test, item.unit)) {
    result.reason = 'unit_not_recognized';
    return result;
  }

  const range = pickRange(test, profile.sex);
  result.refLow = range.low;
  result.refHigh = range.high;
  result.rangeSource = range.source;
  result.flag = classify(value, range.low, range.high);
  return result;
};

module.exports = {
  normalizeName,
  normalizeUnit,
  findTest,
  unitMatches,
  classify,
  evaluate,
};