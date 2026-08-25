CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE submission_status AS ENUM ('pending', 'confirmed');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'student',
    student_id    VARCHAR(50) UNIQUE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    leader_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
    id        SERIAL PRIMARY KEY,
    group_id  INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

CREATE TABLE assignments (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMP NOT NULL,
    onedrive_link   TEXT NOT NULL,
    target_scope    VARCHAR(20) NOT NULL DEFAULT 'all',
    created_by      INTEGER NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_targets (
    id             SERIAL PRIMARY KEY,
    assignment_id  INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    group_id       INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE (assignment_id, group_id)
);

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

CREATE INDEX idx_assignments_due_date ON assignments(due_date);

CREATE INDEX idx_assignment_targets_group ON assignment_targets(group_id);
