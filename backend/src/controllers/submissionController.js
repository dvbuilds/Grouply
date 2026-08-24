const pool = require('../db/pool');

// Step 1: student clicks "Yes, I have submitted" -> frontend just shows a
// confirm dialog; the actual state change happens on step 2 (confirmSubmission)
// so nothing here needs its own endpoint — this comment documents the flow.

// Step 2: final confirm. Only a member of the group may confirm, and only
// for assignments that target that group.
async function confirmSubmission(req, res) {
  const { assignmentId, groupId } = req.params;

  try {
    const membership = await pool.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, req.user.id]
    );
    if (!membership.rows.length) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const result = await pool.query(
      `UPDATE submissions
       SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW()
       WHERE assignment_id = $2 AND group_id = $3
       RETURNING *`,
      [req.user.id, assignmentId, groupId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'This assignment does not target your group' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not confirm submission' });
  }
}

// A group's submission status across all its assignments, for the student's
// own progress bar.
async function groupProgress(req, res) {
  const { groupId } = req.params;
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
}

// Admin: every group's status for one assignment
async function assignmentSubmissions(req, res) {
  const { assignmentId } = req.params;
  const result = await pool.query(
    `SELECT s.*, g.name AS group_name, u.name AS confirmed_by_name
     FROM submissions s
     JOIN groups g ON g.id = s.group_id
     LEFT JOIN users u ON u.id = s.confirmed_by
     WHERE s.assignment_id = $1
     ORDER BY g.name`,
    [assignmentId]
  );
  res.json(result.rows);
}

// Admin: student-wise view for one assignment — every student in a targeted
// group, with the confirmation status inherited from their group (submission
// is a group action, but the admin still needs to see it per student, e.g.
// to know who is in an unconfirmed group).
async function assignmentStudentStatus(req, res) {
  const { assignmentId } = req.params;
  const result = await pool.query(
    `SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_no,
            g.id AS group_id, g.name AS group_name,
            s.status, s.confirmed_at
     FROM submissions s
     JOIN groups g ON g.id = s.group_id
     JOIN group_members gm ON gm.group_id = g.id
     JOIN users u ON u.id = gm.user_id
     WHERE s.assignment_id = $1
     ORDER BY g.name, u.name`,
    [assignmentId]
  );
  res.json(result.rows);
}

module.exports = { confirmSubmission, groupProgress, assignmentSubmissions, assignmentStudentStatus };
