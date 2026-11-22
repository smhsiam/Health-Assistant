const express = require('express');
const { registerDoctor } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register-doctor', authLimiter, registerDoctor);

module.exports = router;