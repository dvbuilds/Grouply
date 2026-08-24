const express = require('express');
const {
  confirmSubmission, groupProgress, assignmentSubmissions, assignmentStudentStatus,
} = require('../controllers/submissionController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  submissionParamRules, groupIdParamRules, assignmentIdOnlyParamRules, paginationRules,
} = require('../middleware/validators');
const router = express.Router();

router.post('/:assignmentId/groups/:groupId/confirm', requireAuth, requireRole('student'), submissionParamRules, handleValidation, confirmSubmission);
router.get('/groups/:groupId/progress', requireAuth, groupIdParamRules, handleValidation, groupProgress);
router.get('/:assignmentId/students', requireAuth, requireRole('admin'), assignmentIdOnlyParamRules, paginationRules, handleValidation, assignmentStudentStatus);
router.get('/:assignmentId', requireAuth, requireRole('admin'), assignmentIdOnlyParamRules, paginationRules, handleValidation, assignmentSubmissions);

module.exports = router;
