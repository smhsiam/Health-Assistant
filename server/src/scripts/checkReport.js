const fs = require('fs');
const { extractPdfText } = require('../services/pdfTextService');
const { parseReportText } = require('../services/reportParser');
const { evaluate } = require('../services/ruleEngine');
const { checkCritical } = require('../services/triageService');

const filePath = process.argv[2];
const sex = process.argv[3] || '';

if (!filePath) {
  console.error('Usage: node src/scripts/checkReport.js path-to-file.pdf [male|female]');
  process.exit(1);
}

const run = async () => {
  const buffer = fs.readFileSync(filePath);
  const extracted = await extractPdfText(buffer);
  const items = parseReportText(extracted.text);

  const rows = items.map((item) => {
    const result = evaluate(item, { sex });
    const critical = checkCritical(item);

    return {
      test: item.name,
      value: item.value,
      unit: item.unit,
      printed: `${item.refLow === null ? '' : item.refLow} to ${item.refHigh === null ? '' : item.refHigh}`,
      flag: result.flag,
      source: result.rangeSource,
      critical: critical.isCritical ? critical.direction : 'no',
      reason: result.reason,
    };
  });

  console.log('Lines read:', extracted.lineCount, ' Tests found:', items.length);
  console.table(rows);
};

run().catch((error) => {
  console.error('Could not read the PDF:', error.message);
  process.exit(1);
});