const { body, param } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'admin']).withMessage('role must be student or admin'),
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
  param('groupId').isInt().withMessage('Invalid group id'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('student_id').optional({ checkFalsy: true }).isLength({ max: 50 }),
  body().custom((value) => {
    if (!value.email && !value.student_id) {
      throw new Error('Provide either email or student_id');
    }
    return true;
  }),
];

const createAssignmentRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 150 }),
  body('description').optional({ checkFalsy: true }).isLength({ max: 5000 }),
  body('due_date').isISO8601().withMessage('due_date must be a valid date'),
  body('onedrive_link').trim().isURL().withMessage('onedrive_link must be a valid URL'),
  body('target_scope').optional().isIn(['all', 'groups']),
  body('group_ids').optional().isArray().withMessage('group_ids must be an array'),
];

const updateAssignmentRules = [
  param('id').isInt().withMessage('Invalid assignment id'),
  body('title').optional().trim().isLength({ max: 150 }),
  body('due_date').optional().isISO8601(),
  body('onedrive_link').optional().trim().isURL(),
];

module.exports = {
  registerRules, loginRules, createGroupRules, addMemberRules,
  createAssignmentRules, updateAssignmentRules,
};
