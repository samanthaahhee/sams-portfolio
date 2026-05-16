-- Schema for the internal dashboard backing the portfolio.
-- Run via: npm run db:migrate

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  brand        TEXT NOT NULL,
  title        TEXT NOT NULL,
  tag          TEXT NOT NULL,                       -- legacy, kept in sync with tags[0]
  year         TEXT,
  palette      TEXT NOT NULL,
  cover        TEXT NOT NULL,
  description  TEXT NOT NULL,
  gallery      JSONB NOT NULL DEFAULT '[]',
  href         TEXT,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_position_idx ON projects (position);

-- Multi-tag support — additive migration, safe on re-run.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]';

-- Backfill any rows that still have empty tags from their legacy `tag` value.
UPDATE projects
   SET tags = jsonb_build_array(tag)
 WHERE jsonb_array_length(tags) = 0
   AND tag IS NOT NULL
   AND tag <> '';

-- Custom palette override (optional). JSONB shape: { a, b, aInk, bInk }
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT NULL;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT NULL;

-- Before/after slider pairs — array of { before, after, caption? }
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS comparisons JSONB NOT NULL DEFAULT '[]';
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS comparisons JSONB NOT NULL DEFAULT '[]';

-- Gallery on case studies (projects already had this column).
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]';

-- Unified visuals list (mixed images + before/after sliders, reorderable
-- together). Added later than gallery/comparisons; when populated, the
-- public pages read from it instead.
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS visuals JSONB NOT NULL DEFAULT '[]';
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS visuals JSONB NOT NULL DEFAULT '[]';

-- Draft / published status. Defaults to published so existing rows stay live.
ALTER TABLE projects     ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;

-- Optional case-study-style fields on smaller projects, so the editor
-- can use the same rich form for everything. All nullable / defaulted.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS no            TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client        TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS role          JSONB NOT NULL DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS primary_role  TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category      TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS summary       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS context       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS approach      TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS decisions     JSONB NOT NULL DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS outcome       TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS reflection    TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link_label    TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS link_href     TEXT;

CREATE TABLE IF NOT EXISTS case_studies (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  no            TEXT NOT NULL,
  title         TEXT NOT NULL,
  client        TEXT NOT NULL,
  year          TEXT NOT NULL,
  role          JSONB NOT NULL DEFAULT '[]',
  primary_role  TEXT NOT NULL,
  category      TEXT NOT NULL,
  tags          JSONB NOT NULL DEFAULT '[]',
  summary       TEXT NOT NULL,
  palette       TEXT NOT NULL,
  cover         TEXT NOT NULL,
  context       TEXT NOT NULL,
  problem       TEXT NOT NULL,
  approach      TEXT NOT NULL,
  decisions     JSONB NOT NULL DEFAULT '[]',
  outcome       TEXT NOT NULL,
  reflection    TEXT NOT NULL,
  link_label    TEXT,
  link_href     TEXT,
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS case_studies_position_idx ON case_studies (position);
