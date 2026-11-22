const express = require('express');
const { listTrends, getTrend } = require('../controllers/trendController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
const patientOnly = requireRole('patient', 'admin');

router.get('/', protect, patientOnly, listTrends);
router.get('/:testKey', protect, patientOnly, getTrend);

module.exports = router;