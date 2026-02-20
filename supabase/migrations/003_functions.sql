-- ============================================================
-- AstroData Learn — Functions & Triggers Migration 003
-- ============================================================

-- ── Auto-create user rows on signup ──────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
      )
    )
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_xp (user_id, total_xp, level)
    VALUES (NEW.id, 0, 1)
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_active_date, streak_freeze_count)
    VALUES (NEW.id, 0, 0, CURRENT_DATE, 0)
    ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to allow re-running migration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ── XP level calculator ───────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  xp_per_level CONSTANT INTEGER := 500;
BEGIN
  RETURN GREATEST(1, FLOOR(total_xp::NUMERIC / xp_per_level) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── Award XP and update level ─────────────────────────────────

CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level, last_xp_event_at, updated_at)
    VALUES (p_user_id, p_xp, calculate_level(p_xp), NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET total_xp         = user_xp.total_xp + p_xp,
          level            = calculate_level(user_xp.total_xp + p_xp),
          last_xp_event_at = NOW(),
          updated_at       = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Updated_at trigger ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS user_xp_updated_at ON user_xp;
CREATE TRIGGER user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS streaks_updated_at ON streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
