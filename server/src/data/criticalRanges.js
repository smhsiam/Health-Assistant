const criticalRanges = [
  { key: 'hemoglobin', low: 7.0, high: 20.0, verified: false },
  { key: 'wbc', low: 2000, high: 30000, verified: false },
  { key: 'platelet', low: 20000, high: 1000000, verified: false },
  { key: 'fasting_glucose', low: 40, high: 500, verified: false },
  { key: 'potassium', low: 2.5, high: 6.5, verified: false },
  { key: 'sodium', low: 120, high: 160, verified: false },
];

module.exports = criticalRanges;