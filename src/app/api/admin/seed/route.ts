import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();

  // Verify admin auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Service role client for writes
  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );

  try {
    // ── Subject (new table, uuid PK) ─────────────────────────
    const { data: subject, error: subjectErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Exoplanets",
        slug: "exoplanets",
        icon_name: "🪐",
        description: "Discover worlds orbiting distant stars using real telescope data.",
        color: "#58a6ff",
        order: 1,
      }, { onConflict: "slug" })
      .select()
      .single();
    if (subjectErr) throw new Error("subjects: " + subjectErr.message);

    // ── Course (existing table, text PK — provide stable ID) ─
    const { data: course, error: courseErr } = await adminClient
      .from("courses")
      .upsert({
        id: "exoplanet-detective",
        title: "Exoplanet Detective",
        slug: "exoplanet-detective",
        description: "Hunt for planets around distant stars using real Kepler and TESS data.",
        subject_id: subject.id,
        level_tag: ["beginner", "intermediate"],
        estimated_hours: 4,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select()
      .single();
    if (courseErr) throw new Error("courses: " + courseErr.message);

    // ── Module (new table, uuid PK) ──────────────────────────
    const { data: module, error: moduleErr } = await adminClient
      .from("modules")
      .upsert({
        course_id: course.id,
        title: "What is an Exoplanet?",
        order: 1,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (moduleErr) throw new Error("modules: " + moduleErr.message);

    // ── Lessons (existing table, text PK — provide stable IDs)
    const lessons = [
      {
        id: "worlds-beyond",
        course_id: course.id,
        module_id: module.id,
        title: "Worlds Beyond Our Solar System",
        slug: "worlds-beyond",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 1,
        content_mdx: `# Worlds Beyond Our Solar System

For most of human history, we wondered: are we alone? Are there other planets out there, orbiting other stars?

In 1992, astronomers confirmed the first **exoplanets** — planets orbiting a star outside our own Solar System. Since then, we've discovered over **5,500** confirmed exoplanets, with thousands more candidates waiting to be verified.

## What is an Exoplanet?

An **exoplanet** (short for *extra-solar planet*) is any planet that orbits a star other than our Sun. They come in incredible variety:

- **Hot Jupiters** — gas giants orbiting extremely close to their stars, completing an orbit in just days
- **Super-Earths** — rocky planets larger than Earth but smaller than Neptune
- **Mini-Neptunes** — small ice/gas worlds common in our galaxy
- **Earth-like planets** — rocky planets in the habitable zone where liquid water could exist

## The Scale of Discovery

The nearest confirmed exoplanet, **Proxima Centauri b**, is 4.2 light-years away. That's 40 trillion kilometres — yet we can detect it using the faint dip in starlight it causes as it passes in front of its star.

> **Key fact:** The Milky Way galaxy contains an estimated 100–400 billion stars. Most are believed to host at least one planet.`,
      },
      {
        id: "how-we-find-exoplanets",
        course_id: course.id,
        module_id: module.id,
        title: "How We Find Exoplanets",
        slug: "how-we-find-exoplanets",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 2,
        content_mdx: `# How We Find Exoplanets

Exoplanets are far too distant to photograph directly. So how do we find them?

## The Main Detection Methods

### 1. Transit Photometry (most common)
When a planet passes in front of its star, it blocks a tiny fraction of starlight — causing a small, regular dip in brightness. Used by NASA's Kepler and TESS missions. Accounts for ~75% of all known exoplanet discoveries.

### 2. Radial Velocity (Doppler Method)
A planet's gravity causes its star to wobble slightly, shifting the star's light blue or red. Reveals the planet's minimum mass.

### 3. Direct Imaging
Taking an actual photograph of the planet — extremely difficult. The James Webb Space Telescope is improving this technique.

### 4. Gravitational Microlensing
When a star with planets passes in front of a background star, its gravity acts as a lens, briefly brightening the background star.`,
      },
      {
        id: "transit-method",
        course_id: course.id,
        module_id: module.id,
        title: "The Transit Method",
        slug: "transit-method",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 3,
        content_mdx: `# The Transit Method

The transit method is the most successful exoplanet-hunting technique ever devised.

## Key Measurements from a Transit

| Measurement | What it tells us |
|---|---|
| Transit depth (ΔF/F) | Planet-to-star radius ratio → planet size |
| Transit duration | Orbital speed |
| Transit period | Orbital distance (Kepler's 3rd Law) |

## The Transit Equation

> **ΔF = (Rₚ/R★)²**

For Earth transiting the Sun: ΔF ≈ 0.0084% — incredibly tiny!
For a hot Jupiter: ΔF can be 1–2% — much more detectable.

In the next lesson, you'll work with a real Kepler light curve and identify the transit signal yourself.`,
      },
      {
        id: "first-light-curve",
        course_id: course.id,
        module_id: module.id,
        title: "Your First Light Curve",
        slug: "first-light-curve",
        content_type: "data_exercise",
        xp_reward: 100,
        difficulty_level: "beginner",
        order_index: 4,
        content_mdx: `# Your First Light Curve

Time to work with real data. We're using Kepler Object of Interest (KOI) 17 — one of the first confirmed hot Jupiters in the Kepler dataset.

## Practice Calculation

Given:
- Transit depth: **1.42%** (ΔF = 0.0142)
- Star radius: **1.05 R☉**

**Planet radius:**
Rₚ = R★ × √(ΔF) = 1.05 × 695,700 km × √(0.0142) ≈ **87,000 km ≈ 1.25 Jupiter radii**

That's a classic hot Jupiter!

> **Phase 2:** The interactive light curve viewer is coming in Phase 2 — you'll load real Kepler/TESS datasets and identify transit signals directly in the browser.

🎉 **Module complete!** You've earned **275 XP** from this module.`,
      },
    ];

    for (const lesson of lessons) {
      const { error: lessonErr } = await adminClient
        .from("lessons")
        .upsert(lesson, { onConflict: "id" });
      if (lessonErr) throw new Error(`lesson ${lesson.id}: ${lessonErr.message}`);
    }

    return NextResponse.json({
      message: `Seed complete! subject → course (${course.id}) → module → 4 lessons inserted.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
