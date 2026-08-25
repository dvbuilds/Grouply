// Populates the database with a realistic demo dataset: two professors,
// ten students, four groups (with memberships), and four assignments with
// a mix of pending/confirmed submissions across groups.
//
// Safe to run repeatedly: users are upserted by email (unique), and groups /
// assignments / memberships / targets / submissions are looked up before
// insert (or inserted with ON CONFLICT DO NOTHING against the schema's
// existing unique constraints), so re-running never creates duplicates.
//
// Usage: npm run seed   (run after `npm run migrate`)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const DEMO_PASSWORD = 'password123';

// Upserts a user by email and returns their id.
async function upsertUser(client, { name, email, hash, role, student_id = null }) {
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role, student_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role
     RETURNING id`,
    [name, email, hash, role, student_id]
  );
  return result.rows[0].id;
}

// Groups have no unique constraint of their own, so idempotency is done by
// looking the group up (by name + leader) before inserting.
async function upsertGroup(client, { name, leaderId }) {
  const existing = await client.query(
    'SELECT id FROM groups WHERE name = $1 AND leader_id = $2',
    [name, leaderId]
  );
  if (existing.rows.length) return existing.rows[0].id;

  const inserted = await client.query(
    'INSERT INTO groups (name, leader_id) VALUES ($1, $2) RETURNING id',
    [name, leaderId]
  );
  return inserted.rows[0].id;
}

async function addMember(client, groupId, userId) {
  await client.query(
    `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) DO NOTHING`,
    [groupId, userId]
  );
}

// Assignments have no unique constraint either, so idempotency is done by
// looking the assignment up by title (titles are distinct in this dataset).
async function upsertAssignment(client, { title, description, dueDate, link, scope, createdBy }) {
  const existing = await client.query('SELECT id FROM assignments WHERE title = $1', [title]);
  if (existing.rows.length) return existing.rows[0].id;

  const inserted = await client.query(
    `INSERT INTO assignments (title, description, due_date, onedrive_link, target_scope, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [title, description, dueDate, link, scope, createdBy]
  );
  return inserted.rows[0].id;
}

async function addTarget(client, assignmentId, groupId) {
  await client.query(
    `INSERT INTO assignment_targets (assignment_id, group_id) VALUES ($1, $2)
     ON CONFLICT (assignment_id, group_id) DO NOTHING`,
    [assignmentId, groupId]
  );
}

async function upsertSubmission(client, assignmentId, groupId, { confirmed = false, confirmedBy = null, confirmedAt = null } = {}) {
  if (confirmed) {
    await client.query(
      `INSERT INTO submissions (assignment_id, group_id, status, confirmed_by, confirmed_at)
       VALUES ($1, $2, 'confirmed', $3, $4)
       ON CONFLICT (assignment_id, group_id)
       DO UPDATE SET status = 'confirmed', confirmed_by = EXCLUDED.confirmed_by, confirmed_at = EXCLUDED.confirmed_at`,
      [assignmentId, groupId, confirmedBy, confirmedAt]
    );
  } else {
    await client.query(
      `INSERT INTO submissions (assignment_id, group_id) VALUES ($1, $2)
       ON CONFLICT (assignment_id, group_id) DO NOTHING`,
      [assignmentId, groupId]
    );
  }
}

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // --- Admins (professors) ---
    const profSharmaId = await upsertUser(client, {
      name: 'Prof. Sharma', email: 'prof@joineazy.dev', hash, role: 'admin',
    });
    const profIyerId = await upsertUser(client, {
      name: 'Dr. Rakesh Iyer', email: 'riyer@joineazy.dev', hash, role: 'admin',
    });

    // --- Students ---
    const studentDefs = [
      ['Divya Das', 'divya@joineazy.dev', 'S101'],
      ['Aarav Mehta', 'aarav@joineazy.dev', 'S102'],
      ['Riya Sen', 'riya@joineazy.dev', 'S103'],
      ['Karan Roy', 'karan@joineazy.dev', 'S104'],
      ['Ananya Gupta', 'ananya@joineazy.dev', 'S105'],
      ['Rohan Verma', 'rohan@joineazy.dev', 'S106'],
      ['Priya Nair', 'priya@joineazy.dev', 'S107'],
      ['Sameer Khan', 'sameer@joineazy.dev', 'S108'],
      ['Neha Kulkarni', 'neha@joineazy.dev', 'S109'],
      ['Vikram Singh', 'vikram@joineazy.dev', 'S110'],
    ];
    const s = {};
    for (const [name, email, studentId] of studentDefs) {
      const key = email.split('@')[0];
      s[key] = await upsertUser(client, { name, email, hash, role: 'student', student_id: studentId });
    }

    // --- Groups (leader + members) ---
    const teamAlpha = await upsertGroup(client, { name: 'Team Alpha', leaderId: s.divya });
    await addMember(client, teamAlpha, s.divya);
    await addMember(client, teamAlpha, s.aarav);
    await addMember(client, teamAlpha, s.ananya);

    const teamBeta = await upsertGroup(client, { name: 'Team Beta', leaderId: s.riya });
    await addMember(client, teamBeta, s.riya);
    await addMember(client, teamBeta, s.karan);

    const teamGamma = await upsertGroup(client, { name: 'Team Gamma', leaderId: s.rohan });
    await addMember(client, teamGamma, s.rohan);
    await addMember(client, teamGamma, s.priya);
    await addMember(client, teamGamma, s.sameer);

    const teamDelta = await upsertGroup(client, { name: 'Team Delta', leaderId: s.neha });
    await addMember(client, teamDelta, s.neha);
    await addMember(client, teamDelta, s.vikram);

    // --- Assignments ---
    // 1: targets all groups, due soon, mixed confirmation state
    const a1 = await upsertAssignment(client, {
      title: 'Database Design Assignment',
      description: 'Submit your ER diagram and normalized schema for the course project.',
      dueDate: new Date(Date.now() + 7 * 86400000),
      link: 'https://onedrive.live.com/demo-link-database-design',
      scope: 'all',
      createdBy: profSharmaId,
    });
    for (const gid of [teamAlpha, teamBeta, teamGamma, teamDelta]) {
      await upsertSubmission(client, a1, gid);
    }
    await upsertSubmission(client, a1, teamAlpha, { confirmed: true, confirmedBy: s.divya, confirmedAt: new Date() });
    await upsertSubmission(client, a1, teamGamma, { confirmed: true, confirmedBy: s.rohan, confirmedAt: new Date() });

    // 2: targets specific groups (Alpha + Beta), already confirmed for Alpha
    const a2 = await upsertAssignment(client, {
      title: 'React Component Library',
      description: 'Build and document 5 reusable React components with Storybook.',
      dueDate: new Date(Date.now() + 3 * 86400000),
      link: 'https://onedrive.live.com/demo-link-react-components',
      scope: 'groups',
      createdBy: profSharmaId,
    });
    await addTarget(client, a2, teamAlpha);
    await addTarget(client, a2, teamBeta);
    await upsertSubmission(client, a2, teamAlpha, { confirmed: true, confirmedBy: s.aarav, confirmedAt: new Date() });
    await upsertSubmission(client, a2, teamBeta);

    // 3: targets all groups, further out, all pending
    const a3 = await upsertAssignment(client, {
      title: 'API Security Hardening Report',
      description: 'Document the OWASP Top 10 mitigations applied to your project API.',
      dueDate: new Date(Date.now() + 14 * 86400000),
      link: 'https://onedrive.live.com/demo-link-api-security',
      scope: 'all',
      createdBy: profIyerId,
    });
    for (const gid of [teamAlpha, teamBeta, teamGamma, teamDelta]) {
      await upsertSubmission(client, a3, gid);
    }

    // 4: targets specific groups (Gamma + Delta), one confirmed
    const a4 = await upsertAssignment(client, {
      title: 'UI/UX Design Systems Case Study',
      description: 'Present a design system audit with tokens, components, and accessibility notes.',
      dueDate: new Date(Date.now() + 10 * 86400000),
      link: 'https://onedrive.live.com/demo-link-design-systems',
      scope: 'groups',
      createdBy: profIyerId,
    });
    await addTarget(client, a4, teamGamma);
    await addTarget(client, a4, teamDelta);
    await upsertSubmission(client, a4, teamGamma, { confirmed: true, confirmedBy: s.priya, confirmedAt: new Date() });
    await upsertSubmission(client, a4, teamDelta);

    await client.query('COMMIT');

    console.log('Seed complete.');
    console.log('Log in with any of these (password: "password123"):');
    console.log('  Admin:   prof@joineazy.dev      (Prof. Sharma)');
    console.log('  Admin:   riyer@joineazy.dev     (Dr. Rakesh Iyer)');
    console.log('  Student: divya@joineazy.dev     (leader of Team Alpha)');
    console.log('  Student: aarav@joineazy.dev     (member of Team Alpha)');
    console.log('  Student: riya@joineazy.dev      (leader of Team Beta)');
    console.log('  Student: rohan@joineazy.dev     (leader of Team Gamma)');
    console.log('  Student: neha@joineazy.dev      (leader of Team Delta)');
    console.log('  ...and 5 more students distributed across the four groups.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
