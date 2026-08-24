const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { registerRules, loginRules } = require('../middleware/validators');
const router = express.Router();

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.get('/me', requireAuth, me);

module.exports = router;
