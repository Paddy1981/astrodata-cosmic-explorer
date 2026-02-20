-- ============================================================
-- AstroData Learn — Schema Migration 001
-- All 18 tables
-- ============================================================

-- ── Content tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subjects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  icon_name     TEXT NOT NULL DEFAULT '🌌',
  description   TEXT,
  color         TEXT NOT NULL DEFAULT '#58a6ff',
  "order"       INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id        UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  level_tag         TEXT[] DEFAULT '{}',
  estimated_hours   NUMERIC(5,1),
  thumbnail_url     TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','coming_soon','archived')),
  "order"           INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id                   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title                       TEXT NOT NULL,
  "order"                     INTEGER NOT NULL DEFAULT 0,
  unlock_requires_module_id   UUID REFERENCES modules(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, "order")
);

CREATE TABLE IF NOT EXISTS lessons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id        UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content_type     TEXT NOT NULL DEFAULT 'concept'
                   CHECK (content_type IN ('concept','interactive','data_exercise','quiz')),
  content_mdx      TEXT,
  xp_reward        INTEGER NOT NULL DEFAULT 50,
  difficulty_level TEXT DEFAULT 'beginner'
                   CHECK (difficulty_level IN ('beginner','intermediate','advanced')),
  "order"          INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  asset_type  TEXT NOT NULL,
  config_json JSONB DEFAULT '{}',
  asset_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quizzes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id      UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type           TEXT NOT NULL DEFAULT 'multiple_choice',
  config_json    JSONB DEFAULT '{}',
  passing_score  INTEGER NOT NULL DEFAULT 70,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  options_json   JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_exercises (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id           UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dataset_type        TEXT NOT NULL,
  dataset_source      TEXT,
  task_config_json    JSONB DEFAULT '{}',
  answer_tolerance    NUMERIC(10,4),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  avatar_url          TEXT,
  tier_level          TEXT DEFAULT 'explorer'
                      CHECK (tier_level IN ('explorer','navigator','researcher','curious')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  subject_interests   TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress','completed')),
  completed_at  TIMESTAMPTZ,
  xp_earned     INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id               UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers_json          JSONB DEFAULT '{}',
  score                 INTEGER NOT NULL DEFAULT 0,
  passed                BOOLEAN NOT NULL DEFAULT FALSE,
  time_taken_seconds    INTEGER,
  attempted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_xp (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp          INTEGER NOT NULL DEFAULT 0,
  level             INTEGER NOT NULL DEFAULT 1,
  last_xp_event_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streaks (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_active_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_freeze_count INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL UNIQUE,
  description         TEXT,
  icon_name           TEXT NOT NULL DEFAULT '🏅',
  trigger_type        TEXT NOT NULL,
  trigger_config_json JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  certificate_url  TEXT,
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS exercise_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id           UUID NOT NULL REFERENCES data_exercises(id) ON DELETE CASCADE,
  submission_data_json  JSONB NOT NULL DEFAULT '{}',
  score                 NUMERIC(5,2),
  is_research_quality   BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS larun_contributions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_submission_id  UUID NOT NULL REFERENCES exercise_submissions(id) ON DELETE CASCADE,
  larun_candidate_id      TEXT,
  classification          TEXT,
  confidence_score        NUMERIC(5,4),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
