-- =============================================================================
-- GitFlowAI – Initial Schema Migration
-- =============================================================================
-- Creates all core tables, enumerations, indexes, and foreign-key constraints.
-- Runs idempotently (IF NOT EXISTS).
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id       BIGINT UNIQUE,
    username        VARCHAR(255) UNIQUE NOT NULL,
    email           VARCHAR(255),
    avatar_url      VARCHAR(512),
    display_name    VARCHAR(255),
    bio             TEXT,
    role            VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ---------------------------------------------------------------------------
-- 2. Repositories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS repositories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id       BIGINT UNIQUE,
    name            VARCHAR(255) NOT NULL,
    full_name       VARCHAR(512) NOT NULL,
    description     TEXT,
    url             VARCHAR(512),
    default_branch  VARCHAR(255) DEFAULT 'main',
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repositories_full_name ON repositories(full_name);
CREATE INDEX IF NOT EXISTS idx_repositories_owner_id ON repositories(owner_id);

-- ---------------------------------------------------------------------------
-- 3. Pull Requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pull_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    github_id       BIGINT UNIQUE,
    repository_id   UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    title           VARCHAR(512) NOT NULL,
    description     TEXT,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    state           VARCHAR(50) NOT NULL DEFAULT 'open',
    head_branch     VARCHAR(255),
    base_branch     VARCHAR(255),
    pr_number       INTEGER NOT NULL,
    is_analyzed     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pull_requests_repository_id ON pull_requests(repository_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_author_id ON pull_requests(author_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_state ON pull_requests(state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pull_requests_repo_number
    ON pull_requests(repository_id, pr_number);

-- ---------------------------------------------------------------------------
-- 4. Reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pull_request_id   UUID NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
    reviewer_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    status            VARCHAR(50) NOT NULL DEFAULT 'pending',
    score             INTEGER,
    summary           TEXT,
    total_issues      INTEGER DEFAULT 0,
    started_at        TIMESTAMP WITH TIME ZONE,
    completed_at      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_pull_request_id ON reviews(pull_request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ---------------------------------------------------------------------------
-- 5. Comments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    file_path       VARCHAR(1024),
    line_number     INTEGER,
    severity        VARCHAR(50) NOT NULL DEFAULT 'info',
    category        VARCHAR(255),
    message         TEXT NOT NULL,
    suggestion      TEXT,
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
CREATE INDEX IF NOT EXISTS idx_comments_severity ON comments(severity);
CREATE INDEX IF NOT EXISTS idx_comments_file_path ON comments(file_path);

-- ---------------------------------------------------------------------------
-- Updated-at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_repositories_updated_at
    BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_pull_requests_updated_at
    BEFORE UPDATE ON pull_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
