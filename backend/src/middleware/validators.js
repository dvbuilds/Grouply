const { body, param, query } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Please select a valid account type'),
  body('student_id').optional({ checkFalsy: true }).isLength({ max: 50 }),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createGroupRules = [
  body('name').trim().notEmpty().withMessage('Group name is required').isLength({ max: 100 }),
];

const addMemberRules = [
  param('groupId').isInt().withMessage('Invalid group'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('student_id').optional({ checkFalsy: true }).isLength({ max: 50 }),
  body().custom((value) => {
    if (!value.email && !value.student_id) {
      throw new Error('Please provide either an email or a student ID');
    }
    return true;
  }),
];

const groupIdParamRules = [
  param('groupId').isInt().withMessage('Invalid group'),
];

const memberIdParamRules = [
  param('groupId').isInt().withMessage('Invalid group'),
  param('userId').isInt().withMessage('Invalid user'),
];

const assignmentIdParamRules = [
  param('id').isInt().withMessage('Invalid assignment'),
];

const submissionParamRules = [
  param('assignmentId').isInt().withMessage('Invalid assignment'),
  param('groupId').isInt().withMessage('Invalid group'),
];

const assignmentIdOnlyParamRules = [
  param('assignmentId').isInt().withMessage('Invalid assignment'),
];

const createAssignmentRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').optional({ checkFalsy: true }).isLength({ max: 5000 }),
  body('due_date').isISO8601().withMessage('Please enter a valid due date'),
  body('onedrive_link').trim().isURL().withMessage('Please enter a valid resource link'),
  body('target_scope').optional().isIn(['all', 'groups']),
  body('group_ids').optional().isArray().withMessage('Invalid group selection'),
  body('group_ids.*').optional().isInt().withMessage('Invalid group selection'),
];

const updateAssignmentRules = [
  param('id').isInt().withMessage('Invalid assignment'),
  body('title').optional().trim().isLength({ max: 150 }),
  body('due_date').optional().isISO8601(),
  body('onedrive_link').optional().trim().isURL(),
];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit value'),
];

module.exports = {
  registerRules, loginRules, createGroupRules, addMemberRules,
  groupIdParamRules, memberIdParamRules, assignmentIdParamRules,
  submissionParamRules, assignmentIdOnlyParamRules,
  createAssignmentRules, updateAssignmentRules, paginationRules,
};
