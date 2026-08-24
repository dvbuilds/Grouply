const express = require('express');
const {
  createGroup, addMember, removeMember, leaveGroup, deleteGroup, myGroups, groupMembers, allGroups,
} = require('../controllers/groupController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const { createGroupRules, addMemberRules } = require('../middleware/validators');
const router = express.Router();

router.post('/', requireAuth, requireRole('student'), createGroupRules, handleValidation, createGroup);
router.post('/:groupId/members', requireAuth, requireRole('student'), addMemberRules, handleValidation, addMember);
router.delete('/:groupId/members/:userId', requireAuth, requireRole('student'), removeMember);
router.post('/:groupId/leave', requireAuth, requireRole('student'), leaveGroup);
router.delete('/:groupId', requireAuth, requireRole('student'), deleteGroup);
router.get('/mine', requireAuth, requireRole('student'), myGroups);
router.get('/:groupId/members', requireAuth, groupMembers);
router.get('/', requireAuth, requireRole('admin'), allGroups);

module.exports = router;
