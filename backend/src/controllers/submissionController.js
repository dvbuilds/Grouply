const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, setPaginationHeaders } = require('../utils/pagination');

const confirmSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, groupId } = req.params;

  const membership = await pool.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, req.user.id]
  );
  if (!membership.rows.length) {
    throw new AppError(403, 'You are not a member of this group');
  }

  const result = await pool.query(
    `UPDATE submissions
     SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW()
     WHERE assignment_id = $2 AND group_id = $3
     RETURNING *`,
    [req.user.id, assignmentId, groupId]
  );
  if (!result.rows.length) {
    throw new AppError(404, 'This assignment does not target your group');
  }
  res.json(result.rows[0]);
});

const groupProgress = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (req.user.role !== 'admin') {
    const membership = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, req.user.id]
    );
    if (!membership.rows.length) {
      throw new AppError(403, 'You are not a member of this group');
    }
  }

  const result = await pool.query(
    `SELECT s.*, a.title, a.due_date
     FROM submissions s JOIN assignments a ON a.id = s.assignment_id
     WHERE s.group_id = $1 ORDER BY a.due_date ASC`,
    [groupId]
  );
  const total = result.rows.length;
  const confirmed = result.rows.filter(r => r.status === 'confirmed').length;
  res.json({
    submissions: result.rows,
    total,
    confirmed,
    percent: total ? Math.round((confirmed / total) * 100) : 0,
  });
});

const assignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const pagination = parsePagination(req.query);

  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT s.*, g.name AS group_name, u.name AS confirmed_by_name
       FROM submissions s
       JOIN groups g ON g.id = s.group_id
       LEFT JOIN users u ON u.id = s.confirmed_by
       WHERE s.assignment_id = $1
       ORDER BY g.name
       LIMIT $2 OFFSET $3`,
      [assignmentId, pagination.limit, pagination.offset]
    ),
    pool.query('SELECT COUNT(*) FROM submissions WHERE assignment_id = $1', [assignmentId]),
  ]);

  setPaginationHeaders(res, pagination, Number(countResult.rows[0].count));
  res.json(result.rows);
});

const assignmentStudentStatus = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const pagination = parsePagination(req.query);

  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_no,
              g.id AS group_id, g.name AS group_name,
              s.status, s.confirmed_at
       FROM submissions s
       JOIN groups g ON g.id = s.group_id
       JOIN group_members gm ON gm.group_id = g.id
       JOIN users u ON u.id = gm.user_id
       WHERE s.assignment_id = $1
       ORDER BY g.name, u.name
       LIMIT $2 OFFSET $3`,
      [assignmentId, pagination.limit, pagination.offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM submissions s
       JOIN group_members gm ON gm.group_id = s.group_id
       WHERE s.assignment_id = $1`,
      [assignmentId]
    ),
  ]);

  setPaginationHeaders(res, pagination, Number(countResult.rows[0].count));
  res.json(result.rows);
});

module.exports = { confirmSubmission, groupProgress, assignmentSubmissions, assignmentStudentStatus };
