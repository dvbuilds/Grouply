const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiters');
const router = express.Router();

// Stricter rate limit on credential-guessing-prone endpoints only, so a
// legitimate user polling /me doesn't get caught in the same bucket.
router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.get('/me', requireAuth, me);

module.exports = router;
