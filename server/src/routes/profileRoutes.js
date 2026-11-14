const express = require('express');
const { listProfiles } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listProfiles);

module.exports = router;