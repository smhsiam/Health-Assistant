const { redact } = require('../services/redactionService');
const { groundItems } = require('../services/extractionService');

const text = [
  'SAMPLE LAB (SYNTHETIC)',
  'Patient: Test Patient',
  'Age: 35',
  'Phone: 01712345678',
  'Result   Unit   Test   Reference',
  '12.4   g/dL   Hemoglobin   13.0 - 17.0',
  '15000   /cumm   Platelet Count   150000 - 450000',
  '128   mg/dL   Fasting Blood Sugar   70 - 99',
].join('\n');

const safe = redact(text);

console.log('----- text after removing personal lines -----');
console.log(safe);

const fake = [
  { name: 'Hemoglobin', value: 12.4, unit: 'g/dL', refLow: 13, refHigh: 17, confidence: 0.95 },
  { name: 'Platelet Count', value: 15000, unit: '/cumm', confidence: 0.6 },
  { name: 'Fasting Blood Sugar', value: 182, unit: 'mg/dL', confidence: 0.99 },
  { name: 'Hemoglobin', value: 12.4, unit: 'g/dL', refLow: 12, refHigh: 16, confidence: 0.9 },
  { name: 'Vitamin D', value: 99, unit: 'ng/mL', confidence: 0.9 },
  { name: 'Hemoglobin', value: 12.4, unit: 'g/dL' },
];

console.log('----- checked AI answers (6 given) -----');
console.table(
  groundItems(fake, safe).map((item) => ({
    name: item.name,
    value: item.value,
    low: item.refLow,
    high: item.refHigh,
    confidence: item.confidence,
    verify: item.verify,
  }))
);