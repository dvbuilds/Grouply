const { validationResult } = require('express-validator');

// Runs after a chain of express-validator checks; turns failures into a
// consistent 400 instead of letting bad input reach the DB layer (and 500).
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array().map(e => ({
      field: e.path, message: e.msg,
    })) });
  }
  next();
}

module.exports = { handleValidation };
