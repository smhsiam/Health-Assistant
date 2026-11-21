const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  listForAdmin,
  setDoctorStatus,
} = require('../controllers/doctorController');

const router = express.Router();

router.use(protect, requireRole('admin'));

router.get('/doctors', listForAdmin);
router.put('/doctors/:id/status', setDoctorStatus);

module.exports = router;