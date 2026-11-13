const express = require('express');
const { previewText } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/preview-text', protect, uploadLimiter, uploadSingle, previewText);

module.exports = router;