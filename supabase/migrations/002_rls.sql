-- ============================================================
-- AstroData Learn — RLS Policies Migration 002
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_assets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exercises      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp             ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE larun_contributions  ENABLE ROW LEVEL SECURITY;

-- ── Content tables: public read, admin write ─────────────────

CREATE POLICY "content_public_select" ON subjects FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON courses FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON modules FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON lessons FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON lesson_assets FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON quizzes FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON quiz_questions FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON data_exercises FOR SELECT USING (TRUE);
CREATE POLICY "content_public_select" ON badges FOR SELECT USING (TRUE);

-- Admin write (service role bypasses RLS, but explicit policies for anon admin)
-- Admin email check is done at the application layer using SUPABASE_SERVICE_ROLE_KEY

-- ── user_profiles ────────────────────────────────────────────

CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ── user_progress ─────────────────────────────────────────────

CREATE POLICY "progress_select_own" ON user_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "progress_insert_own" ON user_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "progress_update_own" ON user_progress
  FOR UPDATE USING (user_id = auth.uid());

-- ── quiz_attempts ─────────────────────────────────────────────

CREATE POLICY "attempts_select_own" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "attempts_insert_own" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── user_xp ───────────────────────────────────────────────────

CREATE POLICY "xp_select_own" ON user_xp
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "xp_insert_own" ON user_xp
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "xp_update_own" ON user_xp
  FOR UPDATE USING (user_id = auth.uid());

-- ── streaks ───────────────────────────────────────────────────

CREATE POLICY "streaks_select_own" ON streaks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "streaks_insert_own" ON streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "streaks_update_own" ON streaks
  FOR UPDATE USING (user_id = auth.uid());

-- ── user_badges ───────────────────────────────────────────────

CREATE POLICY "badges_select_own" ON user_badges
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "badges_insert_own" ON user_badges
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── certificates ─────────────────────────────────────────────

CREATE POLICY "certs_select_own" ON certificates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "certs_insert_own" ON certificates
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── exercise_submissions ─────────────────────────────────────

CREATE POLICY "submissions_select_own" ON exercise_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "submissions_insert_own" ON exercise_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "submissions_update_own" ON exercise_submissions
  FOR UPDATE USING (user_id = auth.uid());

-- ── larun_contributions ───────────────────────────────────────

CREATE POLICY "contributions_select_own" ON larun_contributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exercise_submissions es
      WHERE es.id = larun_contributions.exercise_submission_id
        AND es.user_id = auth.uid()
    )
  );
