const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, setPaginationHeaders } = require('../utils/pagination');

// Student creates a group and automatically becomes its first member (leader)
const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const group = await client.query(
      `INSERT INTO groups (name, leader_id) VALUES ($1, $2) RETURNING *`,
      [name, req.user.id]
    );
    await client.query(
      `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
      [group.rows[0].id, req.user.id]
    );
    await client.query('COMMIT');
    res.status(201).json(group.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// Add a member by email or student_id — only the leader can add members
const addMember = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { email, student_id } = req.body;

  const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
  if (!group.rows.length) throw new AppError(404, 'Group not found');
  if (group.rows[0].leader_id !== req.user.id) {
    throw new AppError(403, 'Only the group leader can add members');
  }

  const userQuery = email
    ? await pool.query(`SELECT id FROM users WHERE email = $1 AND role = 'student'`, [email])
    : await pool.query(`SELECT id FROM users WHERE student_id = $1 AND role = 'student'`, [student_id]);

  if (!userQuery.rows.length) throw new AppError(404, 'Student not found');

  const memberId = userQuery.rows[0].id;
  await pool.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [groupId, memberId]
  );
  res.status(201).json({ message: 'Member added' });
});

// Leader removes a member (cannot remove the leader themselves — use deleteGroup for that)
const removeMember = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.params;

  const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
  if (!group.rows.length) throw new AppError(404, 'Group not found');
  if (group.rows[0].leader_id !== req.user.id) {
    throw new AppError(403, 'Only the group leader can remove members');
  }
  if (Number(userId) === group.rows[0].leader_id) {
    throw new AppError(400, 'The leader cannot be removed — delete the group instead');
  }

  await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
  res.json({ message: 'Member removed' });
});

// A non-leader member removes themselves from the group
const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
  if (!group.rows.length) throw new AppError(404, 'Group not found');
  if (group.rows[0].leader_id === req.user.id) {
    throw new AppError(400, 'The leader cannot leave — delete the group instead');
  }

  const result = await pool.query(
    'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
    [groupId, req.user.id]
  );
  if (!result.rows.length) throw new AppError(404, 'You are not a member of this group');
  res.json({ message: 'You left the group' });
});

// Leader deletes the group entirely (cascades to memberships, targets, and submissions)
const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
  if (!group.rows.length) throw new AppError(404, 'Group not found');
  if (group.rows[0].leader_id !== req.user.id) {
    throw new AppError(403, 'Only the group leader can delete the group');
  }

  await pool.query('DELETE FROM groups WHERE id = $1', [groupId]);
  res.json({ message: 'Group deleted' });
});

// Groups the logged-in student belongs to (naturally small — one user's own memberships)
const myGroups = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT g.*, 
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
     FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     WHERE gm.user_id = $1`,
    [req.user.id]
  );
  res.json(result.rows);
});

// Member list for one group — restricted to admins and that group's own
// members, so a student can't enumerate the roster of a group they're not in.
const groupMembers = asyncHandler(async (req, res) => {
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
    `SELECT u.id, u.name, u.email, u.student_id
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  res.json(result.rows);
});

// Admin: list every group with member count (for the analytics dashboard).
// Bounded + paginated (via X-Total-Count/X-Page/etc headers) since the
// number of groups grows with enrollment and shouldn't be loaded unbounded.
const allGroups = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);

  const [result, countResult] = await Promise.all([
    pool.query(
      `SELECT g.*, u.name AS leader_name,
              (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
       FROM groups g JOIN users u ON u.id = g.leader_id
       ORDER BY g.created_at DESC
       LIMIT $1 OFFSET $2`,
      [pagination.limit, pagination.offset]
    ),
    pool.query('SELECT COUNT(*) FROM groups'),
  ]);

  setPaginationHeaders(res, pagination, Number(countResult.rows[0].count));
  res.json(result.rows);
});

module.exports = {
  createGroup, addMember, removeMember, leaveGroup, deleteGroup, myGroups, groupMembers, allGroups,
};
