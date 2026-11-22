const consultationModel = require('../models/consultationModel');
const doctorModel = require('../models/doctorModel');
const reportModel = require('../models/reportModel');
const shareModel = require('../models/shareModel');

const MAX_MESSAGE = 2000;

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const readBody = (input) => {
  const text = String(input || '').trim();
  return text && text.length <= MAX_MESSAGE ? text : null;
};

const formatConsultation = (row, userId) => ({
  id: row.id,
  status: row.status,
  reportId: row.report_id,
  createdAt: row.created_at,
  patientName: row.patient_name,
  doctorName: row.doctor_name,
  specialty: row.specialty,
  myRole: row.patient_id === userId ? 'patient' : 'doctor',
});

const formatMessage = (row, consultation, userId) => ({
  id: row.id,
  body: row.body,
  createdAt: row.created_at,
  senderRole: row.sender_id === consultation.doctor_id ? 'doctor' : 'patient',
  mine: row.sender_id === userId,
});

const createConsultation = async (req, res, next) => {
  try {
    const doctorId = readId(req.body.doctorId);

    if (!doctorId) {
      return res.status(400).json({ message: 'Choose a doctor' });
    }

    const doctor = await doctorModel.findVerified(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    let reportId = null;

    if (req.body.reportId !== undefined && req.body.reportId !== null) {
      reportId = readId(req.body.reportId);

      if (!reportId) {
        return res.status(400).json({ message: 'Invalid report' });
      }

      const report = await reportModel.findOwned(reportId, req.user.id);

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      const shares = await shareModel.listForReport(reportId);
      const sharedWithDoctor = shares.some((item) => item.doctor_id === doctorId);

      if (!sharedWithDoctor) {
        return res
          .status(400)
          .json({ message: 'Share the report with this doctor first' });
      }
    }

    const existing = await consultationModel.findOpenBetween(
      req.user.id,
      doctorId
    );

    if (existing) {
      return res.status(409).json({
        message: 'You already have an open consultation with this doctor',
      });
    }

    const id = await consultationModel.create(req.user.id, doctorId, reportId);
    const row = await consultationModel.findForUser(id, req.user.id);

    res.status(201).json({ consultation: formatConsultation(row, req.user.id) });
  } catch (error) {
    next(error);
  }
};

const listConsultations = async (req, res, next) => {
  try {
    const rows = await consultationModel.listForUser(req.user.id);

    res.json({
      consultations: rows.map((row) => ({
        id: row.id,
        status: row.status,
        reportId: row.report_id,
        createdAt: row.created_at,
        patientName: row.patient_name,
        doctorName: row.doctor_name,
        specialty: row.specialty,
        myRole: row.patient_id === req.user.id ? 'patient' : 'doctor',
        messageCount: Number(row.message_count),
        lastMessageAt: row.last_message_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getConsultation = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const row = await consultationModel.findForUser(id, req.user.id);

    if (!row) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const messages = await consultationModel.listMessages(id);

    res.json({
      consultation: formatConsultation(row, req.user.id),
      messages: messages.map((item) => formatMessage(item, row, req.user.id)),
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const row = await consultationModel.findForUser(id, req.user.id);

    if (!row) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    if (row.status !== 'open') {
      return res.status(409).json({ message: 'This consultation is closed' });
    }

    const body = readBody(req.body.body);

    if (!body) {
      return res.status(400).json({
        message: `Write a message of up to ${MAX_MESSAGE} characters`,
      });
    }

    const saved = await consultationModel.addMessage(id, req.user.id, body);

    res.status(201).json({ message: formatMessage(saved, row, req.user.id) });
  } catch (error) {
    next(error);
  }
};

const closeConsultation = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const row = await consultationModel.findForUser(id, req.user.id);

    if (!row) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const done = await consultationModel.close(id);

    if (!done) {
      return res.status(409).json({ message: 'This consultation is closed' });
    }

    res.json({ message: 'Consultation closed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConsultation,
  listConsultations,
  getConsultation,
  sendMessage,
  closeConsultation,
};