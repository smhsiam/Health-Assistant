require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { extractPdfText } = require('../services/pdfTextService');
const { extractItems } = require('../services/extractionService');
const { evaluate } = require('../services/ruleEngine');
const { checkCritical } = require('../services/triageService');
const { explainValue } = require('../services/explanationService');
const prompt = require('../prompts/extractionV1');

const root = path.join(__dirname, '..', '..', '..', 'evaluation');
const sheetDir = path.join(root, 'answer_sheet');
const reportDir = path.join(root, 'reports');
const outDir = path.join(root, 'predictions');
const useAi = process.argv.includes('--ai');

const buildProfile = (info) => {
  const data = info || {};
  const age = Number(data.age);

  return {
    sex: data.sex || null,
    birth_year: Number.isFinite(age) ? new Date().getFullYear() - age : null,
  };
};

const describeItem = (item, profile) => {
  const result = evaluate(item, profile);
  const critical = checkCritical(item);

  const explanation = explainValue({
    test_name: item.name,
    value: item.value,
    unit: item.unit || null,
    ref_low: result.refLow,
    ref_high: result.refHigh,
    flag: result.flag,
    is_critical: critical.isCritical,
  });

  return {
    name: item.name,
    value: item.value,
    unit: item.unit || '',
    flag: result.flag,
    critical: critical.isCritical,
    rangeSource: result.rangeSource,
    confidence: item.confidence === undefined ? null : item.confidence,
    needsReview: result.flag === 'unknown' || Boolean(item.verify),
    explanation,
  };
};

const run = async () => {
  if (!fs.existsSync(sheetDir)) {
    console.log('Folder evaluation/answer_sheet was not found');
    return;
  }

  const files = fs
    .readdirSync(sheetDir)
    .filter((name) => name.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    console.log('No answer sheets found in evaluation/answer_sheet');
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  console.log(`AI reading requested: ${useAi}`);

  for (const file of files) {
    try {
      const sheet = JSON.parse(fs.readFileSync(path.join(sheetDir, file), 'utf8'));
      const pdfPath = path.join(reportDir, sheet.report);

      if (!fs.existsSync(pdfPath)) {
        console.log(`Skipped ${file}: report file ${sheet.report} was not found`);
        continue;
      }

      const profile = buildProfile(sheet.profile);
      const started = Date.now();

      const extracted = await extractPdfText(fs.readFileSync(pdfPath));
      const outcome = await extractItems(extracted.text, { useAi });
      const ms = Date.now() - started;

      const items = outcome.items.map((item) => describeItem(item, profile));

      const record = {
        report: sheet.report,
        split: sheet.split || 'dev',
        meta: {
          ms,
          aiRequested: useAi,
          usedAi: outcome.usedAi,
          aiFailed: outcome.aiFailed,
          model: useAi ? process.env.AI_MODEL || null : null,
          promptVersion: prompt.version,
          textLines: extracted.lineCount,
        },
        items,
      };

      fs.writeFileSync(path.join(outDir, file), JSON.stringify(record, null, 2));
      console.log(`Done ${file}: ${items.length} values read in ${ms} ms`);
    } catch (error) {
      console.log(`Failed ${file}: ${error.message}`);
    }
  }
};

run();