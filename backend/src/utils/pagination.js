const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

// Parses ?page=&limit= into safe, bounded { page, limit, offset }. Invalid
// values fall back to defaults rather than erroring, since pagination
// params are optional query-string sugar, not required input — but the
// limit is always capped so a client can never force an unbounded fetch.
function parsePagination(query = {}) {
  let page = Number.parseInt(query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let limit = Number.parseInt(query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

// Sets X-Total-Count / X-Page / X-Limit / X-Total-Pages response headers so
// clients that care can page through results, without changing the
// existing plain-array response body shape the frontend already expects.
function setPaginationHeaders(res, { page, limit }, total) {
  const totalPages = limit > 0 ? Math.max(Math.ceil(total / limit), 1) : 1;
  res.set('X-Total-Count', String(total));
  res.set('X-Page', String(page));
  res.set('X-Limit', String(limit));
  res.set('X-Total-Pages', String(totalPages));
}

module.exports = { parsePagination, setPaginationHeaders, DEFAULT_LIMIT, MAX_LIMIT };
