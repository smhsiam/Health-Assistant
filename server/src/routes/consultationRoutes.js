const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  createConsultation,
  listConsultations,
  getConsultation,
  sendMessage,
  closeConsultation,
} = require('../controllers/consultationController');

const router = express.Router();

router.use(protect, requireRole('patient', 'doctor', 'admin'));

router.get('/', listConsultations);
router.post('/', requireRole('patient', 'admin'), createConsultation);
router.get('/:id', getConsultation);
router.post('/:id/messages', sendMessage);
router.put('/:id/close', closeConsultation);

module.exports = router;