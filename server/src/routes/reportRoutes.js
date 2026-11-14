const express = require('express');
const {
  createReport,
  listReports,
  getReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', protect, uploadLimiter, uploadSingle, createReport);
router.get('/', protect, listReports);
router.get('/:id', protect, getReport);

module.exports = router;