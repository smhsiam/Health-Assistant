const rateLimit = require('express-rate-limit');

const byUser = (req) => String(req.user.id);

const askMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: byUser,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many questions. Please wait a minute and try again' },
});

const askHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: byUser,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You asked many questions. Please try again later' },
});

module.exports = { askMinuteLimiter, askHourLimiter };