const AppError = require('../utils/AppError');

// Maps a handful of predictable Postgres error codes to a safe, operational
// AppError so callers don't need to special-case pg errors themselves.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
function fromPgError(err) {
  switch (err.code) {
    case '23505': // unique_violation
      return new AppError(409, 'This record already exists');
    case '23503': // foreign_key_violation
      return new AppError(400, 'Referenced record does not exist');
    case '23502': // not_null_violation
      return new AppError(400, 'A required field is missing');
    case '22P02': // invalid_text_representation (e.g. bad enum/int input)
      return new AppError(400, 'Invalid input value');
    default:
      return null;
  }
}

// Centralized error handler. Every route either throws/next()s an AppError
// (operational, safe to show `message` to the client) or lets an unexpected
// error bubble up here, in which case we log the real error server-side and
// return a generic message — never a stack trace, SQL error, or internal
// path to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!error.isOperational && error.code) {
    error = fromPgError(error) || error;
  }

  const statusCode = error.isOperational ? error.statusCode : 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFoundHandler };
