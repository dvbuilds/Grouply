// Populates a fresh DB with one admin, four students, two groups, and two
// assignments (one all-groups, one group-specific) so a reviewer can log in
// and see a working demo immediately.
//
// Usage: npm run seed   (run after `npm run migrate`)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const DEMO_PASSWORD = 'password123';

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const admin = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ('Prof. Sharma', 'prof@joineazy.dev', $1, 'admin')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [hash]
  );
  const adminId = admin.rows[0].id;

  const students = [
    ['Divya Das', 'divya@joineazy.dev', 'S101'],
    ['Aarav Mehta', 'aarav@joineazy.dev', 'S102'],
    ['Riya Sen', 'riya@joineazy.dev', 'S103'],
    ['Karan Roy', 'karan@joineazy.dev', 'S104'],
  ];
  const studentIds = [];
  for (const [name, email, sid] of students) {
    const r = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, student_id)
       VALUES ($1, $2, $3, 'student', $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, email, hash, sid]
    );
    studentIds.push(r.rows[0].id);
  }

  const group1 = await pool.query(
    `INSERT INTO groups (name, leader_id) VALUES ('Team Alpha', $1) RETURNING id`,
    [studentIds[0]]
  );
  const group2 = await pool.query(
    `INSERT INTO groups (name, leader_id) VALUES ('Team Beta', $1) RETURNING id`,
    [studentIds[2]]
  );
  const group1Id = group1.rows[0].id;
  const group2Id = group2.rows[0].id;

  await pool.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2), ($1, $3)
     ON CONFLICT DO NOTHING`,
    [group1Id, studentIds[0], studentIds[1]]
  );
  await pool.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2), ($1, $3)
     ON CONFLICT DO NOTHING`,
    [group2Id, studentIds[2], studentIds[3]]
  );

  // Assignment 1: targets all groups
  const a1 = await pool.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target_scope, created_by)
     VALUES ('Database Design Assignment', 'Submit your ER diagram and schema.',
             NOW() + INTERVAL '7 days', 'https://onedrive.live.com/demo-link-1', 'all', $1)
     RETURNING id`,
    [adminId]
  );
  const a1Id = a1.rows[0].id;
  for (const gid of [group1Id, group2Id]) {
    await pool.query(
      `INSERT INTO submissions (assignment_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [a1Id, gid]
    );
  }

  // Assignment 2: targets Team Alpha only, already confirmed, to show a completed state
  const a2 = await pool.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target_scope, created_by)
     VALUES ('React Component Library', 'Build and document 5 reusable components.',
             NOW() + INTERVAL '3 days', 'https://onedrive.live.com/demo-link-2', 'groups', $1)
     RETURNING id`,
    [adminId]
  );
  const a2Id = a2.rows[0].id;
  await pool.query(
    `INSERT INTO assignment_targets (assignment_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [a2Id, group1Id]
  );
  await pool.query(
    `INSERT INTO submissions (assignment_id, group_id, status, confirmed_by, confirmed_at)
     VALUES ($1, $2, 'confirmed', $3, NOW()) ON CONFLICT DO NOTHING`,
    [a2Id, group1Id, studentIds[0]]
  );

  console.log('Seed complete.');
  console.log('Log in with any of these (password: "password123"):');
  console.log('  Admin:   prof@joineazy.dev');
  console.log('  Student: divya@joineazy.dev (leader of Team Alpha)');
  console.log('  Student: aarav@joineazy.dev (member of Team Alpha)');
  console.log('  Student: riya@joineazy.dev  (leader of Team Beta)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
