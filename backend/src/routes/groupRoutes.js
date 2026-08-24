const express = require('express');
const {
  createGroup, addMember, removeMember, leaveGroup, deleteGroup, myGroups, groupMembers, allGroups,
} = require('../controllers/groupController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');
const {
  createGroupRules, addMemberRules, groupIdParamRules, memberIdParamRules, paginationRules,
} = require('../middleware/validators');
const router = express.Router();

router.post('/', requireAuth, requireRole('student'), createGroupRules, handleValidation, createGroup);
router.post('/:groupId/members', requireAuth, requireRole('student'), addMemberRules, handleValidation, addMember);
router.delete('/:groupId/members/:userId', requireAuth, requireRole('student'), memberIdParamRules, handleValidation, removeMember);
router.post('/:groupId/leave', requireAuth, requireRole('student'), groupIdParamRules, handleValidation, leaveGroup);
router.delete('/:groupId', requireAuth, requireRole('student'), groupIdParamRules, handleValidation, deleteGroup);
router.get('/mine', requireAuth, requireRole('student'), myGroups);
router.get('/:groupId/members', requireAuth, groupIdParamRules, handleValidation, groupMembers);
router.get('/', requireAuth, requireRole('admin'), paginationRules, handleValidation, allGroups);

module.exports = router;
