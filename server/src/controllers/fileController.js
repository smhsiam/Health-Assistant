const fileModel = require('../models/fileModel');
const reportModel = require('../models/reportModel');
const shareModel = require('../models/shareModel');

const readId = (input) => {
  const id = Number(input);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const sendFile = (res, file) => {
  res.setHeader('Content-Type', file.mime_type);
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(file.data);
};

const getOwnFile = async (req, res, next) => {
  try {
    const id = readId(req.params.id);

    if (!id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = await reportModel.findOwned(id, req.user.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const file = await fileModel.findByReport(id);

    if (!file) {
      return res.status(404).json({ message: 'No original file is stored' });
    }

    sendFile(res, file);
  } catch (error) {
    next(error);
  }
};

const getSharedFile = async (req, res, next) => {
  try {
    const id = readId(req.params.reportId);

    if (!id) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const shared = await shareModel.findActiveForDoctor(id, req.user.id);

    if (!shared) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const file = await fileModel.findByReport(id);

    if (!file) {
      return res.status(404).json({ message: 'No original file is stored' });
    }

    sendFile(res, file);
  } catch (error) {
    next(error);
  }
};

module.exports = { getOwnFile, getSharedFile };