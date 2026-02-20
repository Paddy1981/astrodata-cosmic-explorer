-- ============================================================
-- AstroData Learn — Migration 004
-- Extends existing AstroData schema for the /learn section.
-- Run this on project jvzwrnpmjhkdwawqrmbw INSTEAD of 001/002/003
-- (those files are for a fresh project only)
-- ============================================================

-- ── 1. Extend profiles (already exists) ──────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name        TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tier_level          TEXT DEFAULT 'explorer'
                                               CHECK (tier_level IN ('explorer','navigator','researcher','curious')),
  ADD COLUMN IF NOT EXISTS subject_interests   TEXT[] DEFAULT '{}';

-- ── 2. Create subjects ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon_name   TEXT NOT NULL DEFAULT '🌌',
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#58a6ff',
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Extend courses (already exists) ───────────────────────
-- Existing columns: id(text), title, description, difficulty,
--   duration_hours, thumbnail_url, is_public, required_tier,
--   order_index, created_at
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS slug           TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subject_id     UUID REFERENCES subjects(id),
  ADD COLUMN IF NOT EXISTS level_tag      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status         TEXT NOT NULL DEFAULT 'draft'
                                          CHECK (status IN ('draft','published','coming_soon','archived')),
  ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(5,1);

-- ── 4. Create modules ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id                   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title                       TEXT NOT NULL,
  "order"                     INTEGER NOT NULL DEFAULT 0,
  unlock_requires_module_id   UUID REFERENCES modules(id),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, "order")
);

-- ── 5. Extend lessons (already exists) ───────────────────────
-- Existing columns: id(text), course_id, title, content_type,
--   content(jsonb), order_index, duration_minutes, created_at
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS slug            TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS module_id       UUID REFERENCES modules(id),
  ADD COLUMN IF NOT EXISTS content_mdx     TEXT,
  ADD COLUMN IF NOT EXISTS xp_reward       INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner'
                                            CHECK (difficulty_level IN ('beginner','intermediate','advanced'));

-- ── 6. Extend quizzes (already exists) ───────────────────────
ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS type        TEXT NOT NULL DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS config_json JSONB DEFAULT '{}';

-- Create quiz_questions for structured quiz content
CREATE TABLE IF NOT EXISTS quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  options_json   JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  explanation    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. Extend quiz_attempts (already exists) ─────────────────
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;

-- ── 8. Extend user_progress (already exists) ─────────────────
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- ── 9. Create streaks ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_active_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_freeze_count INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. Create lesson_assets ──────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  asset_type  TEXT NOT NULL,
  config_json JSONB DEFAULT '{}',
  asset_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. Create data_exercises ─────────────────────────────────
CREATE TABLE IF NOT EXISTS data_exercises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id         TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  dataset_type      TEXT NOT NULL,
  dataset_source    TEXT,
  task_config_json  JSONB DEFAULT '{}',
  answer_tolerance  NUMERIC(10,4),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. Create exercise_submissions ───────────────────────────
CREATE TABLE IF NOT EXISTS exercise_submissions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id          UUID NOT NULL REFERENCES data_exercises(id) ON DELETE CASCADE,
  submission_data_json JSONB NOT NULL DEFAULT '{}',
  score                NUMERIC(5,2),
  is_research_quality  BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. Create larun_contributions ────────────────────────────
CREATE TABLE IF NOT EXISTS larun_contributions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_submission_id UUID NOT NULL REFERENCES exercise_submissions(id) ON DELETE CASCADE,
  larun_candidate_id     TEXT,
  classification         TEXT,
  confidence_score       NUMERIC(5,4),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 14. RLS on new tables ──────────────────────────────────────
ALTER TABLE subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exercises   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE larun_contributions  ENABLE ROW LEVEL SECURITY;

-- Public read on content
DROP POLICY IF EXISTS "subjects_public_select"  ON subjects;
DROP POLICY IF EXISTS "modules_public_select"   ON modules;
DROP POLICY IF EXISTS "lesson_assets_public"    ON lesson_assets;
DROP POLICY IF EXISTS "quiz_questions_public"   ON quiz_questions;
DROP POLICY IF EXISTS "data_exercises_public"   ON data_exercises;

CREATE POLICY "subjects_public_select"  ON subjects       FOR SELECT USING (TRUE);
CREATE POLICY "modules_public_select"   ON modules        FOR SELECT USING (TRUE);
CREATE POLICY "lesson_assets_public"    ON lesson_assets  FOR SELECT USING (TRUE);
CREATE POLICY "quiz_questions_public"   ON quiz_questions FOR SELECT USING (TRUE);
CREATE POLICY "data_exercises_public"   ON data_exercises FOR SELECT USING (TRUE);

-- User-scoped
DROP POLICY IF EXISTS "streaks_select_own" ON streaks;
DROP POLICY IF EXISTS "streaks_insert_own" ON streaks;
DROP POLICY IF EXISTS "streaks_update_own" ON streaks;

CREATE POLICY "streaks_select_own" ON streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "streaks_insert_own" ON streaks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "streaks_update_own" ON streaks FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "submissions_select_own" ON exercise_submissions;
DROP POLICY IF EXISTS "submissions_insert_own" ON exercise_submissions;
DROP POLICY IF EXISTS "submissions_update_own" ON exercise_submissions;

CREATE POLICY "submissions_select_own" ON exercise_submissions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "submissions_insert_own" ON exercise_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "submissions_update_own" ON exercise_submissions FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "contributions_select_own" ON larun_contributions;

CREATE POLICY "contributions_select_own" ON larun_contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM exercise_submissions es WHERE es.id = larun_contributions.exercise_submission_id AND es.user_id = auth.uid())
);

-- ── 15. Updated trigger: create profile + streak on signup ────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert into existing profiles table
  INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

  -- Create streak row
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_active_date, streak_freeze_count)
    VALUES (NEW.id, 0, 0, CURRENT_DATE, 0)
    ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── 16. XP level calculator ───────────────────────────────────
CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(total_xp::NUMERIC / 500) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
