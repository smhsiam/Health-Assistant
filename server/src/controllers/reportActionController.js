const reportModel = require('../models/reportModel');
const valueModel = require('../models/valueModel');
const { explainValue } = require('../services/explanationService');
const { evaluate } = require('../services/ruleEngine');
const { checkCritical, urgencyMessage } = require('../services/triageService');
const { formatReport, formatValue } = require('./reportController');

const toNumber = (input) =>
  input === null || input === undefined ? null : Number(input);

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readNumber = (input) => {
  if (input === null || input === undefined) {
    return null;
  }

  const text = String(input).trim().replace(/,/g, '');

  if (text === '') {
    return null;
  }

  if (!/^\d+(\.\d+)?$/.test(text)) {
    return NaN;
  }

  const number = Number(text);
  return number < 1e9 ? number : NaN;
};

const updateValue = async (req, res, next) => {
  try {
    const reportId = readId(req.params.id);
    const valueId = readId(req.params.valueId);

    if (!reportId || !valueId) {
      return res.status(404).json({ message: 'Value not found' });
    }

    const report = await reportModel.findOwned(reportId, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const existing = await valueModel.findInReport(reportId, valueId);

    if (!existing) {
      return res.status(404).json({ message: 'Value not found' });
    }

    const body = req.body || {};
    const value = readNumber(body.value);

    if (value === null || Number.isNaN(value)) {
      return res
        .status(400)
        .json({ message: 'Enter a valid number for the result' });
    }

    let refLow = toNumber(existing.ref_low);
    let refHigh = toNumber(existing.ref_high);

    if ('refLow' in body) {
      refLow = readNumber(body.refLow);
    }

    if ('refHigh' in body) {
      refHigh = readNumber(body.refHigh);
    }

    if (Number.isNaN(refLow) || Number.isNaN(refHigh)) {
      return res
        .status(400)
        .json({ message: 'Enter valid numbers for the reference range' });
    }

    if (refLow !== null && refHigh !== null && refLow > refHigh) {
      return res.status(400).json({
        message: 'The lowest reference value cannot be higher than the highest',
      });
    }

    let unit = existing.unit;

    if ('unit' in body) {
      const text = String(body.unit || '').trim();

      if (text.length > 50) {
        return res.status(400).json({ message: 'The unit is too long' });
      }

      unit = text === '' ? null : text;
    }

    const profile = await profileModel.findOwned(report.profile_id, req.user.id);
    const item = { name: existing.test_name, value, unit, refLow, refHigh };
    const result = evaluate(item, { sex: profile ? profile.sex : null });
    const critical = checkCritical(item);

    const changed =
      value !== Number(existing.value) ||
      (unit || null) !== (existing.unit || null) ||
      refLow !== toNumber(existing.ref_low) ||
      refHigh !== toNumber(existing.ref_high);

    const done = await valueModel.applyCorrection({
      reportId,
      valueId,
      value,
      unit,
      refLow: result.refLow,
      refHigh: result.refHigh,
      flag: result.flag,
      isCritical: critical.isCritical,
      isCorrected: existing.is_corrected || changed,
    });

    if (!done) {
      return res.status(404).json({ message: 'Value not found' });
    }

    const updatedReport = await reportModel.findOwned(reportId, req.user.id);
    const rows = await valueModel.listByReport(reportId);

    res.json({
      report: formatReport(updatedReport),
      values: rows.map(formatValue),
      urgencyMessage: updatedReport.has_critical ? urgencyMessage : null,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const removed = await reportModel.deleteOwned(id, req.user.id);

    if (!removed) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateValue, deleteReport };