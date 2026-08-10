-- Schema for the 2026 portfolio rebuild (staging/rebuild branch).
-- Entirely additive — every table is namespaced `portfolio_` so it
-- cannot collide with the live placeholder site's existing tables
-- (projects, case_studies, hero_cards, experience_entries, site_settings).
-- Run via: npm run db:migrate:portfolio

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id                 SERIAL PRIMARY KEY,
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  discipline         TEXT NOT NULL DEFAULT '',
  client             TEXT NOT NULL DEFAULT '',
  role               TEXT NOT NULL DEFAULT '',
  year               TEXT NOT NULL DEFAULT '',
  order_index        INTEGER NOT NULL DEFAULT 0,
  visible            BOOLEAN NOT NULL DEFAULT TRUE,
  work_grid_template TEXT, -- JSON {"columns": n, "rows": n} for the freeform bento builder; NULL = automatic trio+banner layout
  deliverables       JSONB NOT NULL DEFAULT '[]', -- string[], shown in the deep-dive sidebar
  creative_team      JSONB NOT NULL DEFAULT '[]', -- string[], shown in the deep-dive sidebar
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS deliverables JSONB NOT NULL DEFAULT '[]';
ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS creative_team JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS portfolio_projects_order_idx ON portfolio_projects (order_index);

-- Every media slot across the site — homepage bento tiles, work-index
-- carousel items, a project's "The Work" grid, and "The Thinking"
-- stacked blocks. `project_id` is nullable because homepage tiles
-- aren't always tied to a single project.
CREATE TABLE IF NOT EXISTS portfolio_media (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  surface       TEXT NOT NULL, -- 'homepage' | 'work_grid' | 'thinking' | 'carousel'
  slot_id       TEXT,          -- e.g. homepage bento slot '1'..'7'; NULL for ordered lists
  type          TEXT NOT NULL, -- 'image' | 'gif' | 'mp4'
  url           TEXT NOT NULL,
  width         INTEGER,
  height        INTEGER,
  aspect_ratio  TEXT,          -- e.g. '14:9'
  order_index   INTEGER NOT NULL DEFAULT 0,
  -- Freeform bento placement for surface='work_grid' items — NULL start
  -- means "not yet placed on the custom grid", in which case the public
  -- page falls back to the automatic trio+banner layout. Set together via
  -- the admin grid builder; the project's work_grid_template column holds
  -- the canvas size as JSON: {"columns": 4, "rows": 3}.
  grid_col_start INTEGER,
  grid_col_span  INTEGER NOT NULL DEFAULT 1,
  grid_row_start INTEGER,
  grid_row_span  INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS grid_col_start INTEGER;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS grid_col_span INTEGER NOT NULL DEFAULT 1;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS grid_row_start INTEGER;
ALTER TABLE portfolio_media ADD COLUMN IF NOT EXISTS grid_row_span INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS portfolio_media_surface_idx ON portfolio_media (surface, order_index);
CREATE INDEX IF NOT EXISTS portfolio_media_project_idx ON portfolio_media (project_id);

-- "The Thinking" tab's narrative — ordered header + body sections per
-- project, each with an optional supporting image.
CREATE TABLE IF NOT EXISTS portfolio_thinking_sections (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  image_url     TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_thinking_sections_project_idx ON portfolio_thinking_sections (project_id, order_index);

-- CV / timeline entries for /about.
CREATE TABLE IF NOT EXISTS portfolio_jobs (
  id            SERIAL PRIMARY KEY,
  company       TEXT NOT NULL,
  title         TEXT NOT NULL,
  date_range    TEXT NOT NULL DEFAULT '',
  descriptor    TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT '',
  clients       JSONB NOT NULL DEFAULT '[]',
  scope         JSONB NOT NULL DEFAULT '[]',
  tools         JSONB NOT NULL DEFAULT '[]',
  period_label  TEXT NOT NULL DEFAULT '', -- tab label, e.g. '2026' or '2022-25'
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_jobs_order_idx ON portfolio_jobs (order_index);

-- Optional recommendation letter per job — nullable 1:1, so most jobs
-- simply have no row here.
CREATE TABLE IF NOT EXISTS portfolio_recommendations (
  id            SERIAL PRIMARY KEY,
  job_id        INTEGER UNIQUE NOT NULL REFERENCES portfolio_jobs(id) ON DELETE CASCADE,
  body          TEXT NOT NULL DEFAULT '',
  author        TEXT NOT NULL DEFAULT '',
  date          TEXT NOT NULL DEFAULT '',
  relationship  TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Floating "interests" copy on /about — grouped label + items.
CREATE TABLE IF NOT EXISTS portfolio_interests (
  id            SERIAL PRIMARY KEY,
  group_label   TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  side          TEXT NOT NULL DEFAULT 'left', -- 'left' | 'right'
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_interests_position_idx ON portfolio_interests (position);

-- Contact-page paper strips.
CREATE TABLE IF NOT EXISTS portfolio_contact_strips (
  id            SERIAL PRIMARY KEY,
  label         TEXT NOT NULL,
  type          TEXT NOT NULL, -- 'email' | 'cv-download' | 'phone' | 'quote' | 'message'
  content       TEXT NOT NULL DEFAULT '', -- for 'quote'/'message' with multiple values, store JSON in content
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portfolio_contact_strips_order_idx ON portfolio_contact_strips (order_index);

-- Generic key/value bag — homepage copy A/B, work-index intro line,
-- contact ambient copy, email, phone, cv_pdf_url, etc.
CREATE TABLE IF NOT EXISTS portfolio_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* ── 2026 rebuild: project-page content model ────────────────────────
   Per-project accent colour drives the wordmark, section headers and
   meta row on that project's page; body copy stays charcoal.        */
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS overview_heading TEXT,
  ADD COLUMN IF NOT EXISTS overview_body TEXT;

/* An ordered stream of blocks so text can sit anywhere between image
   rows. `kind` discriminates: 'images' rows carry a layout, 'text'
   rows carry a heading + body. One table keeps ordering trivial —
   interleaving two tables by index is what makes that painful.      */
CREATE TABLE IF NOT EXISTS portfolio_blocks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  kind        TEXT    NOT NULL CHECK (kind IN ('images', 'text')),
  -- image blocks: how the row is composed
  layout      TEXT    CHECK (layout IN ('single', 'portrait_landscape', 'landscape_portrait', 'split', 'portrait_trio', 'native')),
  -- text blocks
  heading     TEXT,
  body        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS portfolio_blocks_project_idx
  ON portfolio_blocks (project_id, order_index);

/* Media attaches to a block; position within the row orders it. */
ALTER TABLE portfolio_media
  ADD COLUMN IF NOT EXISTS block_id INTEGER REFERENCES portfolio_blocks(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS block_position INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS portfolio_media_block_idx
  ON portfolio_media (block_id, block_position);

-- Fourth image-row layout: the mirror of portrait_landscape, so a row can
-- lead with the wide image instead of the tall one.
ALTER TABLE portfolio_blocks DROP CONSTRAINT IF EXISTS portfolio_blocks_layout_check;
ALTER TABLE portfolio_blocks ADD CONSTRAINT portfolio_blocks_layout_check
  CHECK (layout IN ('single', 'portrait_landscape', 'landscape_portrait',
                    'split', 'portrait_trio', 'native'));

-- Image slots can hold a SEQUENCE of frames that loops like a GIF, and
-- each frame carries its own crop. frame_index orders the frames within
-- one slot (block_id + block_position identifies the slot); focal_x /
-- focal_y are 0..1 and say which point of the source stays centred when
-- the image is cover-cropped to the slot, so a subject that sits off to
-- one side is not sliced in half by the automatic centre crop.
ALTER TABLE portfolio_media
  ADD COLUMN IF NOT EXISTS frame_index INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS focal_x REAL NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS focal_y REAL NOT NULL DEFAULT 0.5;

CREATE INDEX IF NOT EXISTS portfolio_media_slot_idx
  ON portfolio_media (block_id, block_position, frame_index);
