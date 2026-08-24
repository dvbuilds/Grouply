const express = require('express');
const { overview } = require('../controllers/analyticsController');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/overview', requireAuth, requireRole('admin'), overview);

module.exports = router;
