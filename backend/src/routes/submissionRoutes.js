const express = require('express');
const {
  confirmSubmission, groupProgress, assignmentSubmissions, assignmentStudentStatus,
} = require('../controllers/submissionController');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.post('/:assignmentId/groups/:groupId/confirm', requireAuth, requireRole('student'), confirmSubmission);
router.get('/groups/:groupId/progress', requireAuth, groupProgress);
router.get('/:assignmentId/students', requireAuth, requireRole('admin'), assignmentStudentStatus);
router.get('/:assignmentId', requireAuth, requireRole('admin'), assignmentSubmissions);

module.exports = router;
