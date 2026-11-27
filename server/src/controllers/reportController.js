const fs = require('fs/promises');
const { extractPdfText } = require('../services/pdfTextService');
const { extractImageText } = require('../services/ocrService');
const { extractItems } = require('../services/extractionService');
const { evaluate, findTest } = require('../services/ruleEngine');
const { checkCritical, urgencyMessage } = require('../services/triageService');
const { explainValue } = require('../services/explanationService');
const reportModel = require('../models/reportModel');
const valueModel = require('../models/valueModel');
const profileModel = require('../models/profileModel');
const fileModel = require('../models/fileModel');

const LOW_OCR_CONFIDENCE = 70;

const toNumber = (input) =>
  input === null || input === undefined ? null : Number(input);

const formatValue = (row) => ({
  id: row.id,
  testName: row.test_name,
  value: toNumber(row.value),
  unit: row.unit,
  refLow: toNumber(row.ref_low),
  refHigh: toNumber(row.ref_high),
  flag: row.flag,
  isCritical: row.is_critical,
  confidence: toNumber(row.confidence),
  needsReview: row.needs_review,
  isCorrected: row.is_corrected,
  explanation: explainValue(row),
});

const formatReport = (row) => ({
  id: row.id,
  profileId: row.profile_id,
  fileName: row.file_name,
  reportDate: row.report_date,
  hasCritical: row.has_critical,
  status: row.status,
  createdAt: row.created_at,
});

const readReportDate = (input) => {
  const text = String(input || '').trim();

  if (!text) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }

  const parsed = new Date(`${text}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== text
  ) {
    return false;
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return text > tomorrow ? false : text;
};

const detectKind = async (filePath) => {
  const handle = await fs.open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(8);
    await handle.read(buffer, 0, 8, 0);

    if (buffer.toString('latin1', 0, 5) === '%PDF-') {
      return 'pdf';
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image';
    }

    const pngSignature = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    if (buffer.equals(pngSignature)) {
      return 'image';
    }

    return null;
  } finally {
    await handle.close();
  }
};

const createReport = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ message: 'Choose a PDF, JPG or PNG report to upload' });
  }

  try {
    const profileId = Number(req.body.profileId);

    if (!Number.isInteger(profileId) || profileId < 1) {
      return res.status(400).json({ message: 'Choose a profile for this report' });
    }

    const profile = await profileModel.findOwned(profileId, req.user.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const reportDate = readReportDate(req.body.reportDate);

    if (reportDate === false) {
      return res.status(400).json({
        message: 'Enter the report date as YYYY-MM-DD, not in the future',
      });
    }

    const useAi = String(req.body.useAi || '') === 'true';

    const kind = await detectKind(file.path);

    if (!kind) {
      return res
        .status(400)
        .json({ message: 'This file is not a valid PDF, JPG or PNG' });
    }

    const fileBuffer = await fs.readFile(file.path);

    let text = '';
    let ocrConfidence = null;
    let weakOcr = false;

    if (kind === 'pdf') {
      let extracted;
      try {
        extracted = await extractPdfText(fileBuffer);
      } catch (error) {
        return res.status(422).json({
          message:
            'This PDF could not be read. It may be damaged or protected by a password',
        });
      }

      if (extracted.likelyScanned) {
        return res.status(422).json({
          message:
            'This PDF has no readable text. Take a clear photo of the report and upload it as JPG or PNG',
        });
      }

      text = extracted.text;
    } else {
      let ocr;
      try {
        ocr = await extractImageText(file.path);
      } catch (error) {
        return res.status(422).json({
          message: 'This image could not be read. Try another photo',
        });
      }

      if (ocr.tooShort) {
        return res.status(422).json({
          message:
            'No readable text was found in this image. Take a clear, well lit photo of the whole page',
        });
      }

      text = ocr.text;
      ocrConfidence = ocr.confidence;
      weakOcr = ocr.confidence < LOW_OCR_CONFIDENCE;
    }

    const outcome = await extractItems(text, { useAi });
    const items = weakOcr
      ? outcome.items.map((item) => ({ ...item, verify: true }))
      : outcome.items;

    if (items.length === 0) {
      return res.status(422).json({
        message: outcome.aiFailed
          ? 'The AI reading service could not read this report right now. Please try again later'
          : 'No test results could be found in this report',
      });
    }

    const rows = items.map((item) => {
      const result = evaluate(item, profile);
      const critical = checkCritical(item);

      return {
        testName: item.name,
        value: item.value,
        unit: item.unit || null,
        refLow: result.refLow,
        refHigh: result.refHigh,
        flag: result.flag,
        isCritical: critical.isCritical,
        confidence: item.confidence,
        needsReview: result.flag === 'unknown' || item.verify,
      };
    });

    const hasCritical = rows.some((row) => row.isCritical);
    const label = reportDate || new Date().toISOString().slice(0, 10);

    const saved = await reportModel.createWithValues({
      userId: req.user.id,
      profileId,
      fileName: `Lab report ${label}`,
      reportDate,
      hasCritical,
      values: rows,
    });

    let fileStored = true;

    try {
      await fileModel.save(saved.report.id, file.mimetype, fileBuffer);
    } catch (error) {
      fileStored = false;
      console.error('Saving the original file failed:', error.message);
    }

    res.status(201).json({
      report: formatReport(saved.report),
      values: saved.values.map(formatValue),
      urgencyMessage: hasCritical ? urgencyMessage : null,
      aiUsed: outcome.usedAi,
      source: kind,
      ocrConfidence,
      hasFile: fileStored,
    });
  } catch (error) {
    next(error);
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }
};

const listReports = async (req, res, next) => {
  try {
    let profileId = null;

    if (req.query.profileId !== undefined) {
      profileId = Number(req.query.profileId);

      if (!Number.isInteger(profileId) || profileId < 1) {
        return res.status(400).json({ message: 'Invalid profile' });
      }
    }

    const rows = await reportModel.listByUser(req.user.id, profileId);

    res.json({
      reports: rows.map((row) => {
        const names = row.test_names || [];
        const categories = [];

        names.forEach((name) => {
          const test = findTest(name);
          if (test && !categories.includes(test.category)) {
            categories.push(test.category);
          }
        });

        return {
          ...formatReport(row),
          valueCount: Number(row.value_count),
          abnormalCount: Number(row.abnormal_count),
          reviewCount: Number(row.review_count),
          testNames: names,
          categories,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

const getReport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = await reportModel.findOwned(id, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const rows = await valueModel.listByReport(id);
    const hasFile = await fileModel.exists(id);

    res.json({
      report: formatReport(report),
      values: rows.map(formatValue),
      urgencyMessage: report.has_critical ? urgencyMessage : null,
      hasFile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  listReports,
  getReport,
  formatReport,
  formatValue,
};