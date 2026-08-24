// Operational error with an HTTP status code attached, so route handlers can
// `throw` or `next()` it and let the central error middleware format the
// response consistently instead of every controller doing its own
// try/catch + res.status(...).json({ error }).
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
