const AppError = require('../utils/AppError');

function fromPgError(err) {
  switch (err.code) {
    case "23505":
      return new AppError(409, 'This record already exists');
    case "23503":
      return new AppError(400, 'Referenced record does not exist');
    case "23502":
      return new AppError(400, 'A required field is missing');
    case "22P02":
      return new AppError(400, 'Invalid input value');
    default:
      return null;
  }
}

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
