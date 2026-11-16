const { evaluate } = require('../services/ruleEngine');
const { checkCritical } = require('../services/triageService');

const thisYear = new Date().getFullYear();

const cases = [
  {
    label: 'Hb 12.4 male adult',
    item: { name: 'Hb', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'male', birth_year: 1990 },
  },
  {
    label: 'Hb 12.4 female adult',
    item: { name: 'Hb', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'female', birth_year: 1990 },
  },
  {
    label: 'Hb 11.0 sex and age unknown',
    item: { name: 'Hemoglobin', value: 11.0, unit: 'g/dL' },
    profile: {},
  },
  {
    label: 'Hb 6.5 female adult',
    item: { name: 'Hemoglobin', value: 6.5, unit: 'g/dL' },
    profile: { sex: 'female', birth_year: 1990 },
  },
  {
    label: 'FBS 128 adult',
    item: { name: 'Fasting Blood Sugar', value: 128, unit: 'mg/dL' },
    profile: { birth_year: 1990 },
  },
  {
    label: 'ALT 62 printed 0 to 40',
    item: { name: 'SGPT (ALT)', value: 62, unit: 'U/L', refLow: 0, refHigh: 40 },
    profile: {},
  },
  {
    label: 'Platelet 15000 adult',
    item: { name: 'Platelet Count', value: 15000, unit: '/µL' },
    profile: { birth_year: 1990 },
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
    label: 'Potassium 6.8 adult',
    item: { name: 'Potassium', value: 6.8, unit: 'mmol/L' },
    profile: { birth_year: 1990 },
  },
  {
    label: 'Hb 12.4 child aged 10, no printed range',
    item: { name: 'Hemoglobin', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'male', birth_year: thisYear - 10 },
  },
  {
    label: 'Hb 12.4 child aged 10, printed 11.5 to 15.5',
    item: { name: 'Hemoglobin', value: 12.4, unit: 'g/dL', refLow: 11.5, refHigh: 15.5 },
    profile: { sex: 'male', birth_year: thisYear - 10 },
  },
  {
    label: 'Hb 12.4 male born 18 years ago',
    item: { name: 'Hemoglobin', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'male', birth_year: thisYear - 18 },
  },
  {
    label: 'Hb 12.4 male born 19 years ago',
    item: { name: 'Hemoglobin', value: 12.4, unit: 'g/dL' },
    profile: { sex: 'male', birth_year: thisYear - 19 },
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