const express = require('express');
const {
  createReport,
  listReports,
  getReport,
} = require('../controllers/reportController');
const {
  updateValue,
  deleteReport,
} = require('../controllers/reportActionController');
const { askAboutReport } = require('../controllers/reportQuestionController');
const { getOwnFile } = require('../controllers/fileController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  askMinuteLimiter,
  askHourLimiter,
} = require('../middleware/askLimiter');

const router = express.Router();
const patientOnly = requireRole('patient', 'admin');

router.post(
  '/',
  protect,
  patientOnly,
  uploadLimiter,
  uploadSingle,
  createReport
);
router.get('/', protect, patientOnly, listReports);
router.get('/:id', protect, patientOnly, getReport);
router.get('/:id/file', protect, patientOnly, getOwnFile);
router.put('/:id/values/:valueId', protect, patientOnly, updateValue);
router.post(
  '/:id/ask',
  protect,
  patientOnly,
  askMinuteLimiter,
  askHourLimiter,
  askAboutReport
);
router.delete('/:id', protect, patientOnly, deleteReport);

module.exports = router;