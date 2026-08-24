# Performance Testing — JoinEazy Backend

This documents how to reproduce P2 of the hardening plan: proving the
database/pagination/pooling changes actually help, rather than just
asserting it. No live database was available in the environment these
changes were made in, so **no numbers in this document are real** — run
the two tools below yourself and fill in the tables.

## 1. EXPLAIN ANALYZE — query plans

`scripts/explain-analyze.js` runs the six hot-path queries behind the
endpoints exercised by the load test (student assignment feed, admin
assignment/group lists, group progress, assignment student status, and the
analytics aggregate) and prints each plan.

```bash
npm run migrate      # create schema (first run only)
npm run seed          # demo data to actually scan
npm run explain > explain-before.txt
```

Then apply the new indexes and re-run:

```bash
npm run migrate:indexes
npm run explain > explain-after.txt
diff explain-before.txt explain-after.txt
```

What to look for in the output:
- `Seq Scan` on `assignments`, `groups`, `submissions`, `group_members`, or
  `assignment_targets` — a sequential scan on a table that's expected to
  grow is usually a sign a query needs an index it isn't using.
- `Index Scan` / `Index Only Scan` replacing a `Seq Scan` after
  `migrate:indexes` — confirms the new indexes (`idx_assignments_due_date`,
  `idx_assignment_targets_group`) are actually being picked up.
- The `actual time=` and `Execution Time:` values — the concrete before/after
  numbers to record below. On the seed dataset (a handful of rows) these
  will likely look identical either way; the difference only becomes visible
  once a table has hundreds/thousands of rows. If you want to see it
  meaningfully, insert synthetic rows first (a few thousand assignments/
  groups) before comparing.

### Before / after record (fill in after running)

| Query | Before: Execution Time | Before: scan type | After: Execution Time | After: scan type |
|---|---|---|---|---|
| Student assignment feed | | | | |
| Admin assignment list | | | | |
| Admin group list | | | | |
| Group progress | | | | |
| Assignment student status | | | | |
| Analytics per-assignment | | | | |

## 2. k6 — load test

`loadtest/loadtest.js` covers the endpoints named in section 14 of the plan:
login, assignment listing (admin + student), group listing, and the
analytics dashboard. It ramps 0 → 50 virtual users over ~50s.

```bash
# install k6 (one-time): https://k6.io/docs/get-started/installation/
npm run seed                                    # demo accounts must exist
BASE_URL=http://localhost:5000/api k6 run loadtest/loadtest.js
```

k6 prints avg / median / p90 / p95 / max latency, error rate, and
throughput (requests/sec) automatically at the end of the run — copy that
summary block below, once before the hardening changes (check out the
commit before this work) and once after.

### Before / after record (fill in after running)

| Metric | Before | After |
|---|---|---|
| avg | | |
| median | | |
| p90 | | |
| p95 | | |
| max | | |
| error rate | | |
| throughput (req/s) | | |

The `thresholds` in `loadtest.js` (`p(95)<500ms`, `error rate<1%`) are
starting guesses — once you have a real baseline, tighten or loosen them to
match what "acceptable" means for this deployment.

## Notes

- These scripts intentionally query the *actual* controller SQL, not
  simplified stand-ins, so the plans and timings reflect what the API
  really runs.
- `npm run explain` connects using the same `src/db/pool.js` config as the
  running app (`DATABASE_URL` or `DB_*` env vars) — point it at whichever
  environment you want to measure (local, staging, etc.), not necessarily
  production.
