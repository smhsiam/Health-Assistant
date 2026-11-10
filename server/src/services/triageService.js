const criticalRanges = require('../data/criticalRanges');
const { findTest, unitMatches } = require('./ruleEngine');

const urgencyMessage = {
  en: 'One or more values are in a range that needs prompt medical attention. Please see a doctor soon.',
  bn: 'এক বা একাধিক মান এমন সীমায় আছে যেখানে দ্রুত চিকিৎসকের পরামর্শ দরকার। অনুগ্রহ করে শিগগির ডাক্তার দেখান।',
};

const checkCritical = (item) => {
  const none = { isCritical: false, direction: null };
  const test = findTest(item.name);

  const empty =
    item.value === null || item.value === undefined || item.value === '';
  const value = empty ? NaN : Number(item.value);

  if (!test || !Number.isFinite(value)) {
    return none;
  }

  const limits = criticalRanges.find((entry) => entry.key === test.key);

  if (!limits || !unitMatches(test, item.unit)) {
    return none;
  }

  if (value < limits.low) {
    return { isCritical: true, direction: 'low' };
  }

  if (value > limits.high) {
    return { isCritical: true, direction: 'high' };
  }

  return none;
};

const checkReport = (items) => {
  const criticalNames = items
    .filter((item) => checkCritical(item).isCritical)
    .map((item) => item.name);

  return {
    hasCritical: criticalNames.length > 0,
    criticalNames,
    urgencyMessage,
  };
};

module.exports = { checkCritical, checkReport, urgencyMessage };