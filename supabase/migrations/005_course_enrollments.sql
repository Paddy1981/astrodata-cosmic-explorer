-- ============================================================
-- AstroData Learn — Migration 005
-- Course enrolments: lets users formally "start" a course
-- and tracks their enrolment date.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS course_enrollments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own enrollments" ON course_enrollments;
CREATE POLICY "Users can manage own enrollments"
  ON course_enrollments FOR ALL USING (auth.uid() = user_id);
