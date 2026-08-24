const pool = require('../db/pool');

async function overview(req, res) {
  const totals = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM assignments) AS total_assignments,
      (SELECT COUNT(*) FROM groups) AS total_groups,
      (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
      (SELECT COUNT(*) FROM submissions WHERE status = 'confirmed') AS confirmed_submissions,
      (SELECT COUNT(*) FROM submissions) AS total_submissions
  `);

  const perAssignment = await pool.query(`
    SELECT a.id, a.title, a.due_date,
           COUNT(s.id) AS target_groups,
           COUNT(s.id) FILTER (WHERE s.status = 'confirmed') AS confirmed_groups
    FROM assignments a
    LEFT JOIN submissions s ON s.assignment_id = a.id
    GROUP BY a.id ORDER BY a.due_date ASC
  `);

  const perGroup = await pool.query(`
    SELECT g.id, g.name,
           COUNT(s.id) AS total,
           COUNT(s.id) FILTER (WHERE s.status = 'confirmed') AS confirmed
    FROM groups g
    LEFT JOIN submissions s ON s.group_id = g.id
    GROUP BY g.id ORDER BY g.name
  `);

  res.json({
    totals: totals.rows[0],
    perAssignment: perAssignment.rows,
    perGroup: perGroup.rows,
  });
}

module.exports = { overview };
