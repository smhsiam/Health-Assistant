const express = require('express');
const {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listProfiles);
router.post('/', protect, createProfile);
router.put('/:id', protect, updateProfile);
router.delete('/:id', protect, deleteProfile);

module.exports = router;