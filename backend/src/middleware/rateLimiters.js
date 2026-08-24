const rateLimit = require('express-rate-limit');

// Stricter limit on login/register — the endpoints most attractive for
// credential stuffing / brute force. Keyed by IP (express-rate-limit default).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
});

// Looser limit for the rest of the API — abuse protection without making
// normal usage painful.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
});

module.exports = { authLimiter, apiLimiter };
