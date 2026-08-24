// Runs EXPLAIN ANALYZE against the queries that matter most for
// performance — the ones behind the endpoints exercised in loadtest.js —
// against whichever database `pool.js` is currently configured for.
//
// Usage:
//   npm run migrate && npm run seed   # make sure there's data to scan
//   node scripts/explain-analyze.js
//
// Run it once before adding the new indexes (comment them out / roll back
// the migration) and once after, and keep both outputs — that's the
// before/after record section 14/17 of the hardening plan asks for.
// Look for: "Seq Scan" on a large table (bad, usually means a missing
// index), sort operations with high cost, and execution time.

require('dotenv').config();
const pool = require('../src/db/pool');

const queries = [
  {
    name: 'Student assignment feed (studentAssignments) — filters by group membership',
    sql: `EXPLAIN ANALYZE
      SELECT DISTINCT a.*
      FROM assignments a
      LEFT JOIN assignment_targets t ON t.assignment_id = a.id
      LEFT JOIN group_members gm ON gm.group_id = t.group_id AND gm.user_id = $1
      WHERE a.target_scope = 'all' OR gm.user_id = $1
      ORDER BY a.due_date ASC`,
    params: [1],
  },
  {
    name: 'Admin assignment list (allAssignments) — paginated, ordered by due_date',
    sql: `EXPLAIN ANALYZE
      SELECT * FROM assignments ORDER BY due_date ASC LIMIT $1 OFFSET $2`,
    params: [20, 0],
  },
  {
    name: 'Admin group list (allGroups) — join + correlated subquery for member_count',
    sql: `EXPLAIN ANALYZE
      SELECT g.*, u.name AS leader_name,
             (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
      FROM groups g JOIN users u ON u.id = g.leader_id
      ORDER BY g.created_at DESC LIMIT $1 OFFSET $2`,
    params: [20, 0],
  },
  {
    name: 'Group progress (groupProgress) — join filtered by group_id',
    sql: `EXPLAIN ANALYZE
      SELECT s.*, a.title, a.due_date
      FROM submissions s JOIN assignments a ON a.id = s.assignment_id
      WHERE s.group_id = $1 ORDER BY a.due_date ASC`,
    params: [1],
  },
  {
    name: 'Assignment student status (assignmentStudentStatus) — 3-way join, admin-only',
    sql: `EXPLAIN ANALYZE
      SELECT u.id AS student_id, u.name AS student_name, u.email, u.student_id AS roll_no,
             g.id AS group_id, g.name AS group_name,
             s.status, s.confirmed_at
      FROM submissions s
      JOIN groups g ON g.id = s.group_id
      JOIN group_members gm ON gm.group_id = g.id
      JOIN users u ON u.id = gm.user_id
      WHERE s.assignment_id = $1
      ORDER BY g.name, u.name LIMIT $2 OFFSET $3`,
    params: [1, 20, 0],
  },
  {
    name: 'Analytics per-assignment completion (overview) — aggregate over all assignments',
    sql: `EXPLAIN ANALYZE
      SELECT a.id, a.title, a.due_date,
             COUNT(s.id) AS target_groups,
             COUNT(s.id) FILTER (WHERE s.status = 'confirmed') AS confirmed_groups
      FROM assignments a
      LEFT JOIN submissions s ON s.assignment_id = a.id
      GROUP BY a.id ORDER BY a.due_date ASC`,
    params: [],
  },
];

async function main() {
  for (const q of queries) {
    console.log('\n' + '='.repeat(80));
    console.log(q.name);
    console.log('='.repeat(80));
    try {
      const result = await pool.query(q.sql, q.params);
      result.rows.forEach((row) => console.log(row['QUERY PLAN']));
    } catch (err) {
      console.error('Failed:', err.message);
    }
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
