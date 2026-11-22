const express = require('express');
const {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
const patientOnly = requireRole('patient', 'admin');

router.get('/', protect, patientOnly, listProfiles);
router.post('/', protect, patientOnly, createProfile);
router.put('/:id', protect, patientOnly, updateProfile);
router.delete('/:id', protect, patientOnly, deleteProfile);

module.exports = router;