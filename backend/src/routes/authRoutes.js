const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiters');
const router = express.Router();

router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.get('/me', requireAuth, me);

module.exports = router;
