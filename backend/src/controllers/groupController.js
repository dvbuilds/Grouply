const pool = require('../db/pool');

// Student creates a group and automatically becomes its first member (leader)
async function createGroup(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name is required' });

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
    console.error(err);
    res.status(500).json({ error: 'Could not create group' });
  } finally {
    client.release();
  }
}

// Add a member by email or student_id — only the leader can add members
async function addMember(req, res) {
  const { groupId } = req.params;
  const { email, student_id } = req.body;

  try {
    const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (!group.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (group.rows[0].leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group leader can add members' });
    }

    const userQuery = email
      ? await pool.query(`SELECT id FROM users WHERE email = $1 AND role = 'student'`, [email])
      : await pool.query(`SELECT id FROM users WHERE student_id = $1 AND role = 'student'`, [student_id]);

    if (!userQuery.rows.length) return res.status(404).json({ error: 'Student not found' });

    const memberId = userQuery.rows[0].id;
    await pool.query(
      `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [groupId, memberId]
    );
    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add member' });
  }
}

// Leader removes a member (cannot remove the leader themselves — use deleteGroup for that)
async function removeMember(req, res) {
  const { groupId, userId } = req.params;

  try {
    const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (!group.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (group.rows[0].leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group leader can remove members' });
    }
    if (Number(userId) === group.rows[0].leader_id) {
      return res.status(400).json({ error: 'The leader cannot be removed — delete the group instead' });
    }

    await pool.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove member' });
  }
}

// A non-leader member removes themselves from the group
async function leaveGroup(req, res) {
  const { groupId } = req.params;

  try {
    const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (!group.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (group.rows[0].leader_id === req.user.id) {
      return res.status(400).json({ error: 'The leader cannot leave — delete the group instead' });
    }

    const result = await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
      [groupId, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'You are not a member of this group' });
    res.json({ message: 'You left the group' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not leave group' });
  }
}

// Leader deletes the group entirely (cascades to memberships, targets, and submissions)
async function deleteGroup(req, res) {
  const { groupId } = req.params;

  try {
    const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (!group.rows.length) return res.status(404).json({ error: 'Group not found' });
    if (group.rows[0].leader_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the group leader can delete the group' });
    }

    await pool.query('DELETE FROM groups WHERE id = $1', [groupId]);
    res.json({ message: 'Group deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete group' });
  }
}

// Groups the logged-in student belongs to
async function myGroups(req, res) {
  const result = await pool.query(
    `SELECT g.*, 
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
     FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     WHERE gm.user_id = $1`,
    [req.user.id]
  );
  res.json(result.rows);
}

async function groupMembers(req, res) {
  const { groupId } = req.params;
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.student_id
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  res.json(result.rows);
}

// Admin: list every group with member count (for the analytics dashboard)
async function allGroups(req, res) {
  const result = await pool.query(
    `SELECT g.*, u.name AS leader_name,
            (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
     FROM groups g JOIN users u ON u.id = g.leader_id
     ORDER BY g.created_at DESC`
  );
  res.json(result.rows);
}

module.exports = {
  createGroup, addMember, removeMember, leaveGroup, deleteGroup, myGroups, groupMembers, allGroups,
};
