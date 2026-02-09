ALTER TABLE repositories
  ADD COLUMN IF NOT EXISTS language        VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stars           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forks           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_issues     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visibility      VARCHAR(50) NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS owner_name      VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_avatar_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS last_github_update TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_repositories_language  ON repositories(language);
CREATE INDEX IF NOT EXISTS idx_repositories_stars     ON repositories(stars DESC);
