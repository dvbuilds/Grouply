// Lightweight request timing log: method, route, status, duration. Never
// logs headers/body, so Authorization tokens, cookies, and passwords never
// reach the logs.
function requestLogger(req, res, next) {
  const start = performance.now();
  res.on('finish', () => {
    const duration = performance.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)}ms`
    );
  });
  next();
}

module.exports = requestLogger;
