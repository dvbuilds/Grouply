const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// NOTE: public registration allows choosing role: 'admin' — this is an
// existing, intentional product feature (see frontend Register.jsx: "Join
// your student cohort or access professor administration"), not something
// introduced or changed here. Flagged in the hardening summary as worth a
// product decision, but left as-is per "keep existing features exactly as
// they are."
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, student_id } = req.body;
  const safeRole = role === 'admin' ? 'admin' : 'student';

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    throw new AppError(409, 'Email already registered');
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, student_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, student_id`,
    [name, email, hash, safeRole, safeRole === 'student' ? student_id || null : null]
  );

  const user = result.rows[0];
  const token = signToken(user);
  res.status(201).json({ token, user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user) throw new AppError(401, 'Invalid credentials');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new AppError(401, 'Invalid credentials');

  const token = signToken(user);
  delete user.password_hash;
  res.json({ token, user });
});

const me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, name, email, role, student_id FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!result.rows.length) throw new AppError(404, 'User not found');
  res.json(result.rows[0]);
});

module.exports = { register, login, me };
