const express = require('express');
const {
  createAssignment, updateAssignment, deleteAssignment, studentAssignments, allAssignments,
} = require('../controllers/assignmentController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  createAssignmentRules, updateAssignmentRules, assignmentIdParamRules, paginationRules,
} = require('../middleware/validators');
const router = express.Router();

router.post('/', requireAuth, requireRole('admin'), createAssignmentRules, handleValidation, createAssignment);
router.put('/:id', requireAuth, requireRole('admin'), updateAssignmentRules, handleValidation, updateAssignment);
router.delete('/:id', requireAuth, requireRole('admin'), assignmentIdParamRules, handleValidation, deleteAssignment);
router.get('/mine', requireAuth, requireRole('student'), studentAssignments);
router.get('/', requireAuth, requireRole('admin'), paginationRules, handleValidation, allAssignments);

module.exports = router;
