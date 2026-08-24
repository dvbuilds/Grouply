const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const pool = require('./db/pool');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const asyncHandler = require('./utils/asyncHandler');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Sets secure-by-default HTTP headers (X-Content-Type-Options, HSTS, etc).
app.use(helmet());

// Only the configured frontend origin(s) may call the API with credentials.
// FRONTEND_URL supports a comma-separated list for multi-env setups.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools / server-to-server calls with no Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());
app.use(requestLogger);

// Health check: confirms the process is up and that it can actually reach
// PostgreSQL, without doing any expensive work — useful for container /
// deployment troubleshooting (e.g. Docker HEALTHCHECK).
app.get('/api/health', asyncHandler(async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check DB failure:', err.message);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
}));

// General limiter for everything under /api; authRoutes additionally
// applies a stricter limiter to just /login and /register internally.
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
