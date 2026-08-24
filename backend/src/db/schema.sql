-- Joineazy: Student, Group & Assignment Management System
-- PostgreSQL schema

CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE submission_status AS ENUM ('pending', 'confirmed');

-- Students and Professors share one table with a role flag,
-- since both log in the same way and JWT just carries the role.
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'student',
    student_id    VARCHAR(50) UNIQUE,          -- only meaningful for students
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- A group is created by one student (the "leader") and lives independently
-- of any single assignment, since students form groups once and reuse them.
CREATE TABLE groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    leader_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Many-to-many: students <-> groups
CREATE TABLE group_members (
    id        SERIAL PRIMARY KEY,
    group_id  INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- Posted by an admin. can target everyone or specific groups (see assignment_targets).
CREATE TABLE assignments (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMP NOT NULL,
    onedrive_link   TEXT NOT NULL,
    target_scope    VARCHAR(20) NOT NULL DEFAULT 'all', -- 'all' | 'groups'
    created_by      INTEGER NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Only populated when target_scope = 'groups'; empty means "all groups".
CREATE TABLE assignment_targets (
    id             SERIAL PRIMARY KEY,
    assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE (assignment_id, group_id)
);

-- One row per (assignment, group). The two-step "Yes, I have submitted -> confirm"
-- flow just moves status pending -> confirmed; confirmed_by/at record who did it.
CREATE TABLE submissions (
    id             SERIAL PRIMARY KEY,
    assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    status         submission_status NOT NULL DEFAULT 'pending',
    confirmed_by   INTEGER REFERENCES users(id),
    confirmed_at   TIMESTAMP,
    UNIQUE (assignment_id, group_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_group ON submissions(group_id);

/*
ER RELATIONSHIPS
-----------------
users (1) ---- (M) groups            [leader_id]
users (M) ---- (M) groups            via group_members  (membership)
users (1) ---- (M) assignments       [created_by, admin only]
assignments (M) ---- (M) groups      via assignment_targets (only when target_scope='groups')
assignments (1) ---- (M) submissions
groups (1) ---- (M) submissions
submissions (M) ---- (1) users       [confirmed_by]
*/
