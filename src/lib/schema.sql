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
