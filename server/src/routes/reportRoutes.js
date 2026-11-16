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
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', protect, uploadLimiter, uploadSingle, createReport);
router.get('/', protect, listReports);
router.get('/:id', protect, getReport);
router.put('/:id/values/:valueId', protect, updateValue);
router.delete('/:id', protect, deleteReport);

module.exports = router;