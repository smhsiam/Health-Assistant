const { evaluate } = require('../services/ruleEngine');
const { checkCritical } = require('../services/triageService');

const cases = [
  {
    label: 'Hb 12.4 male',
    item: { name: 'Hb', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'male' },
  },
  {
    label: 'Hb 12.4 female',
    item: { name: 'Hb', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'female' },
  },
  {
    label: 'Hb 11.0 sex unknown',
    item: { name: 'Hemoglobin', value: 11.0, unit: 'g/dL' },
    profile: {},
  },
  {
    label: 'Hb 6.5 female',
    item: { name: 'Hemoglobin', value: 6.5, unit: 'g/dL' },
    profile: { sex: 'female' },
  },
  {
    label: 'FBS 128',
    item: { name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL' },
    profile: {},
  },
  {
    label: 'ALT 62 printed 0 to 40',
    item: { name: 'ALT', value: 62, unit: 'U/L', refLow: 0, refHigh: 40 },
    profile: {},
  },
  {
    label: 'Platelet 15000',
    item: { name: 'Platelet Count', value: 15000, unit: '/µL' },
    profile: {},
  },
  {
    label: 'Glucose in mmol/L',
    item: { name: 'Fasting Glucose', value: 7.1, unit: 'mmol/L' },
    profile: {},
  },
  {
    label: 'Unknown test',
    item: { name: 'Mystery Test', value: 5, unit: 'mg' },
    profile: {},
  },
  {
    label: 'Value is text',
    item: { name: 'Total Cholesterol', value: 'abc', unit: 'mg/dL' },
    profile: {},
  },
  {
    label: 'Potassium 6.8',
    item: { name: 'Potassium', value: 6.8, unit: 'mmol/L' },
    profile: {},
  },
];

const rows = cases.map(({ label, item, profile }) => {
  const result = evaluate(item, profile);
  const critical = checkCritical(item);

  return {
    case: label,
    flag: result.flag,
    source: result.rangeSource,
    low: result.refLow,
    high: result.refHigh,
    critical: critical.isCritical ? critical.direction : 'no',
    reason: result.reason,
  };
});

console.table(rows);