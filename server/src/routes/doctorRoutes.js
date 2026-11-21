const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  listVerified,
  getVerified,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/doctorController');

const router = express.Router();

router.get('/', protect, requireRole('patient', 'admin'), listVerified);
router.get('/me', protect, requireRole('doctor'), getMyProfile);
router.put('/me', protect, requireRole('doctor'), updateMyProfile);
router.get('/:id', protect, requireRole('patient', 'admin'), getVerified);

module.exports = router;