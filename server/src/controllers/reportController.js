const fs = require('fs/promises');
const { hasPdfHeader, extractPdfText } = require('../services/pdfTextService');
const { parseReportText } = require('../services/reportParser');
const { evaluate } = require('../services/ruleEngine');
const { checkCritical, urgencyMessage } = require('../services/triageService');
const reportModel = require('../models/reportModel');
const valueModel = require('../models/valueModel');
const profileModel = require('../models/profileModel');

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

const createReport = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Choose a PDF file to upload' });
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

    const validHeader = await hasPdfHeader(file.path);

    if (!validHeader) {
      return res.status(400).json({ message: 'This file is not a valid PDF' });
    }

    const buffer = await fs.readFile(file.path);

    let extracted;
    try {
      extracted = await extractPdfText(buffer);
    } catch (error) {
      return res.status(422).json({
        message:
          'This PDF could not be read. It may be damaged or protected by a password',
      });
    }

    if (extracted.likelyScanned) {
      return res.status(422).json({
        message:
          'No readable text was found. Scanned or photo reports are not supported yet',
      });
    }

    const items = parseReportText(extracted.text);

    if (items.length === 0) {
      return res.status(422).json({
        message: 'No test results could be found in this report',
      });
    }

    const rows = items.map((item) => {
      const result = evaluate(item, { sex: profile.sex });
      const critical = checkCritical(item);

      return {
        testName: item.name,
        value: item.value,
        unit: item.unit || null,
        refLow: result.refLow,
        refHigh: result.refHigh,
        flag: result.flag,
        isCritical: critical.isCritical,
        confidence: null,
        needsReview: result.flag === 'unknown',
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

    res.status(201).json({
      report: formatReport(saved.report),
      values: saved.values.map(formatValue),
      urgencyMessage: hasCritical ? urgencyMessage : null,
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
      reports: rows.map((row) => ({
        ...formatReport(row),
        valueCount: Number(row.value_count),
        abnormalCount: Number(row.abnormal_count),
      })),
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

    res.json({
      report: formatReport(report),
      values: rows.map(formatValue),
      urgencyMessage: report.has_critical ? urgencyMessage : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, listReports, getReport };