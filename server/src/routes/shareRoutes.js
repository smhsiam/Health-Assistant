const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  createShare,
  listForReport,
  revokeShare,
  listIncoming,
  getIncomingReport,
} = require('../controllers/shareController');

const router = express.Router();

router.use(protect);

router.get('/incoming', requireRole('doctor'), listIncoming);
router.get('/incoming/:reportId', requireRole('doctor'), getIncomingReport);

router.post('/', requireRole('patient', 'admin'), createShare);
router.get('/report/:reportId', requireRole('patient', 'admin'), listForReport);
router.delete('/:id', requireRole('patient', 'admin'), revokeShare);

module.exports = router;