-- Incremental migration for databases that already ran the original
-- schema.sql (which now also includes these two indexes for fresh installs).
-- Safe to run more than once.

CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_targets_group ON assignment_targets(group_id);
