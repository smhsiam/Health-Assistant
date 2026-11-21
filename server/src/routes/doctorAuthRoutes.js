const express = require('express');
const { registerDoctor } = require('../controllers/authController');

const router = express.Router();

router.post('/register-doctor', registerDoctor);

module.exports = router;