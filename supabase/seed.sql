-- ============================================================
-- AstroData Learn — Seed Data
-- Course 1 Module 1: Exoplanet Detective
-- ============================================================

-- Subject
INSERT INTO subjects (title, slug, icon_name, description, color, "order")
VALUES ('Exoplanets', 'exoplanets', '🪐', 'Discover worlds orbiting distant stars using real telescope data.', '#58a6ff', 1)
ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description;

-- Course
INSERT INTO courses (subject_id, title, slug, level_tag, estimated_hours, status, "order")
SELECT
  s.id,
  'Exoplanet Detective',
  'exoplanet-detective',
  ARRAY['beginner','intermediate'],
  4,
  'published',
  1
FROM subjects s WHERE s.slug = 'exoplanets'
ON CONFLICT (slug) DO UPDATE
  SET title = EXCLUDED.title,
      status = EXCLUDED.status;

-- Module
INSERT INTO modules (course_id, title, "order")
SELECT c.id, 'What is an Exoplanet?', 1
FROM courses c WHERE c.slug = 'exoplanet-detective'
ON CONFLICT (course_id, "order") DO UPDATE
  SET title = EXCLUDED.title;

-- Lessons
INSERT INTO lessons (module_id, title, slug, content_type, xp_reward, difficulty_level, "order", content_mdx)
SELECT
  m.id,
  lesson.title,
  lesson.slug,
  lesson.content_type,
  lesson.xp_reward,
  lesson.difficulty_level,
  lesson.ord,
  lesson.content_mdx
FROM modules m
JOIN courses c ON c.id = m.course_id
CROSS JOIN (
  VALUES
  (
    'Worlds Beyond Our Solar System',
    'worlds-beyond',
    'concept',
    50,
    'beginner',
    1,
    'An exoplanet is any planet that orbits a star other than our Sun. Over 5,500 confirmed exoplanets have been found since 1992.'
  ),
  (
    'How We Find Exoplanets',
    'how-we-find-exoplanets',
    'concept',
    50,
    'beginner',
    2,
    'Scientists use the transit method, radial velocity, direct imaging, and gravitational microlensing to detect exoplanets.'
  ),
  (
    'The Transit Method',
    'transit-method',
    'concept',
    75,
    'beginner',
    3,
    'When a planet passes in front of its star, it blocks a small fraction of starlight — creating a measurable dip in the light curve.'
  ),
  (
    'Your First Light Curve',
    'first-light-curve',
    'data_exercise',
    100,
    'beginner',
    4,
    'Analyse a real Kepler light curve to identify a planetary transit and estimate the planet size. (Interactive tool coming in Phase 2.)'
  )
) AS lesson(title, slug, content_type, xp_reward, difficulty_level, ord, content_mdx)
WHERE c.slug = 'exoplanet-detective' AND m."order" = 1
ON CONFLICT (slug) DO UPDATE
  SET title         = EXCLUDED.title,
      content_type  = EXCLUDED.content_type,
      xp_reward     = EXCLUDED.xp_reward,
      "order"       = EXCLUDED."order";
