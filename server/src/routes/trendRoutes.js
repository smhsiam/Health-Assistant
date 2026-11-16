const express = require('express');
const { listTrends, getTrend } = require('../controllers/trendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listTrends);
router.get('/:testKey', protect, getTrend);

module.exports = router;