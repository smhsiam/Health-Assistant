require('dotenv').config();
const { isEnabled, askForItems } = require('../services/aiClient');
const { redact } = require('../services/redactionService');
const { groundItems } = require('../services/extractionService');

const text = [
  'SAMPLE LAB (SYNTHETIC)',
  'Patient: Test Patient',
  'Age: 35',
  'Result   Unit   Test   Reference',
  '12.4   g/dL   Hemoglobin   13.0 - 17.0',
  '15000   /cumm   Platelet Count   150000 - 450000',
  '128   mg/dL   Fasting Blood Sugar   70 - 99',
  '176   mg/dL   Total Cholesterol   < 200',
].join('\n');

const run = async () => {
  console.log('AI configured:', isEnabled());

  if (!isEnabled()) {
    console.log('Fill AI_BASE_URL, AI_API_KEY and AI_MODEL in server/.env first');
    return;
  }

  const safe = redact(text);
  const items = await askForItems(safe);

  if (!items) {
    console.log('The AI answered, but not in the expected JSON shape');
    return;
  }

  console.log('Items returned by AI:', items.length);
  console.table(
    groundItems(items, safe).map((item) => ({
      name: item.name,
      value: item.value,
      unit: item.unit,
      low: item.refLow,
      high: item.refHigh,
      confidence: item.confidence,
      verify: item.verify,
    }))
  );
};

run().catch((error) => {
  console.error('Call failed:', error.message);
});