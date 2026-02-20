import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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

  // Service role client — bypasses RLS
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    // ── Subject ──────────────────────────────────────────────
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

    // ── Course ───────────────────────────────────────────────
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

    // ── Module ───────────────────────────────────────────────
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

    // ── Lessons ──────────────────────────────────────────────
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

In 1992, astronomers confirmed the first **exoplanets** — planets orbiting a star outside our own Solar System. Since then, we've discovered over **5,600** confirmed exoplanets, with thousands more candidates waiting to be verified.

## What Makes a Planet an "Exoplanet"?

An **exoplanet** (short for *extra-solar planet*) is any planet that orbits a star other than our Sun. They come in incredible variety:

- **Hot Jupiters** — gas giants orbiting extremely close to their stars, with a year lasting just days
- **Super-Earths** — rocky planets larger than Earth but smaller than Neptune
- **Mini-Neptunes** — small ice/gas worlds, the most common planet type in our galaxy
- **Earth-like planets** — rocky planets in the habitable zone where liquid water could exist

:::quiz
question: Which type of exoplanet completes a full orbit around its star in just a few days?
- Super-Earth
- Hot Jupiter
- Mini-Neptune
- Free-floating planet
correct: 1
explanation: Hot Jupiters are gas giants that orbit extremely close to their host stars — so close that their "year" lasts only 1–5 Earth days. This proximity to the star also makes them relatively easy to detect.
:::

## The Scale of Discovery

The nearest confirmed exoplanet, **Proxima Centauri b**, is 4.2 light-years away — that's 40 trillion kilometres. Yet we can still detect it from Earth using the faint dip in starlight it creates as it passes in front of its star.

:::key
The Milky Way contains an estimated 100–400 billion stars. Most are believed to host at least one planet — meaning there could be **hundreds of billions of exoplanets** in our galaxy alone.
:::

:::quiz
question: When were the first confirmed exoplanets discovered?
- 1969 (Apollo era)
- 1992 (orbiting a pulsar)
- 2001 (Hubble Space Telescope)
- 2009 (Kepler mission)
correct: 1
explanation: The first confirmed exoplanets were discovered in 1992 orbiting a pulsar (PSR 1257+12) by Wolszczan and Frail. The first planet confirmed around a Sun-like star, 51 Pegasi b, was found in 1995. Kepler launched in 2009 and dramatically accelerated the discovery rate.
:::`,
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

Exoplanets are far too distant to photograph directly with most telescopes. So how do we find them?

## The Main Detection Methods

### 1. Transit Photometry (most common)

When a planet passes in front of its star, it blocks a tiny fraction of starlight — causing a small, regular dip in brightness. This technique is used by NASA's **Kepler** and **TESS** missions and accounts for roughly **75%** of all known exoplanet discoveries.

### 2. Radial Velocity (Doppler Method)

A planet's gravity causes its star to wobble slightly, shifting the star's light toward blue (approaching us) or red (receding). Measuring this Doppler shift reveals the planet's minimum mass.

### 3. Direct Imaging

Taking an actual photograph of the planet itself — extremely difficult because the star is billions of times brighter. The **James Webb Space Telescope** is dramatically improving this capability.

### 4. Gravitational Microlensing

When a star with planets passes in front of a background star, its gravity acts as a lens, briefly brightening the background star in a characteristic pattern.

:::quiz
question: Which detection method accounts for roughly 75% of all confirmed exoplanet discoveries?
- Radial Velocity
- Direct Imaging
- Transit Photometry
- Gravitational Microlensing
correct: 2
explanation: Transit photometry — detecting the dip in starlight as a planet crosses its star — has discovered the vast majority of known exoplanets, thanks largely to NASA's Kepler telescope (2009–2018) and the ongoing TESS mission.
:::

:::note
The radial velocity method was historically the most successful before Kepler launched in 2009. It remains crucial because it measures a planet's **mass** — something transit photometry alone cannot tell us.
:::

:::quiz
question: The radial velocity method detects exoplanets by measuring what?
- Changes in the star's brightness
- The Doppler shift of the star's light caused by the planet's gravitational pull
- Direct light reflected off the planet's surface
- Gravitational bending of background starlight
correct: 1
explanation: An orbiting planet gravitationally tugs on its host star, causing the star to move in a tiny circle. When the star moves toward Earth, its light is slightly blueshifted; when it moves away, it is redshifted. Measuring these tiny Doppler shifts reveals the planet's orbital period and minimum mass.
:::`,
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

The transit method is the most successful exoplanet-hunting technique ever devised. When a planet moves across the face of its star — as seen from Earth — it blocks a fraction of the starlight. A sensitive photometer records a characteristic brightness dip called a **transit**.

## Key Measurements from a Transit

| Measurement | What it tells us |
|---|---|
| Transit depth (ΔF/F) | Planet-to-star radius ratio → **planet size** |
| Transit duration | Orbital speed |
| Transit period | Orbital distance (Kepler's 3rd Law) |

## The Transit Equation

:::formula
**ΔF = (Rₚ / R★)²**

Where Rₚ is the planet's radius and R★ is the star's radius. The fraction of starlight blocked equals the **square** of the radius ratio.
:::

## Worked Examples

**Earth transiting the Sun:**
- Earth radius: 6,371 km; Sun radius: 695,700 km
- ΔF = (6,371 / 695,700)² ≈ **0.0084%** — only 84 parts per million!

**Hot Jupiter transiting a Sun-like star:**
- Planet radius ≈ 85,000 km; Star radius ≈ 695,700 km
- ΔF = (85,000 / 695,700)² ≈ **1.49%** — much more detectable

:::quiz
question: If a planet's radius is exactly half its star's radius, what fraction of the star's light does it block during transit?
- 50%
- 25%
- 12.5%
- 6.25%
correct: 1
explanation: From the transit equation: ΔF = (Rₚ/R★)² = (0.5)² = 0.25 = 25%. The transit depth equals the **square** of the radius ratio — not the ratio itself. This is why even large planets block only a small fraction of starlight.
:::

:::note
NASA's Kepler space telescope could detect brightness changes as small as **20 parts per million** — equivalent to spotting a gnat flying in front of a searchlight from a kilometre away.
:::

:::quiz
question: A star's brightness dips by 1% during a transit. If the star has a radius of 1.0 R☉, what is the approximate planet radius?
- 0.1 Jupiter radii
- 0.7 Jupiter radii
- 1.0 Jupiter radii
- 10 Jupiter radii
correct: 1
explanation: Rₚ/R★ = √(0.01) = 0.1, so Rₚ = 0.1 × 695,700 km = 69,570 km. Since 1 Jupiter radius ≈ 71,492 km, this planet is about 0.97 Jupiter radii — a classic hot Jupiter!
:::`,
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

Time to apply what you've learned. We'll analyze **Kepler Object of Interest 17 (KOI-17b)** — one of the first confirmed hot Jupiters in the Kepler dataset.

## Reading a Light Curve

A **light curve** is a graph of a star's brightness over time. When a planet transits, you see:

1. **Baseline** — normal stellar brightness (normalized to 1.0)
2. **Ingress** — brightness starts to drop as the planet moves in front
3. **Flat bottom** — planet fully in front; maximum dimming
4. **Egress** — planet moves away; brightness returns to baseline

:::note
KOI-17b has a transit depth of **1.42%**, a transit period of **1.486 days**, and its host star has a radius of **1.05 solar radii**.
:::

## Worked Calculation

Using the transit equation to find KOI-17b's size:

**Given:**
- Transit depth: ΔF = 1.42% = 0.0142
- Star radius: R★ = 1.05 R☉ = 1.05 × 695,700 km = **730,485 km**

**Step 1:** Find the radius ratio
- Rₚ / R★ = √(0.0142) ≈ **0.1192**

**Step 2:** Find planet radius
- Rₚ = 0.1192 × 730,485 km ≈ **87,034 km**

**Step 3:** Convert to Jupiter radii (1 R♃ = 71,492 km)
- Rₚ ≈ 87,034 / 71,492 ≈ **1.22 R♃**

That's a classic hot Jupiter — about 22% larger than Jupiter itself!

:::quiz
question: A transit depth of 4% means the planet's radius is what fraction of the star's radius?
- 4%
- 20%
- 2%
- 40%
correct: 1
explanation: From ΔF = (Rₚ/R★)², we get Rₚ/R★ = √(ΔF) = √(0.04) = 0.20 = 20%. Always take the **square root** of the transit depth to find the radius ratio — not the depth value itself.
:::

:::exercise
**Try it yourself:** A star of radius 0.9 R☉ shows a transit depth of 0.81%. What is the planet's radius in Earth radii?

Step 1: ΔF = 0.81% = 0.0081

Step 2: Rₚ/R★ = √(0.0081) = 0.09

Step 3: Rₚ = 0.09 × 0.9 × 695,700 km = **56,352 km**

Step 4: In Earth radii (R⊕ = 6,371 km): 56,352 / 6,371 ≈ **8.8 R⊕** — a super-Earth!
:::

:::quiz
question: Why do we take the square root of the transit depth to find the radius ratio?
- Because the planet is spherical, not circular
- Because the transit equation is ΔF = (Rₚ/R★)², so the ratio is the square root of the depth
- Because brightness is measured on a logarithmic scale
- Because we need to correct for atmospheric limb darkening
correct: 1
explanation: The transit equation ΔF = (Rₚ/R★)² comes from geometry: the planet blocks light proportional to its **cross-sectional area** (πRₚ²), while the star emits light proportional to its visible area (πR★²). Their ratio gives the depth, so the radius ratio is the square root.
:::

🎉 **Module complete!** You've mastered transit photometry — the same technique used by real Kepler and TESS astronomers. In the next module, you'll load actual telescope data and identify transit signals yourself.`,
      },
    ];

    for (const lesson of lessons) {
      const { error: lessonErr } = await adminClient
        .from("lessons")
        .upsert(lesson, { onConflict: "id" });
      if (lessonErr) throw new Error(`lesson ${lesson.id}: ${lessonErr.message}`);
    }

    return NextResponse.json({
      message: `Seed complete! subject → course (${course.id}) → module → 4 lessons with interactive quiz questions inserted.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
