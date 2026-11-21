const shareModel = require('../models/shareModel');
const reportModel = require('../models/reportModel');
const valueModel = require('../models/valueModel');
const doctorModel = require('../models/doctorModel');
const { formatReport, formatValue } = require('./reportController');

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const createShare = async (req, res, next) => {
  try {
    const reportId = readId(req.body.reportId);
    const doctorId = readId(req.body.doctorId);

    if (!reportId || !doctorId) {
      return res.status(400).json({ message: 'Choose a report and a doctor' });
    }

    const report = await reportModel.findOwned(reportId, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const doctor = await doctorModel.findVerified(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const share = await shareModel.createShare(reportId, doctorId);

    res.status(201).json({
      share: {
        id: share.id,
        reportId: share.report_id,
        doctorId: share.doctor_id,
        sharedAt: share.shared_at,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res
        .status(409)
        .json({ message: 'This report is already shared with this doctor' });
    }
    next(error);
  }
};

const listForReport = async (req, res, next) => {
  try {
    const reportId = readId(req.params.reportId);

    if (!reportId) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = await reportModel.findOwned(reportId, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const rows = await shareModel.listForReport(reportId);

    res.json({
      shares: rows.map((row) => ({
        id: row.id,
        doctorId: row.doctor_id,
        doctorName: row.name,
        specialty: row.specialty,
        sharedAt: row.shared_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const revokeShare = async (req, res, next) => {
  try {
    const shareId = readId(req.params.id);

    if (!shareId) {
      return res.status(404).json({ message: 'Share not found' });
    }

    const done = await shareModel.revokeOwned(shareId, req.user.id);

    if (!done) {
      return res.status(404).json({ message: 'Share not found' });
    }

    res.json({ message: 'Sharing stopped' });
  } catch (error) {
    next(error);
  }
};

const listIncoming = async (req, res, next) => {
  try {
    const rows = await shareModel.listIncoming(req.user.id);

    res.json({
      reports: rows.map((row) => ({
        shareId: row.share_id,
        sharedAt: row.shared_at,
        reportId: row.report_id,
        reportDate: row.report_date,
        hasCritical: row.has_critical,
        patientName: row.profile_name,
        valueCount: Number(row.value_count),
        abnormalCount: Number(row.abnormal_count),
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getIncomingReport = async (req, res, next) => {
  try {
    const reportId = readId(req.params.reportId);

    if (!reportId) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = await shareModel.findActiveForDoctor(reportId, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const rows = await valueModel.listByReport(reportId);

    const values = rows.map((row) => {
      const { explanation, ...rest } = formatValue(row);
      return rest;
    });

    res.json({
      report: formatReport(report),
      patient: {
        name: report.profile_name,
        sex: report.sex,
        birthYear: report.birth_year,
      },
      values,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShare,
  listForReport,
  revokeShare,
  listIncoming,
  getIncomingReport,
};