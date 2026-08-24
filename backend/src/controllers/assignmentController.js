const pool = require('../db/pool');

// Admin creates an assignment, optionally scoped to specific groups.
// A `submissions` row is pre-created per target group so progress can be
// tracked from 'pending' without extra logic later.
async function createAssignment(req, res) {
  const { title, description, due_date, onedrive_link, target_scope, group_ids } = req.body;
  if (!title || !due_date || !onedrive_link) {
    return res.status(400).json({ error: 'title, due_date, onedrive_link are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const scope = target_scope === 'groups' ? 'groups' : 'all';

    const assignment = await client.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, target_scope, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, due_date, onedrive_link, scope, req.user.id]
    );
    const assignmentId = assignment.rows[0].id;

    let targetGroupIds = group_ids || [];
    if (scope === 'all') {
      const all = await client.query('SELECT id FROM groups');
      targetGroupIds = all.rows.map(r => r.id);
    } else {
      for (const gid of targetGroupIds) {
        await client.query(
          `INSERT INTO assignment_targets (assignment_id, group_id) VALUES ($1, $2)`,
          [assignmentId, gid]
        );
      }
    }

    for (const gid of targetGroupIds) {
      await client.query(
        `INSERT INTO submissions (assignment_id, group_id) VALUES ($1, $2)
         ON CONFLICT (assignment_id, group_id) DO NOTHING`,
        [assignmentId, gid]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(assignment.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Could not create assignment' });
  } finally {
    client.release();
  }
}

async function updateAssignment(req, res) {
  const { id } = req.params;
  const { title, description, due_date, onedrive_link } = req.body;
  const result = await pool.query(
    `UPDATE assignments SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       due_date = COALESCE($3, due_date),
       onedrive_link = COALESCE($4, onedrive_link)
     WHERE id = $5 RETURNING *`,
    [title, description, due_date, onedrive_link, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Assignment not found' });
  res.json(result.rows[0]);
}

// Admin deletes an assignment (cascades to its targets and submissions)
async function deleteAssignment(req, res) {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING id', [id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Assignment not found' });
  res.json({ message: 'Assignment deleted' });
}

// Assignments visible to the logged-in student: those targeting 'all',
// plus those scoped to a group the student belongs to.
async function studentAssignments(req, res) {
  const result = await pool.query(
    `SELECT DISTINCT a.*
     FROM assignments a
     LEFT JOIN assignment_targets t ON t.assignment_id = a.id
     LEFT JOIN group_members gm ON gm.group_id = t.group_id AND gm.user_id = $1
     WHERE a.target_scope = 'all' OR gm.user_id = $1
     ORDER BY a.due_date ASC`,
    [req.user.id]
  );
  res.json(result.rows);
}

async function allAssignments(req, res) {
  const result = await pool.query('SELECT * FROM assignments ORDER BY due_date ASC');
  res.json(result.rows);
}

module.exports = {
  createAssignment, updateAssignment, deleteAssignment, studentAssignments, allAssignments,
};
