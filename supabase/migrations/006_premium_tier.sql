-- ============================================================
-- AstroData Learn — Migration 006
-- Premium tier: marks courses as premium and tracks user subscription
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add is_premium to courses (free by default)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add is_premium to profiles (false = free tier)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_since     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_expires   TIMESTAMPTZ;

-- 3. Mark all expansion courses as premium
UPDATE courses SET is_premium = TRUE
  WHERE id IN (
    'exoplanet-atmospheres',
    'variable-stars',
    'moons-solar-system',
    'relativity-spacetime',
    'big-bang-beyond',
    'milky-way-beyond',
    'how-we-see-universe',
    'life-in-universe'
  );

-- 4. Keep the 4 core courses free
UPDATE courses SET is_premium = FALSE
  WHERE id IN (
    'exoplanet-detective',
    'life-of-stars',
    'our-cosmic-neighbourhood',
    'beyond-event-horizon'
  );
