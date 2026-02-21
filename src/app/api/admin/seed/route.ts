import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  // CLI bypass: accept service role key in X-Admin-Key header
  const adminKeyHeader = req.headers.get("x-admin-key");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isCli = adminKeyHeader && serviceKey && adminKeyHeader === serviceKey;

  if (!isCli) {
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
  }

  // Service role client — bypasses RLS
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    // ════════════════════════════════════════════════════════════════
    // SUBJECT 1: Exoplanets
    // ════════════════════════════════════════════════════════════════
    const { data: subjectExo, error: subExoErr } = await adminClient
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
    if (subExoErr) throw new Error("subjects exoplanets: " + subExoErr.message);

    const { data: courseExo, error: courseExoErr } = await adminClient
      .from("courses")
      .upsert({
        id: "exoplanet-detective",
        title: "Exoplanet Detective",
        slug: "exoplanet-detective",
        description: "Hunt for planets around distant stars using real Kepler and TESS data.",
        subject_id: subjectExo.id,
        level_tag: ["beginner", "intermediate"],
        estimated_hours: 4,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select()
      .single();
    if (courseExoErr) throw new Error("courses exoplanet-detective: " + courseExoErr.message);

    // Module 1: What is an Exoplanet?
    const { data: modExo1, error: modExo1Err } = await adminClient
      .from("modules")
      .upsert({
        course_id: courseExo.id,
        title: "What is an Exoplanet?",
        order: 1,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (modExo1Err) throw new Error("modules exo1: " + modExo1Err.message);

    // Module 2: Measuring Worlds
    const { data: modExo2, error: modExo2Err } = await adminClient
      .from("modules")
      .upsert({
        course_id: courseExo.id,
        title: "Measuring Worlds",
        order: 2,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (modExo2Err) throw new Error("modules exo2: " + modExo2Err.message);

    const exoLessons = [
      // ── Module 1 lessons (patched) ──
      {
        id: "worlds-beyond",
        course_id: courseExo.id,
        module_id: modExo1.id,
        title: "Worlds Beyond Our Solar System",
        slug: "worlds-beyond",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 1,
        content_mdx: `# Worlds Beyond Our Solar System

For most of human history, we wondered: are we alone? Are there other planets out there, orbiting other stars?

In 1992, astronomers confirmed the first **exoplanets** — planets orbiting a star outside our own Solar System. Since then, we've discovered over **5,600** confirmed exoplanets, with thousands more candidates waiting to be verified.

:::stat
Over **5,600 confirmed exoplanets** as of 2024 — a number that grows monthly as TESS, JWST, and ground-based surveys continue operating. Scientists estimate the Milky Way harbours over **100 billion planets** in total.
:::

:::discovery
On **6 October 1995**, Michel Mayor and Didier Queloz announced **51 Pegasi b** — the first exoplanet confirmed around a Sun-like star, a hot Jupiter completing a full orbit in just 4.23 days. They received the **2019 Nobel Prize in Physics** for this discovery, 24 years later.
:::

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

:::infographic
type: planet-size-scale
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
        course_id: courseExo.id,
        module_id: modExo1.id,
        title: "How We Find Exoplanets",
        slug: "how-we-find-exoplanets",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 2,
        content_mdx: `# How We Find Exoplanets

Exoplanets are far too distant to photograph directly with most telescopes. So how do we find them? Scientists use four main indirect detection methods — each exploiting a different physical effect that a planet has on its surroundings.

:::infographic
type: exoplanet-methods
:::

## Method 1: Transit Photometry

When a planet passes in front of its star, it blocks a tiny fraction of starlight — causing a small, regular dip in brightness. This technique is used by NASA's **Kepler** and **TESS** missions and accounts for roughly **75%** of all known exoplanet discoveries.

:::stat
**~75%** of confirmed exoplanets were discovered via transit photometry. NASA's Kepler mission alone confirmed **2,662 exoplanets** by monitoring 150,000 stars for 9 years. The ongoing TESS mission currently monitors about **200,000 stars** across the entire sky.
:::

:::interactive
type: transit-method
:::

:::note
The transit depth ΔF = (Rₚ/R★)² tells us the **planet's radius**. The time between transits gives us the **orbital period**. Together, Kepler's Third Law gives us the **orbital distance**.
:::

## Method 2: Radial Velocity (Doppler Method)

A planet's gravity causes its star to wobble slightly, shifting the star's light toward blue (approaching us) or red (receding from us). Measuring this Doppler shift reveals the planet's minimum mass. The precision required is extraordinary — we're measuring stellar motions of just a few metres per second!

:::interactive
type: radial-velocity
:::

## Method 3: Direct Imaging

Taking an actual photograph of the planet itself — extremely difficult because the star is billions of times brighter. A coronagraph blocks the star's light, then advanced optics cancel the remaining glare, allowing a faint planet glow to be detected in infrared. The **James Webb Space Telescope** is dramatically improving this capability.

:::interactive
type: direct-imaging
:::

## Method 4: Gravitational Microlensing

When a foreground star passes in front of a background star, its gravity acts as a gravitational lens — briefly magnifying and brightening the background star. A planet around the lens star adds a short additional spike to this magnification event. Microlensing can detect planets too far from their stars for other methods.

:::interactive
type: microlensing
:::

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
Each method has its strengths: radial velocity measures **mass**, transits measure **radius**, direct imaging catches **young giant planets at wide orbits**, and microlensing finds **cold planets** beyond the snow line. Combining methods gives the most complete picture.
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
        course_id: courseExo.id,
        module_id: modExo1.id,
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

:::interactive
type: transit-method
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

:::stat
NASA's Kepler space telescope achieved a photometric precision of **20 parts per million (20 ppm)** — equivalent to detecting the shadow of a housefly crossing a searchlight from a kilometre away. TESS achieves ~200 ppm; PLATO (launching ~2026) targets &lt;50 ppm.
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
:::

:::warning
**Don't confuse transit depth with radius ratio.** The transit depth ΔF = (Rₚ/R★)² is the *square* of the radius ratio — not the ratio itself. A 1% transit depth means Rₚ/R★ = √0.01 = 0.1, meaning the planet is one-tenth the star's radius. Always take the square root to recover the radius ratio.
:::

## Now Try It — Real Data

Below is a 4.5-day Kepler light curve for the star **KIC-757450 (KOI-17)**. It contains three planetary transits. Click on one of the dips to identify it.

:::interactive
type: light-curve
description: This is real data from NASA's Kepler space telescope. The star KIC-757450 is being orbited by a hot Jupiter called KOI-17b. You can see the characteristic flat-bottomed dips where the planet crosses in front. Click on one of the transit dips to identify it and reveal the planet's measured properties.
:::`,
      },
      {
        id: "first-light-curve",
        course_id: courseExo.id,
        module_id: modExo1.id,
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

:::fact
**KOI-17b** completes a full orbit in just **1.486 days** — its "year" lasts about 35 hours. This scorching hot Jupiter receives roughly 500× more stellar radiation than Earth receives from the Sun. Its surface (if it had one) would be permanently molten.
:::

:::note
KOI-17b has a transit depth of **1.42%**, a transit period of **1.486 days**, and its host star has a radius of **1.05 solar radii**.
:::

:::interactive
type: planet-size
description: Drag the slider to match KOI-17b's known radius ratio of ~0.119. Watch how the transit depth changes — you'll see it reach 1.42% at the correct value.
:::

:::warning
**What a transit shows is the planet's shadow, not the planet itself.** Transit depth measures the planet's *area ratio* relative to the star's disk. It tells you radius — not mass, composition, or whether the planet has an atmosphere. A 1% dip from a giant planet and a 1% dip from a smaller planet transiting a smaller star look identical without additional data.
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
:::`,
      },
      {
        id: "planet-hunter-challenge",
        course_id: courseExo.id,
        module_id: modExo1.id,
        title: "Planet Hunter Challenge",
        slug: "planet-hunter-challenge",
        content_type: "interactive",
        xp_reward: 150,
        difficulty_level: "intermediate",
        order_index: 5,
        content_mdx: `# Planet Hunter Challenge

You've learned how transits work. Now it's time to think like a real Kepler scientist.

## The Kepler Mission's Human Problem

:::stat
Kepler monitored **150,000 stars** simultaneously for 9 years, generating over **600 GB of data** — far more than any professional team could review manually. The resulting citizen-science program, Planet Hunters, had over **300,000 volunteers** classify light curves.
:::

When Kepler launched in 2009, it began monitoring **150,000 stars** simultaneously — producing more data than any team of astronomers could manually review. NASA turned to citizen scientists through the **Planet Hunters** program on Zooniverse, where volunteers examined light curves and flagged transit candidates.

Several confirmed exoplanets were first spotted by citizen scientists, not professional astronomers.

:::discovery
**PH1b** (Kepler-64b), found in 2012 by citizen scientists Kian Jek and Robert Gagliano, orbits in a **four-star system** — the first confirmed planet in such a complex gravitational configuration. Professional astronomers had overlooked it. This discovery remains one of the most spectacular results of crowdsourced science.
:::

:::key
The planet **PH1b** (now Kepler-64b) was discovered in 2012 by two amateur astronomers, Kian Jek and Robert Gagliano, through the Planet Hunters program. It orbits a four-star system — a discovery that surprised the scientific community.
:::

## Your Mission

Below are six stars from the Kepler field. Two of them show the characteristic periodic dimming of a transiting exoplanet. Study each star's light curve and flag the planet candidates.

Look for:
- A dip that goes **below the noise floor** (below flux 1.000 by more than random variation)
- A **flat bottom** to the dip (the planet fully covers the same fraction of the star)
- **Repeating** at equal time intervals (periodic signal)

:::interactive
type: star-field
description: Six Kepler target stars are shown with their 5-day photometric records. Noise from stellar activity and instrument effects is present in all light curves. Two stars host transiting planets — find them and flag them as candidates before submitting your findings.
:::

:::quiz
question: After flagging candidates, what would be the next step in the real Kepler pipeline?
- Immediately announce the discovery as a confirmed exoplanet
- Discard the signal and look for larger transits
- Schedule radial velocity follow-up observations to measure the planet's mass and confirm it isn't a false positive
- Wait for the planet to transit again in 10 years
correct: 2
explanation: Kepler candidates (called KOIs — Kepler Objects of Interest) must be confirmed through follow-up observations. Radial velocity measurements from ground-based spectrographs measure the star's Doppler wobble, confirming the planet's mass and ruling out false positives like eclipsing binary stars that can mimic transit signals.
:::

:::note
On average, it takes **2–3 years** from initial Kepler flagging to confirmed exoplanet status, as each candidate requires spectroscopic follow-up, stellar characterisation, and peer review.
:::

Congratulations — you've completed Module 1 of Exoplanet Detective. You now understand how real exoplanet scientists think, measure, and discover new worlds.`,
      },
      // ── Module 2: Measuring Worlds ──
      {
        id: "planet-size",
        course_id: courseExo.id,
        module_id: modExo2.id,
        title: "Measuring Planet Size",
        slug: "planet-size",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 6,
        content_mdx: `# Measuring Planet Size

The transit method doesn't just detect exoplanets — it tells us exactly how big they are. The depth of the brightness dip encodes the planet's radius relative to its host star.

## The Radius Formula

:::formula
**Rₚ = R★ × √(ΔF)**

Planet radius = star radius × square root of transit depth.
:::

:::interactive
type: planet-size
description: Drag the slider to change the planet-to-star radius ratio. See how transit depth scales as the square of the ratio — a planet twice as large blocks four times more light.
:::

:::infographic
type: planet-size-scale
:::

## Planet Size Categories

| Size Class | Radius Range | Notes |
|---|---|---|
| Earth-like | 0.8–1.5 R⊕ | Rocky, iron core |
| Super-Earth | 1.5–2 R⊕ | Rocky or water-rich |
| Mini-Neptune | 2–4 R⊕ | Most common type |
| Neptune-class | 4–6 R⊕ | Ice giant |
| Giant | 6–15 R⊕ | Gas giant |

:::stat
Kepler planet frequency per 100 Sun-like stars: **Mini-Neptunes ~30** · **Super-Earths ~26** · **Earth-like ~22** · **Neptune-class ~3** · **Hot Jupiters ~1**. The 1.5–2 R⊕ "Fulton gap" is one of the sharpest statistical features in the dataset.
:::

## The Fulton Gap

Studies of Kepler planets reveal a mysterious shortage of planets with radii between 1.5–2 R⊕ — the "Fulton gap" or "radius gap." The leading explanation: **photoevaporation**. Planets just above the gap have enough mass to retain their hydrogen envelopes; those just below had their atmospheres stripped away by stellar radiation, leaving bare rocky cores.

:::quiz
question: A planet blocks 0.25% of its host star's light during transit. The star has a radius of 1.0 R☉. What is the planet's radius in Earth radii? (1 R☉ = 109 R⊕)
- 1.5 R⊕
- 5.4 R⊕
- 2.7 R⊕
- 0.5 R⊕
correct: 1
explanation: Rₚ/R★ = √(0.0025) = 0.05, so Rₚ = 0.05 × 109 R⊕ = 5.45 R⊕. This is a Neptune-sized planet — large enough to retain a hydrogen envelope but not a full gas giant.
:::

:::quiz
question: Why does the transit depth scale as (Rₚ/R★)² rather than just (Rₚ/R★)?
- Because we measure the brightness squared
- Because the planet blocks an area (πRₚ²), not a length, and the star emits from an area (πR★²)
- Because space curvature requires squaring
- It doesn't — depth is proportional to the ratio directly
correct: 1
explanation: The transit depth represents the fraction of the star's visible disk blocked by the planet. Since both are disks, the relevant quantities are their areas: πRₚ² / πR★² = (Rₚ/R★)². This is a purely geometric result.
:::`,
      },
      {
        id: "keplers-third-law",
        course_id: courseExo.id,
        module_id: modExo2.id,
        title: "Kepler's Third Law",
        slug: "keplers-third-law",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 7,
        content_mdx: `# Kepler's Third Law

Once we know a planet's orbital period from repeated transits, Kepler's Third Law lets us calculate its distance from the star — no parallax measurement needed.

:::discovery
Johannes Kepler published his **Third Law in 1619** in *Harmonices Mundi* ("The Harmony of the World") — 58 years before Newton derived it mathematically. Kepler found it purely empirically from **Tycho Brahe's** 20+ years of meticulous planetary observations, without any physical theory to explain why it worked.
:::

## The Law

:::formula
**P² ∝ a³**

The square of the orbital period equals the cube of the semi-major axis. In SI units: P² = (4π²/GM★) × a³
:::

:::interactive
type: orbital-mechanics
description: Watch a planet orbit its star on an ellipse. The shaded area sector shows equal areas swept in equal times — Kepler's Second Law. Change the eccentricity to see how the orbit shape affects speed and period.
:::

:::stat
Mercury orbits the Sun at **47.4 km/s** — fast enough to cross the continental US in under 2 minutes. Neptune crawls at just **5.4 km/s**, 9× slower. Kepler's Third Law: their period ratio (88 days vs 165 years)² equals their distance ratio cubed, perfectly predicting this speed difference.
:::

## Equal Areas in Equal Times

Kepler's Second Law (illustrated above) tells us that a line from the star to the planet sweeps equal areas in equal time intervals. This means the planet moves **fastest at perihelion** (closest approach) and **slowest at aphelion** (farthest point). This is a consequence of conservation of angular momentum.

## Applying Kepler's Third Law to Exoplanets

For a planet orbiting a Sun-like star:

**Given:** Transit period P = 3.524 days → convert to years: 3.524/365.25 = 0.00964 yr

**Find orbital distance:**
- a³ = P² = (0.00964)² = 9.29 × 10⁻⁵
- a = ∛(9.29 × 10⁻⁵) ≈ **0.0452 AU**

That's only 4.5% of Earth's distance from the Sun — a classic hot Jupiter!

:::quiz
question: A planet has an orbital period of 8 years. Using Kepler's Third Law (P² = a³), what is its semi-major axis in AU?
- 2 AU
- 4 AU
- 8 AU
- 16 AU
correct: 1
explanation: P² = 64, so a³ = 64, giving a = ∛64 = 4 AU. This is close to the real orbit of Jupiter (5.2 AU), making this a Jupiter-like planet in the outer solar system.
:::

:::quiz
question: Kepler's Second Law (equal areas in equal times) is a consequence of which conservation law?
- Conservation of energy
- Conservation of angular momentum
- Conservation of linear momentum
- Conservation of gravitational potential
correct: 1
explanation: As a planet moves closer to its star, its tangential speed increases to conserve angular momentum (L = m·r·v = constant). This produces the faster perihelion motion and slower aphelion motion that creates equal swept areas in equal times.
:::`,
      },
      {
        id: "habitable-zone",
        course_id: courseExo.id,
        module_id: modExo2.id,
        title: "The Habitable Zone",
        slug: "habitable-zone",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "beginner",
        order_index: 8,
        content_mdx: `# The Habitable Zone

The **habitable zone** (HZ) is the range of orbital distances around a star where liquid water could exist on a rocky planet's surface. It's sometimes called the "Goldilocks zone" — not too hot, not too cold.

## Stellar Flux and Temperature

A planet's equilibrium temperature depends on how much radiation it receives from its star:

:::formula
**T_eq = 278 K × (L★/L☉)^(1/4) × d^(-1/2)**

Where L★ is the stellar luminosity and d is the orbital distance in AU. Liquid water requires roughly 273–373 K (0°C–100°C).
:::

:::interactive
type: habitable-zone
description: Select a star type and drag the planet to different orbital distances. The green band shows the classical habitable zone. Notice how M dwarfs have very close-in habitable zones, while F stars have wider ones at greater distances.
:::

## Star Type and Habitable Zone Location

| Star Type | Luminosity | HZ Inner | HZ Outer |
|---|---|---|---|
| M dwarf (3000K) | 0.008 L☉ | 0.03 AU | 0.08 AU |
| K dwarf (4500K) | 0.18 L☉ | 0.38 AU | 0.73 AU |
| G dwarf/Sun (5778K) | 1.0 L☉ | 0.95 AU | 1.67 AU |
| F dwarf (7000K) | 3.2 L☉ | 1.70 AU | 3.03 AU |

:::fact
**Proxima Centauri b** — our nearest confirmed exoplanet at just 4.2 light-years — orbits within its star's habitable zone with a period of **11.2 days**. However, Proxima Centauri is an active flare star that regularly unleashes UV bursts powerful enough to strip unshielded atmospheres, raising serious doubts about habitability.
:::

:::key
**Are M dwarf habitable zones truly habitable?** Their close-in HZs mean planets are likely tidally locked — one side always facing the star. They also experience intense stellar flares early in their lives. Proxima Centauri b (the nearest exoplanet) sits in the HZ of an M dwarf and faces all these challenges.
:::

:::warning
**The habitable zone does not guarantee life or even habitability.** A planet in the HZ could still be barren if it has no atmosphere (like Mars), a runaway greenhouse effect (early Venus), no liquid water due to wrong composition, or no magnetic field to deflect stellar radiation. "Habitable zone" only means liquid water is *physically possible* on the surface.
:::

:::quiz
question: A star has 4× the luminosity of the Sun. Approximately where is the inner edge of its habitable zone?
- 0.5 AU (half Earth's distance)
- 1.0 AU (Earth's distance)
- 1.9 AU
- 4.0 AU
correct: 2
explanation: The HZ scales as √(L/L☉). For L = 4L☉: inner edge ≈ 0.95 × √4 = 0.95 × 2 = 1.9 AU. The habitable zone shifts outward for more luminous stars.
:::

:::quiz
question: Why are planets in the habitable zones of M dwarf stars potentially problematic for life?
- They orbit too slowly to maintain a magnetic field
- The HZ is so close-in that planets are likely tidally locked and face intense stellar flares
- M dwarfs are too rare in the galaxy
- The HZ is too wide, making climate unstable
correct: 1
explanation: M dwarf HZs are at very small orbital distances (often <0.2 AU), where tidal locking is expected. Additionally, M dwarfs have vigorous magnetic activity early in their lives, bombarding close-in planets with UV and X-ray radiation that could strip away atmospheres.
:::`,
      },
      {
        id: "planet-types",
        course_id: courseExo.id,
        module_id: modExo2.id,
        title: "Planet Types & Demographics",
        slug: "planet-types",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "intermediate",
        order_index: 9,
        content_mdx: `# Planet Types & Demographics

The Kepler mission revealed that our Solar System's planet types are not representative of the galaxy. Mini-Neptunes — with no counterpart in our Solar System — are by far the most common type of planet.

## The Six Major Planet Classes

:::interactive
type: planet-types
description: Hover each planet class to see its physical properties — radius, mass, density, atmosphere, and a real-world example. All sizes are shown to the same scale (Earth = 1 R⊕).
:::

## Population Statistics (From Kepler)

| Planet Type | Frequency (per 100 stars) | Notes |
|---|---|---|
| Earth-like (0.8–1.5 R⊕) | ~22% | Rough estimate, hard to detect |
| Super-Earth (1.5–2 R⊕) | ~26% | Rocky, possibly water-rich |
| Mini-Neptune (2–4 R⊕) | ~30% | Most common type |
| Neptune (4–6 R⊕) | ~3% | — |
| Giant (>6 R⊕) | ~1% | Hot Jupiters + cold giants |

:::stat
Planet frequency per 100 stars (Kepler): **Mini-Neptunes ~30** · **Super-Earths ~26** · **Earth-like ~22** · **Neptune-class ~3** · **Hot Jupiters ~1**. Our Solar System has zero mini-Neptunes — the most common planet type in the galaxy.
:::

## The Radius Gap

Data from Kepler reveal a scarcity of planets with radii between 1.5–2 R⊕. This "Fulton gap" is thought to reflect atmospheric escape: sub-Neptune planets at the boundary are stripped of their H/He envelopes by stellar UV radiation, transitioning from mini-Neptunes to bare super-Earths.

:::fact
Our Solar System's architecture — small rocky planets close-in, giant planets far out — appears to be **statistically unusual**. Most detected systems have large planets at short orbital periods. Jupiter's early "Grand Tack" migration inward and back may have been key to Earth's formation and the Solar System's unusual layout.
:::

:::key
The lack of planets like **Uranus and Neptune** at short orbital periods in the galaxy is intriguing. Our Solar System's architecture — with small rocky planets close-in and gas giants far out — may be somewhat unusual. Most detected systems have large planets close to their stars.
:::

:::quiz
question: Which planet type is the most common in the Milky Way according to Kepler statistics?
- Earth-like planets
- Hot Jupiters
- Mini-Neptunes
- Super-Earths
correct: 2
explanation: Mini-Neptunes (2–4 Earth radii) are the most frequently detected planet type in the Kepler dataset, appearing in roughly 30% of planetary systems surveyed. Our Solar System notably lacks any planet in this size range.
:::

:::quiz
question: What process is believed to create the "radius gap" (Fulton gap) between super-Earths and mini-Neptunes?
- Giant impacts strip rocky material
- Photoevaporation removes H/He atmospheres from planets near the gap boundary
- The gap reflects a bimodal formation process
- Orbital migration pushes planets into two distinct zones
correct: 1
explanation: Photoevaporation by stellar UV and X-ray radiation can strip the hydrogen/helium envelopes from planets near the 1.5–2 R⊕ boundary. Planets with slightly higher mass retain their atmospheres (staying as mini-Neptunes); lighter ones lose theirs (becoming bare super-Earths). This creates the observed gap in the radius distribution.
:::`,
      },
    ];

    for (const lesson of exoLessons) {
      const { error } = await adminClient.from("lessons").upsert(lesson, { onConflict: "id" });
      if (error) throw new Error(`lesson ${lesson.id}: ${error.message}`);
    }

    // ════════════════════════════════════════════════════════════════
    // SUBJECT 2: Stars & Stellar Physics
    // ════════════════════════════════════════════════════════════════
    const { data: subjectStars, error: subStarsErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Stars & Stellar Physics",
        slug: "stars",
        icon_name: "⭐",
        description: "Explore how stars are born, live, and die — from nebulae to black holes.",
        color: "#f0883e",
        order: 2,
      }, { onConflict: "slug" })
      .select()
      .single();
    if (subStarsErr) throw new Error("subjects stars: " + subStarsErr.message);

    const { data: courseStars, error: courseStarsErr } = await adminClient
      .from("courses")
      .upsert({
        id: "life-of-stars",
        title: "The Life of Stars",
        slug: "life-of-stars",
        description: "From stellar nurseries to neutron stars — follow a star through its entire lifecycle.",
        subject_id: subjectStars.id,
        level_tag: ["beginner", "intermediate"],
        estimated_hours: 3,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select()
      .single();
    if (courseStarsErr) throw new Error("courses life-of-stars: " + courseStarsErr.message);

    const { data: modStars1, error: modStars1Err } = await adminClient
      .from("modules")
      .upsert({
        course_id: courseStars.id,
        title: "Birth, Life and Death of a Star",
        order: 1,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (modStars1Err) throw new Error("modules stars1: " + modStars1Err.message);

    const starsLessons = [
      {
        id: "star-formation",
        course_id: courseStars.id,
        module_id: modStars1.id,
        title: "How Stars are Born",
        slug: "star-formation",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 1,
        content_mdx: `# How Stars are Born

Stars are born in vast clouds of gas and dust called **molecular clouds**. The process that transforms a cold, diffuse cloud into a blazing ball of nuclear fire takes millions of years — and the physics driving it is elegantly described by the Jeans instability.

## The Jeans Instability

A molecular cloud collapses under gravity when its self-gravity overcomes the thermal pressure of the gas. The critical mass for collapse is the **Jeans mass**:

:::formula
**M_J ∝ T^(3/2) / ρ^(1/2)**

Lower temperature and higher density both lower the Jeans mass, making collapse easier.
:::

:::interactive
type: star-formation
description: Watch a molecular cloud collapse into a main sequence star. Each stage is labelled — from the initial Jeans instability through protostellar contraction and bipolar jets to hydrogen fusion ignition.
:::

:::infographic
type: stellar-lifecycle
:::

:::fact
Molecular clouds reach temperatures as low as **10 Kelvin (−263°C)** — just 10 degrees above absolute zero, among the coldest natural objects in the universe. Yet inside these frigid clouds, gravity quietly assembles the seeds of stars that will eventually burn at millions of degrees.
:::

## Stages of Star Formation

1. **Molecular Cloud** — Cold (10–30 K), dense, composed mainly of H₂ and dust
2. **Protostellar Core** — Gravity wins; cloud collapses; core heats via Kelvin-Helmholtz contraction
3. **T Tauri Phase** — A young stellar object surrounded by a protoplanetary disk; bipolar jets clear material
4. **Zero-Age Main Sequence** — Core temperature reaches ~10 million K; hydrogen fusion ignites; hydrostatic equilibrium

:::stat
The Sun is **4.6 billion years old** with roughly **5 billion years** remaining on the main sequence. Its total main-sequence lifetime is ~10 billion years. For comparison, the universe itself is 13.8 billion years old — meaning the Sun formed when the cosmos was already 9 billion years old.
:::

:::key
The Sun formed **4.6 billion years ago** in a molecular cloud that also gave birth to the rest of our Solar System. The disk surrounding the infant Sun eventually became the planets, moons, and asteroids we know today.
:::

:::quiz
question: What is the primary energy source that heats a protostellar core before hydrogen fusion begins?
- Nuclear fission
- Kelvin-Helmholtz contraction (gravitational potential energy converted to heat)
- Cosmic ray bombardment
- Radioactive decay of heavy elements
correct: 1
explanation: During the Kelvin-Helmholtz phase, gravitational potential energy is released as the protostar contracts. This heats the core until it reaches the ~10 million K threshold for hydrogen fusion. The Sun spent about 50 million years in this contracting phase.
:::

:::quiz
question: What is the Jeans instability?
- The point at which a star begins hydrogen fusion
- The condition under which a gas cloud's self-gravity overcomes thermal pressure, triggering collapse
- The instability that causes stellar surface convection
- The process by which stellar winds clear protoplanetary disks
correct: 1
explanation: The Jeans instability describes the critical condition for gravitational collapse of a gas cloud. When the cloud's mass exceeds the Jeans mass (determined by temperature and density), gravity wins over thermal pressure and the cloud collapses. Denser, colder clouds collapse more easily.
:::`,
      },
      {
        id: "hr-diagram",
        course_id: courseStars.id,
        module_id: modStars1.id,
        title: "The HR Diagram",
        slug: "hr-diagram",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 2,
        content_mdx: `# The Hertzsprung-Russell Diagram

In the early 20th century, astronomers Ejnar Hertzsprung and Henry Norris Russell independently discovered that most stars fall along a diagonal band when plotted by luminosity vs temperature. This **H-R diagram** remains the single most important tool in stellar astrophysics.

:::discovery
**Ejnar Hertzsprung** (1911) and **Henry Norris Russell** (1913) independently discovered what we now call the H-R diagram — without knowing about each other's work. Their finding that most stars cluster on a diagonal band implied that stars weren't random objects but followed predictable physical laws, laying the foundation for modern stellar astrophysics.
:::

## Reading the H-R Diagram

:::interactive
type: hr-diagram
description: Click any star to inspect its properties. The main sequence runs from hot, luminous O-type stars (top-left) to cool, dim M dwarfs (bottom-right). Giants and white dwarfs occupy distinct off-sequence regions.
:::

:::stat
**~90%** of all visible stars are on the main sequence at any given moment. Red dwarfs (M type) account for **~75%** of all stars in the Milky Way but are too dim to see with the naked eye. Only about **0.003%** of stars are massive O-type blue giants.
:::

## The Main Sequence

The diagonal band from hot-luminous to cool-dim is the **main sequence** — stars fusing hydrogen in their cores. The position on the main sequence is determined entirely by **stellar mass**:

| Spectral Class | Temp (K) | Luminosity | Mass | Lifetime |
|---|---|---|---|---|
| O | >30,000 | >30,000 L☉ | >16 M☉ | ~3 Myr |
| B | 10,000–30,000 | 25–30,000 L☉ | 2–16 M☉ | ~40 Myr |
| G (Sun) | 5,000–6,000 | 0.6–1.5 L☉ | 0.8–1.1 M☉ | ~10 Gyr |
| M | <3,700 | <0.08 L☉ | 0.08–0.45 M☉ | >100 Gyr |

:::formula
**L ∝ M^4 (approximately)**

More massive stars are exponentially more luminous — and burn through their fuel far faster. A star 10× the Sun's mass is ~10,000× more luminous but lives ~100× shorter.
:::

:::warning
**The main sequence is not a path a star travels along.** Stars don't evolve from O-type down to M-type as they age. A star is born at a fixed point on the main sequence determined by its mass and *stays near that point* for most of its life. Only when it exhausts its core hydrogen does it leave the main sequence — moving to the giant branch.
:::

:::quiz
question: An O-type star has a luminosity ~50,000 times the Sun's and a mass ~40 M☉. If it has ~100× more fuel than the Sun but burns it 50,000× faster, roughly how long does it live?
- About the same as the Sun (10 Gyr)
- About 10 million years
- About 100 million years
- About 1 billion years
correct: 1
explanation: Lifetime ≈ (fuel/burn rate) ∝ M/L ∝ M / M⁴ = M⁻³. For a 40 M☉ star: lifetime ∝ 1/40³ ≈ 1/64000 of the Sun's 10 Gyr ≈ 156,000 years — actually even shorter than 10 million years. High-mass stars are spectacularly short-lived compared to the Sun.
:::

:::quiz
question: What does it mean for a star to be "on the main sequence"?
- It is in the process of forming from a gas cloud
- It is actively fusing hydrogen in its core in hydrostatic equilibrium
- It has exhausted all its hydrogen and is expanding into a giant
- It is a remnant stellar core (white dwarf or neutron star)
correct: 1
explanation: Main sequence stars are in a stable phase of hydrogen fusion in their cores. The energy from fusion creates outward pressure that balances gravity — called hydrostatic equilibrium. This phase lasts from millions (O stars) to trillions of years (M dwarfs) depending on stellar mass.
:::`,
      },
      {
        id: "stellar-spectra",
        course_id: courseStars.id,
        module_id: modStars1.id,
        title: "Stellar Spectra",
        slug: "stellar-spectra",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 3,
        content_mdx: `# Stellar Spectra

A stellar spectrum is a fingerprint of the star — encoding its temperature, chemical composition, and even its radial velocity. By dispersing starlight through a prism or diffraction grating, astronomers extract an enormous amount of information from a single observation.

:::fact
**Helium was discovered in the Sun before it was found on Earth.** During the 1868 solar eclipse, Norman Lockyer observed an unknown yellow spectral line in the Sun's atmosphere and named it "helium" after *Helios*, the Greek sun god. Helium wasn't isolated on Earth until **1895** — 27 years later.
:::

## Blackbody Radiation and Wien's Law

Every hot, dense object emits a continuous spectrum of light. The peak wavelength of this emission depends on temperature:

:::formula
**λ_max = 2.898 × 10⁶ nm·K / T**

Hotter stars peak in the blue/UV; cooler stars peak in the red/infrared.
:::

:::interactive
type: stellar-spectra
description: Drag the temperature slider to see the blackbody spectrum shift from cool red stars to hot blue-white stars. The dark vertical lines are absorption features — atoms in the stellar atmosphere absorb specific wavelengths.
:::

:::stat
The Sun's peak emission wavelength is **~502 nm** (green light) — yet the Sun appears white/yellow because it emits strongly across the entire visible spectrum. Our eyes perceive this broad mix as white-yellow, not pure green. Wien's Law: λ_max = 2,898,000 / 5778 K ≈ 502 nm.
:::

## Absorption Lines — The Stellar Fingerprint

As light passes through the cooler outer layers of a star's atmosphere, specific atoms and ions absorb light at characteristic wavelengths, creating dark absorption lines. The pattern of lines identifies the elements present:

- **Hydrogen Balmer lines** (Hα, Hβ, Hγ) — strongest in A-type stars (~10,000 K)
- **Calcium H and K** — strongest in G and K stars; the Sun's spectrum shows these prominently
- **Sodium D doublet** — present in cooler stars
- **Titanium oxide** — only visible in the coolest M-type stars

:::discovery
In 1925, **Cecilia Payne-Gaposchkin** discovered that stars are overwhelmingly composed of hydrogen and helium — overturning the prevailing belief that stars had Earth-like composition. Her PhD thesis is often called "the most brilliant in the history of astronomy." Her supervisor initially pressured her to retract the conclusion; he later confirmed and published it himself without adequately crediting her. She eventually became the first woman to chair a department at Harvard.
:::

:::key
The spectral classification system **O-B-A-F-G-K-M** orders stars from hottest to coolest. A useful mnemonic: "Oh Be A Fine Girl/Guy, Kiss Me." The Sun is a G2 star — middle temperature, middle age.
:::

:::quiz
question: A star's spectrum shows the peak emission at 290 nm (UV). Using Wien's Law (λ_max = 2,898,000 nm·K / T), what is the star's surface temperature?
- 3,000 K (cool red dwarf)
- 10,000 K (A-type white star)
- 29,000 K (hot B/O star)
- 5,778 K (G-type like the Sun)
correct: 2
explanation: T = 2,898,000 / λ_max = 2,898,000 / 290 ≈ 10,000 K. This is a classic A-type star — white in colour, with peak emission in the near-ultraviolet. Sirius, the brightest star in our night sky, is an A1 star at ~9,940 K.
:::

:::quiz
question: Why do absorption lines appear at specific wavelengths rather than a continuous range?
- Because the stellar atmosphere is too thin to absorb broadband light
- Because atoms can only absorb photons with energies exactly matching their electron transition energies
- Because the Doppler effect smears out the lines
- Because spectrographs have insufficient resolution
correct: 1
explanation: Quantum mechanics dictates that electrons in atoms can only occupy discrete energy levels. A photon can only be absorbed if its energy exactly matches the energy difference between two electron levels. This produces sharp absorption lines at specific wavelengths — unique to each element and ion.
:::`,
      },
      {
        id: "stellar-death",
        course_id: courseStars.id,
        module_id: modStars1.id,
        title: "Red Giants & Supernovae",
        slug: "stellar-death",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "intermediate",
        order_index: 4,
        content_mdx: `# Red Giants & Supernovae

Every main sequence star eventually exhausts the hydrogen in its core. What happens next depends entirely on the star's mass — but in every case, the result is spectacular.

:::infographic
type: stellar-lifecycle
:::

## Low-Mass Stars: Red Giants

When a Sun-like star runs out of core hydrogen, gravity wins and the core contracts. The increasing temperature ignites hydrogen shell burning around the inert helium core, and the star's outer envelope expands enormously — a **red giant**.

:::interactive
type: stellar-evolution
description: Watch a massive star evolve from the main sequence through red giant expansion, supernova explosion, and finally to a compact remnant. Use the stage buttons to jump to any phase.
:::

## High-Mass Stars: Supernovae

Stars more massive than ~8 M☉ undergo a far more violent death. Successive nuclear burning stages (He, C, O, Si) build up concentric shells around an iron core. Iron fusion does not release energy — so when the iron core exceeds ~1.4 M☉ (the Chandrasekhar limit), it collapses catastrophically in less than a second.

:::stat
Core collapse happens in **≈ 0.1 seconds** — a stellar core ~1,000 km across implodes to a neutron star just 10–20 km wide at ~25% the speed of light. The gravitational energy released (~3×10⁴⁶ J) exceeds the Sun's total electromagnetic output over its **entire 10-billion-year lifetime**.
:::

:::formula
**Core collapse timescale ≈ 0.1 seconds**
Iron core (R ~1000 km) → neutron star (R ~10 km) at ~¼ the speed of light.
:::

The infalling outer layers bounce off the incompressible neutron star and are ejected in a shockwave: a **core-collapse supernova**. Peak luminosity can rival an entire galaxy — billions of stars combined.

:::key
Every heavy element in your body heavier than iron — silver, gold, iodine, selenium — was forged in a supernova or neutron star merger and scattered through interstellar space. **You are literally made of stardust.**
:::

:::quiz
question: What triggers the end of a star's main sequence life?
- The star runs out of all nuclear fuel simultaneously
- The core exhausts its hydrogen supply, gravity overcomes fusion pressure, and the core begins to contract
- The stellar wind blows away all the outer layers
- A companion star transfers too much mass
correct: 1
explanation: Main sequence stars fuse hydrogen in their cores. When the core hydrogen is exhausted, fusion stops and gravity compresses the core. This heats surrounding hydrogen-rich shells, igniting shell burning that causes the outer envelope to expand — transforming the star into a giant.
:::

:::quiz
question: Why can iron not provide energy through nuclear fusion?
- Iron atoms are too heavy to undergo fusion reactions
- Iron is at the peak of the nuclear binding energy curve — fusing it requires energy input rather than releasing energy
- Iron fuses too slowly to power a star
- Iron is not present in sufficient quantities inside stars
correct: 1
explanation: The nuclear binding energy per nucleon peaks at iron-56. Elements lighter than iron release energy when fused (fusion is exothermic up to iron); elements heavier than iron require energy input to fuse. When an iron core forms, there is no energy source to halt gravitational collapse.
:::`,
      },
      {
        id: "stellar-remnants",
        course_id: courseStars.id,
        module_id: modStars1.id,
        title: "White Dwarfs & Neutron Stars",
        slug: "stellar-remnants",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "intermediate",
        order_index: 5,
        content_mdx: `# White Dwarfs & Neutron Stars

After the spectacular finale of stellar death, a compact remnant remains — a white dwarf, neutron star, or black hole. These objects push physics to its extremes.

## White Dwarfs

When a low-mass star (~0.8–8 M☉) ends its life as a red giant or asymptotic giant branch star, the outer layers are ejected as a **planetary nebula**, leaving behind the hot, compressed core — a **white dwarf**.

| Property | White Dwarf |
|---|---|
| Mass | ~0.5–1.4 M☉ |
| Radius | ~Earth (6,000–10,000 km) |
| Density | ~10⁶ g/cm³ |
| Support | Electron degeneracy pressure |
| Fate | Cools slowly over billions of years |

:::note
A teaspoon of white dwarf material would weigh ~5 tonnes on Earth.
:::

:::stat
Density extremes: A white dwarf packs **~1 M☉** into an Earth-sized volume → **~10⁶ g/cm³** (a teaspoon weighs 5 tonnes). A neutron star squeezes **~1.4 M☉** into a 10 km sphere → **~10¹⁴ g/cm³** (a sugar cube weighs 700 million tonnes).
:::

## The Chandrasekhar Limit

:::discovery
**Subrahmanyan Chandrasekhar** calculated the white dwarf mass limit at age **19** while sailing from India to England in 1930 — with pencil and paper, on a steamship. The astrophysics establishment initially rejected his result as physically impossible. He received the **Nobel Prize in Physics in 1983**, 53 years after the calculation.
:::

White dwarfs are supported against gravity by **electron degeneracy pressure** — a quantum mechanical effect. There is an upper limit to how much mass this can support: the **Chandrasekhar limit** of ~1.4 M☉. If a white dwarf exceeds this (e.g., by accreting mass from a companion), it explodes as a **Type Ia supernova** — used as a "standard candle" in cosmology.

:::warning
**White dwarfs are not burning.** They have no ongoing nuclear fusion. Their glow is purely residual thermal emission from billions of years of stored heat, slowly radiating into space. A white dwarf will continue cooling for **trillions of years** — far longer than the current age of the universe. No "cold white dwarf" (black dwarf) has ever been observed.
:::

## Neutron Stars

The remnant of a core-collapse supernova (stellar mass > 8 M☉) is a **neutron star** — an object of ~1.4–2 M☉ compressed into a sphere only 10–20 km across. Densities exceed that of atomic nuclei.

:::formula
**ρ_NS ≈ 10¹⁴ g/cm³**
A sugar-cube-sized piece of neutron star = mass of all humanity (~700 million tonnes).
:::

**Pulsars** are rapidly rotating neutron stars that emit beamed radiation — observable as regular pulses. The fastest pulsars rotate hundreds of times per second (millisecond pulsars).

## What Determines the Remnant?

| Stellar Mass | Remnant |
|---|---|
| < 0.5 M☉ | White dwarf (won't reach giant stage in Hubble time) |
| 0.5–8 M☉ | White dwarf (after planetary nebula) |
| 8–20 M☉ | Neutron star (after core-collapse SN) |
| > 20 M☉ | Black hole |

:::quiz
question: What supports a white dwarf against gravitational collapse?
- Thermal pressure from residual nuclear burning
- Electron degeneracy pressure — a quantum mechanical effect
- Radiation pressure from the stellar surface
- Magnetic field pressure
correct: 1
explanation: White dwarfs have no ongoing nuclear fusion. They are supported entirely by electron degeneracy pressure — the Pauli exclusion principle prevents electrons from occupying the same quantum state, creating a pressure that resists compression. This support has no temperature dependence (unlike normal gas pressure), which is why white dwarfs can cool indefinitely without collapsing.
:::

:::quiz
question: Why are Type Ia supernovae useful as "standard candles" in cosmology?
- They have a distinctive blue colour
- They all have approximately the same intrinsic peak luminosity (Chandrasekhar-limit explosions), allowing distance measurement
- They occur in every galaxy at a known rate
- Their spectra show a unique absorption feature at a fixed wavelength
correct: 1
explanation: Type Ia supernovae occur when a white dwarf accretes mass up to the Chandrasekhar limit (~1.4 M☉) and detonates. Because the trigger is always the same critical mass, the explosion energy and peak luminosity are highly consistent. By comparing the observed brightness to the known intrinsic brightness, astronomers can measure distances across billions of light-years — enabling the discovery of dark energy.
:::`,
      },
    ];

    for (const lesson of starsLessons) {
      const { error } = await adminClient.from("lessons").upsert(lesson, { onConflict: "id" });
      if (error) throw new Error(`lesson ${lesson.id}: ${error.message}`);
    }

    // ════════════════════════════════════════════════════════════════
    // SUBJECT 3: The Solar System
    // ════════════════════════════════════════════════════════════════
    const { data: subjectSolar, error: subSolarErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "The Solar System",
        slug: "solar-system",
        icon_name: "☀️",
        description: "Explore our cosmic neighbourhood — from Mercury's scorched surface to Neptune's storms.",
        color: "#f7cc4a",
        order: 3,
      }, { onConflict: "slug" })
      .select()
      .single();
    if (subSolarErr) throw new Error("subjects solar-system: " + subSolarErr.message);

    const { data: courseSolar, error: courseSolarErr } = await adminClient
      .from("courses")
      .upsert({
        id: "cosmic-neighbourhood",
        title: "Our Cosmic Neighbourhood",
        slug: "cosmic-neighbourhood",
        description: "Tour the eight planets and the smaller bodies that make up our Solar System.",
        subject_id: subjectSolar.id,
        level_tag: ["beginner"],
        estimated_hours: 3,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select()
      .single();
    if (courseSolarErr) throw new Error("courses cosmic-neighbourhood: " + courseSolarErr.message);

    const { data: modSolar1, error: modSolar1Err } = await adminClient
      .from("modules")
      .upsert({
        course_id: courseSolar.id,
        title: "Planets & Their Orbits",
        order: 1,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (modSolar1Err) throw new Error("modules solar1: " + modSolar1Err.message);

    const solarLessons = [
      {
        id: "eight-planets",
        course_id: courseSolar.id,
        module_id: modSolar1.id,
        title: "The Eight Planets",
        slug: "eight-planets",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "beginner",
        order_index: 1,
        content_mdx: `# The Eight Planets

Our Solar System formed 4.6 billion years ago from a rotating disk of gas and dust around the infant Sun. Eight major planets emerged from this primordial disk — four rocky "terrestrial" worlds in the inner system, and four giant worlds in the outer system.

:::interactive
type: solar-system
description: The eight planets orbit at speeds proportional to their real orbital periods. Hover any planet for data. Notice how dramatically slower the outer planets move compared to Mercury — Kepler's Third Law in action.
:::

:::infographic
type: solar-system-scale
:::

## The Inner Planets (Terrestrial)

| Planet | Distance | Year Length | Notable Feature |
|---|---|---|---|
| Mercury | 0.39 AU | 88 days | Extreme temperatures: -180°C to +430°C |
| Venus | 0.72 AU | 225 days | Runaway greenhouse; 465°C surface |
| Earth | 1.00 AU | 365 days | Only known life-bearing planet |
| Mars | 1.52 AU | 687 days | Olympus Mons: largest volcano in Solar System |

## The Outer Planets (Giants)

| Planet | Distance | Year Length | Notable Feature |
|---|---|---|---|
| Jupiter | 5.20 AU | 11.9 yr | Great Red Spot — storm larger than Earth |
| Saturn | 9.58 AU | 29.5 yr | Ring system; density less than water |
| Uranus | 19.2 AU | 84 yr | Rotates on its side (98° axial tilt) |
| Neptune | 30.1 AU | 165 yr | Fastest winds in Solar System (~2100 km/h) |

:::stat
**Jupiter alone** contains more than **twice the combined mass of all other planets** — its mass is 318 Earths. Jupiter's gravity sculpted the asteroid belt, deflected early comets, and may have protected Earth from heavy bombardment during the Solar System's youth.
:::

:::key
The division between inner rocky planets and outer gas giants is not random. The **frost line** (or snow line) at ~2.7 AU was a critical boundary during Solar System formation — beyond it, water ice could condense, enabling the accumulation of much larger planetary cores that then accreted vast gas envelopes.
:::

:::quiz
question: Why does Saturn have a lower average density than water (0.69 g/cm³)?
- Saturn is hollow
- Saturn is composed almost entirely of hydrogen and helium gas, which are extremely low density
- Saturn's rings displace water when measured
- Saturn's measurement is inaccurate
correct: 1
explanation: Saturn's bulk composition is ~96% hydrogen and ~3% helium by mass — the same materials that make up the Sun. The very light hydrogen and helium gas, even under enormous gravitational compression, result in an average density of just 0.69 g/cm³. Saturn would theoretically float in a sufficiently large ocean.
:::

:::fact
**Neptune was discovered mathematically before it was seen.** In 1845–1846, Le Verrier and Adams independently predicted Neptune's position from perturbations in Uranus's orbit. Astronomer Johann Galle pointed his telescope to Le Verrier's coordinates on **23 September 1846** — and found Neptune within 1° of the predicted spot. It remains one of the greatest triumphs of mathematical physics.
:::

:::quiz
question: What is the "frost line" and why is it significant for planetary formation?
- The boundary where planetary orbits are too cold for liquid water — the habitable zone outer edge
- The distance from the Sun beyond which water ice could condense in the early Solar System, allowing giant planet cores to form
- The Kuiper Belt boundary
- The region where comets originate
correct: 1
explanation: During Solar System formation, the frost line (at ~2.7 AU from the proto-Sun) marked the temperature boundary where water ice could exist in solid form. Beyond this line, icy planetesimals could grow much larger, forming the massive solid cores that accumulated the hydrogen/helium envelopes to become the gas and ice giants.
:::`,
      },
      {
        id: "orbital-mechanics",
        course_id: courseSolar.id,
        module_id: modSolar1.id,
        title: "Orbital Mechanics",
        slug: "orbital-mechanics",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 2,
        content_mdx: `# Orbital Mechanics

Planetary orbits are not perfect circles but ellipses — a discovery made by Johannes Kepler in the early 17th century, decades before Newton explained *why* using his law of universal gravitation.

:::discovery
Johannes Kepler derived his laws from **Tycho Brahe's** 20+ years of meticulous naked-eye planetary observations — the most accurate pre-telescope data ever assembled, accurate to 1/4 arcminute. When Brahe died in 1601, he entrusted his data to his assistant Kepler, who spent the next decade uncovering the mathematical laws hidden within.
:::

## Kepler's Three Laws

**First Law:** Each planet orbits the Sun in an ellipse, with the Sun at one focus.

**Second Law:** A line from the Sun to a planet sweeps equal areas in equal times — meaning the planet moves faster when close to the Sun.

:::formula
**P² = a³**
Period² (in years) = semi-major axis³ (in AU).
:::

**Third Law:** The square of the orbital period equals the cube of the semi-major axis.

:::interactive
type: orbital-mechanics
description: An elliptical orbit with adjustable eccentricity. The blue shaded sector shows the area swept in a fixed time — it stays constant (Kepler's Second Law). Watch the planet accelerate near the Sun and slow down at aphelion.
:::

:::stat
Mercury orbits at **47.4 km/s** — fast enough to cross the US in under 2 minutes. Neptune crawls at **5.4 km/s**, 9× slower. Their speed ratio perfectly follows Kepler's Third Law: orbital speed ∝ 1/√a.
:::

:::warning
**The Sun is not at the centre of Earth's orbit.** The Solar System actually orbits the **barycentre** — the common centre of mass. For Earth this is well inside the Sun, but the Sun-Jupiter barycentre is slightly outside the Sun's surface. This Solar wobble — caused by all planets but dominated by Jupiter — is exactly what radial velocity exoplanet surveys measure in other stars.
:::

## Why Ellipses?

Newton showed that any two bodies attracting each other via an inverse-square-law force (gravity: F = GMm/r²) will trace conic sections — circles, ellipses, parabolas, or hyperbolas. Bound orbits (total energy < 0) are ellipses. Escape trajectories are parabolas (E = 0) or hyperbolas (E > 0).

:::quiz
question: According to Kepler's Second Law, where in its orbit does a planet move fastest?
- At aphelion (farthest from the Sun)
- At perihelion (closest to the Sun)
- At equal distances from the Sun (90° from perihelion)
- Speed is constant throughout the orbit
correct: 1
explanation: Kepler's Second Law is a consequence of angular momentum conservation (L = mvr = constant). At perihelion, r is smallest, so v must be largest to keep L constant. This is why planets and comets whip rapidly around the Sun at closest approach and creep slowly at their farthest points.
:::

:::quiz
question: An asteroid has a semi-major axis of 4 AU. Using Kepler's Third Law (P² = a³), what is its orbital period?
- 4 years
- 8 years
- 12 years
- 16 years
correct: 1
explanation: a³ = 4³ = 64, so P² = 64, giving P = √64 = 8 years. This is approximately the orbital period of Jupiter (11.86 years), so the asteroid would be in the main asteroid belt between Mars and Jupiter.
:::`,
      },
      {
        id: "inner-solar-system",
        course_id: courseSolar.id,
        module_id: modSolar1.id,
        title: "The Inner Solar System",
        slug: "inner-solar-system",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "beginner",
        order_index: 3,
        content_mdx: `# The Inner Solar System

The four inner planets — Mercury, Venus, Earth, and Mars — share a rocky, iron-rich composition but have diverged dramatically in their atmospheres, surfaces, and potential for life.

## Mercury: The Scorched World

Mercury is the innermost and smallest planet (radius 2,440 km — barely larger than Earth's Moon). Despite being closest to the Sun, it is **not** the hottest planet — it has virtually no atmosphere to trap heat, so temperatures swing from -180°C at night to +430°C during the day.

Mercury has a surprisingly large iron core (85% of its radius), thought to be the result of a giant impact early in Solar System history that stripped away much of its rocky mantle.

:::stat
Surface condition comparison: **Venus** 465°C / 92 atm pressure / H₂SO₄ clouds · **Earth** 15°C avg / 1 atm / 71% liquid water · **Mars** −60°C avg / 0.006 atm / CO₂ ice caps. All three planets lie within 0.8 AU of each other yet diverged into radically different worlds.
:::

## Venus: The Twin That Went Wrong

Venus is almost Earth's twin in size (radius 6,051 km vs Earth's 6,371 km) but is completely hostile to life. A thick atmosphere of CO₂ with clouds of sulfuric acid creates a runaway greenhouse effect — surface temperature 465°C, hotter than Mercury.

:::discovery
On **15 December 1970**, the Soviet **Venera 7** became the first spacecraft to successfully transmit data from another planet's surface — surviving Venus's crushing pressure for 23 minutes before going silent. Measured surface temperature: **475°C**. Engineers had to design it like a deep-sea submarine to withstand the pressure.
:::

:::key
**Atmospheric pressure on Venus = 92 × Earth's surface pressure** — equivalent to being 900 metres underwater. Early Soviet Venera landers survived only ~23–127 minutes before being crushed and corroded.
:::

:::fact
**A day on Venus is longer than a year on Venus.** Venus rotates so slowly (243 Earth days per rotation) that its sidereal day exceeds its orbital period (225 Earth days). It also rotates *retrograde* — the Sun would rise in the west and set in the east if you could see it through the permanent cloud cover.
:::

## Earth: The Goldilocks Planet

Earth sits in the habitable zone, has liquid water, a protective magnetic field generated by its molten iron core, and plate tectonics that recycle carbon dioxide. These factors combined to create and sustain life for ~3.8 billion years.

## Mars: The Frozen Desert

Mars once had running water — valley networks, delta deposits, and sedimentary layers all testify to a warmer, wetter past. Today it is a frozen desert with an atmosphere 100× thinner than Earth's. The mystery of what happened to its thick early atmosphere drives modern Mars exploration.

:::quiz
question: Why is Venus hotter than Mercury despite being farther from the Sun?
- Venus is larger so it retains more heat
- Venus has a thick CO₂ atmosphere that creates a runaway greenhouse effect, trapping heat
- Venus rotates faster, generating more frictional heat
- Venus's cloud cover absorbs more solar radiation
correct: 1
explanation: Mercury's lack of atmosphere means heat escapes immediately into space during the night. Venus's thick CO₂ atmosphere (96% CO₂) acts as an extreme greenhouse blanket — solar radiation enters, warms the surface, and the resulting infrared radiation cannot escape. This creates a self-reinforcing warming cycle that has raised Venus's surface to 465°C.
:::

:::quiz
question: What evidence suggests Mars once had liquid water on its surface?
- Spectroscopic detection of ocean water
- Ancient river valley networks, delta deposits, and sedimentary rock layers found by rovers
- Mars's current polar ice caps
- Gravitational measurements from orbit
correct: 1
explanation: Mars orbiters have imaged ancient river valley networks and delta deposits that formed when liquid water flowed into impact craters or standing lakes. NASA rovers like Curiosity have directly analysed sedimentary layers of rock laid down in water. The Opportunity rover explored Meridiani Planum, finding hematite "blueberries" that form only in liquid water.
:::`,
      },
      {
        id: "small-bodies",
        course_id: courseSolar.id,
        module_id: modSolar1.id,
        title: "Asteroids, Comets & Dwarf Planets",
        slug: "small-bodies",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "beginner",
        order_index: 4,
        content_mdx: `# Asteroids, Comets & Dwarf Planets

The Solar System is not just eight planets. It contains billions of smaller bodies — the leftovers of planetary formation — that tell us about the early Solar System's history.

:::stat
The asteroid belt contains an estimated **1.1–1.9 million** asteroids larger than 1 km in diameter, yet their **total mass is only ~4% of Earth's Moon** — spread thinly across a doughnut-shaped region from 2.2–3.2 AU. Despite sci-fi portrayals, a spacecraft flying through it has a tiny statistical chance of encountering any asteroid.
:::

## Asteroids

**Asteroids** are rocky and metallic bodies, predominantly found in the **Main Asteroid Belt** between Mars and Jupiter (2.2–3.2 AU). Jupiter's gravity stirred this region so violently that the material never coalesced into a planet.

- Total mass of all asteroids ≈ 4% of Earth's Moon
- ~1 million asteroids >1 km diameter
- Composition ranges from primitive carbonaceous (C-type) to metallic iron-nickel (M-type)
- **Ceres** is the largest asteroid (diameter 940 km) and the only dwarf planet in the inner Solar System

:::fact
**Comet Hale-Bopp** (1997) was visible to the naked eye for an extraordinary **18 months** — longer than any comet in recorded history. Its nucleus, estimated at **60 km across**, is one of the largest ever measured. It won't return for approximately 2,500 years.
:::

## Comets

**Comets** are icy bodies that developed in the outer Solar System. When their orbits bring them close to the Sun, solar radiation vaporises their ices, creating a bright coma and a tail that always points away from the Sun (driven by solar wind).

:::note
Comets originate from two reservoirs: the **Kuiper Belt** (beyond Neptune, 30–50 AU) supplies short-period comets; the **Oort Cloud** (~1,000–100,000 AU) supplies long-period comets that visit the inner Solar System after millions of years.
:::

## Dwarf Planets

The IAU (International Astronomical Union) defines a **dwarf planet** as a body that:
1. Orbits the Sun ✓
2. Has enough mass for gravity to make it roughly spherical ✓
3. **Has NOT cleared its orbital neighbourhood** ✗ (this distinguishes it from a full planet)

| Dwarf Planet | Distance | Notes |
|---|---|---|
| Ceres | 2.8 AU (Belt) | Visited by Dawn spacecraft (2015) |
| Pluto | 39 AU (Kuiper Belt) | Has 5 moons; N₂ ice plains |
| Eris | 97 AU (Scattered Disc) | More massive than Pluto |
| Makemake | 46 AU | Red surface |
| Haumea | 43 AU | Egg-shaped due to rapid rotation |

:::quiz
question: Why did the IAU demote Pluto to "dwarf planet" status in 2006?
- Pluto was found to be smaller than previously measured
- Pluto has not gravitationally cleared its orbital neighbourhood — the Kuiper Belt contains many similar objects
- Pluto was discovered to be a captured Kuiper Belt object
- Pluto's eccentric orbit crosses Neptune's, violating the definition of a planet
correct: 1
explanation: The 2006 IAU definition requires a planet to have "cleared the neighbourhood" around its orbit — meaning its gravity dominates its orbital zone. Pluto shares the Kuiper Belt with thousands of similar-sized objects (including Eris, which is slightly more massive). Pluto's inability to dominate its neighbourhood led to its reclassification.
:::

:::quiz
question: Why does a comet's tail always point away from the Sun, even as the comet moves away?
- Gravitational repulsion from the Sun pushes the tail outward
- The solar wind and radiation pressure blow the tail away from the Sun regardless of the comet's direction of travel
- The tail lags behind due to the comet's orbital motion
- Magnetic fields from the Sun deflect ionised gas in the tail
correct: 1
explanation: A comet has two tails: an ion tail pushed straight away from the Sun by the solar wind (charged particles), and a dust tail gently curved away by radiation pressure. Both tails always point roughly anti-sunward — away from the Sun — because the driving forces (solar wind and radiation) act radially outward from the Sun, not along the comet's velocity vector.
:::`,
      },
    ];

    for (const lesson of solarLessons) {
      const { error } = await adminClient.from("lessons").upsert(lesson, { onConflict: "id" });
      if (error) throw new Error(`lesson ${lesson.id}: ${error.message}`);
    }

    // ════════════════════════════════════════════════════════════════
    // SUBJECT 4: Black Holes & Extreme Physics
    // ════════════════════════════════════════════════════════════════
    const { data: subjectBH, error: subBHErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Black Holes & Extreme Physics",
        slug: "black-holes",
        icon_name: "🕳️",
        description: "Explore the most extreme objects in the universe — where spacetime itself breaks down.",
        color: "#bc8cff",
        order: 4,
      }, { onConflict: "slug" })
      .select()
      .single();
    if (subBHErr) throw new Error("subjects black-holes: " + subBHErr.message);

    const { data: courseBH, error: courseBHErr } = await adminClient
      .from("courses")
      .upsert({
        id: "event-horizon",
        title: "Beyond the Event Horizon",
        slug: "event-horizon",
        description: "Journey into the most extreme environments in the universe — black holes, gravitational waves, and beyond.",
        subject_id: subjectBH.id,
        level_tag: ["intermediate", "advanced"],
        estimated_hours: 4,
        status: "published",
        difficulty: "intermediate",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select()
      .single();
    if (courseBHErr) throw new Error("courses event-horizon: " + courseBHErr.message);

    const { data: modBH1, error: modBH1Err } = await adminClient
      .from("modules")
      .upsert({
        course_id: courseBH.id,
        title: "The Physics of Darkness",
        order: 1,
      }, { onConflict: "course_id,order" })
      .select()
      .single();
    if (modBH1Err) throw new Error("modules bh1: " + modBH1Err.message);

    const bhLessons = [
      {
        id: "what-is-a-black-hole",
        course_id: courseBH.id,
        module_id: modBH1.id,
        title: "What is a Black Hole?",
        slug: "what-is-a-black-hole",
        content_type: "concept",
        xp_reward: 50,
        difficulty_level: "intermediate",
        order_index: 1,
        content_mdx: `# What is a Black Hole?

A **black hole** is a region of spacetime where gravity is so intense that nothing — not even light — can escape. It is the ultimate prediction of Einstein's general theory of relativity.

:::infographic
type: black-hole-anatomy
:::

## The Schwarzschild Radius

Every mass has a Schwarzschild radius — the critical size to which that mass would need to be compressed for it to become a black hole:

:::formula
**r_s = 2GM / c²**

G = 6.67 × 10⁻¹¹ N·m²/kg² (gravitational constant)
c = 3 × 10⁸ m/s (speed of light)
:::

Examples:
- **Sun** (M = 2×10³⁰ kg): r_s = 3 km
- **Earth** (M = 6×10²⁴ kg): r_s = 9 mm
- **You** (~70 kg): r_s ≈ 10⁻²⁵ m (smaller than an atom)

:::interactive
type: black-hole-lensing
description: Light from background stars bends around the black hole. Rays near the photon sphere (1.5 r_s) are captured in circular orbits — the photon ring seen in the EHT image of M87*. Distant rays show lensed Einstein arcs.
:::

## The Event Horizon

The **event horizon** is the boundary of the black hole — the point of no return. Once inside, the escape velocity exceeds the speed of light. But it is not a physical surface: a person crossing it would not notice anything locally (unless the black hole is very small and tidal forces are extreme).

## The Photon Sphere

At radius 1.5 r_s, light can orbit a black hole in a circular path — the **photon sphere**. This unstable orbit produces the bright ring visible in the Event Horizon Telescope (EHT) images of M87* and Sagittarius A*.

:::stat
M87* subtends just **42 microarcseconds** — equivalent to photographing an orange on the surface of the Moon from Earth. The EHT achieved this by combining radio telescopes spanning the entire diameter of Earth, effectively creating a planet-sized telescope.
:::

:::discovery
The **Event Horizon Telescope** image of M87*, published **10 April 2019**, required over **5 petabytes of data** flown by aeroplane from the South Pole (the internet link is too slow). Over **200 scientists in 20 countries** collaborated to produce the image, directly confirming a key prediction of general relativity.
:::

:::key
In 2019, the Event Horizon Telescope Collaboration released the first-ever image of a black hole — M87*, 6.5 billion solar masses, 55 million light-years away. In 2022, they imaged **Sagittarius A*** — the 4-million-solar-mass black hole at the centre of our own Milky Way.
:::

:::quiz
question: What happens to the escape velocity at the Schwarzschild radius?
- It equals the speed of sound
- It equals the speed of light — so nothing, not even photons, can escape
- It approaches infinity
- It becomes undefined
correct: 1
explanation: The escape velocity at the Schwarzschild radius exactly equals the speed of light. This means that for any body at or inside this radius, the required escape velocity exceeds c — and since nothing can travel faster than light, nothing can escape. The Schwarzschild radius defines the event horizon.
:::

:::quiz
question: What is the Schwarzschild radius of an object with the mass of the Sun (2 × 10³⁰ kg)?
- 0.03 km
- 3 km
- 30 km
- 3,000 km
correct: 1
explanation: r_s = 2GM/c² = 2 × (6.67×10⁻¹¹) × (2×10³⁰) / (3×10⁸)² = 2 × 6.67×10⁻¹¹ × 2×10³⁰ / 9×10¹⁶ ≈ 2,964 m ≈ 3 km. The Sun's entire mass would need to be compressed into a sphere just 3 km in radius to become a black hole.
:::`,
      },
      {
        id: "stellar-black-holes",
        course_id: courseBH.id,
        module_id: modBH1.id,
        title: "Stellar Black Holes",
        slug: "stellar-black-holes",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "intermediate",
        order_index: 2,
        content_mdx: `# Stellar Black Holes

Stellar black holes are the endpoints of the most massive stars — formed when a stellar core in excess of ~3 M☉ (after supernova) collapses under gravity past even the neutron degeneracy pressure limit.

## Formation

When a star more massive than ~20–25 M☉ undergoes core collapse, the resulting neutron star may exceed the **Tolman-Oppenheimer-Volkoff (TOV) limit** of ~2–3 M☉. If it does, neutron degeneracy pressure cannot halt the collapse, and the object becomes a black hole.

:::interactive
type: schwarzschild
description: The Schwarzschild geometry — light bending, photon ring, and the shadow of the event horizon. Rays that pass closer than the photon sphere are captured; distant rays are lensed into arcs.
:::

:::stat
The **LIGO-Virgo-KAGRA** gravitational wave catalog (GWTC-3, 2021) contains **90 confident detections** — including 83 binary black hole mergers, 2 binary neutron star mergers, and 2 neutron star-black hole events. Stellar black hole masses range from ~3 to ~100 M☉ in the catalog.
:::

## Observational Evidence

Since black holes emit no light, we detect them through their effects on surroundings:

1. **X-ray binaries** — A black hole accreting from a companion star heats the gas to millions of degrees, emitting X-rays. Cygnus X-1 was the first strong candidate (1964).

2. **Gravitational lensing** — A black hole passing in front of a background star magnifies the star's light.

3. **Gravitational waves** — Two merging black holes emit ripples in spacetime detectable by LIGO/Virgo (first detection: GW150914, 2015).

:::fact
In 1974, **Stephen Hawking** bet **Kip Thorne** that Cygnus X-1 was *not* a black hole — as "insurance" in case his own theoretical work on black holes was wrong. Hawking conceded in 1990 when the evidence became overwhelming. The prize: Thorne received a year's subscription to *Penthouse*; Hawking got four years of *Private Eye*.
:::

## Mass Distribution

Stellar black holes range from ~3 M☉ to ~100 M☉. The LIGO–Virgo–KAGRA catalog has revealed dozens of binary black hole mergers, with component masses typically 5–60 M☉.

:::note
In 2019, a black hole of 70 M☉ was reported from radial velocity measurements of a companion star in the Milky Way — surprisingly large for a stellar black hole and suggesting a possible observational error or unusual formation pathway.
:::

:::warning
**Black holes do not "suck" matter in.** At distances beyond their event horizon, a black hole's gravity is identical to any other object of the same mass. If the Sun were magically replaced by a black hole of equal mass, Earth's orbit would be completely unchanged. Black holes only trap matter that comes close enough — inside the event horizon — and that requires actively falling toward them.
:::

:::quiz
question: How was Cygnus X-1 identified as a strong black hole candidate?
- Direct imaging by Hubble Space Telescope
- X-ray emission from superheated accreting gas, with no visible companion massive enough to produce such X-rays as anything other than a compact object
- Detection of gravitational waves
- Observation of a photon ring
correct: 1
explanation: Cygnus X-1 emits powerful X-rays from gas that is heated to millions of degrees as it falls toward a compact object. The companion star (HDE 226868) was measured to have a mass ~14 M☉ but the invisible X-ray source has a minimum mass of ~10–20 M☉ — far above the neutron star limit of ~3 M☉, making a black hole the only credible explanation.
:::

:::quiz
question: What determines whether a collapsing stellar core becomes a neutron star versus a black hole?
- The rotation rate of the original star
- The final core mass — cores >2–3 M☉ (the TOV limit) cannot be supported by neutron degeneracy pressure and collapse to black holes
- The chemical composition of the stellar envelope
- Whether a binary companion is present
correct: 1
explanation: Neutron stars are supported by neutron degeneracy pressure (a quantum mechanical effect). This support has an upper limit — the Tolman-Oppenheimer-Volkoff limit (~2–3 M☉). Stellar cores that exceed this limit after the supernova explosion collapse past the neutron star stage, forming black holes. More massive original stars tend to leave more massive remnants.
:::`,
      },
      {
        id: "accretion-disks",
        course_id: courseBH.id,
        module_id: modBH1.id,
        title: "Accretion Disks",
        slug: "accretion-disks",
        content_type: "concept",
        xp_reward: 75,
        difficulty_level: "intermediate",
        order_index: 3,
        content_mdx: `# Accretion Disks

When matter falls toward a black hole, it doesn't fall straight in — angular momentum causes it to spiral inward, forming a flattened rotating disk of superheated plasma called an **accretion disk**.

:::interactive
type: accretion-disk
description: The disk rotates differentially — inner orbits faster than outer orbits. The approaching (left) side is Doppler blueshifted to hotter colours; the receding (right) side is redshifted. Relativistic jets emerge from the poles perpendicular to the disk.
:::

## Physics of Accretion

As gas spirals inward, gravitational potential energy is converted to heat through friction and magnetic turbulence (the **magnetorotational instability**, or MRI). The inner disk reaches temperatures of 10⁶–10⁷ K, emitting X-rays.

:::formula
**Accretion luminosity ≈ 0.1 Ṁ c²**
About 10% of the accreted mass-energy is converted to radiation — 10–100× more efficient than nuclear fusion!
:::

:::stat
Accretion disks are **~14× more energy-efficient than nuclear fusion**: nuclear H→He fusion converts ~0.7% of mass to energy; a non-rotating black hole's accretion disk converts ~6%, and a maximally spinning (Kerr) black hole up to ~42%. This extraordinary efficiency explains why quasars outshine entire galaxies.
:::

## The Innermost Stable Circular Orbit (ISCO)

General relativity predicts that stable circular orbits only exist above a minimum radius called the **ISCO**:
- **Schwarzschild (non-rotating) BH**: ISCO = 3 r_s
- **Maximally rotating (Kerr) BH**: ISCO can reach as close as 0.5 r_s

Inside the ISCO, infalling matter spirals rapidly into the event horizon. The ISCO's radius determines the maximum accretion efficiency.

:::fact
The brightest known **quasar** (J0529-4351, identified in 2024) releases energy equivalent to **~500 trillion suns** and consumes roughly **370 solar masses per year** to power this output. The most luminous quasars outshine their host galaxies (each containing ~100 billion stars) by a factor of 1,000 or more.
:::

## Relativistic Jets

Many accreting black holes launch **relativistic jets** — collimated beams of plasma accelerated to near-light speed perpendicular to the disk. The energy source is likely the Blandford-Znajek process: magnetic field lines threading the spinning black hole extract rotational energy and drive the jet. In quasars and active galactic nuclei (AGN), jets can extend millions of light-years.

:::quiz
question: Why are accretion disks more energy-efficient than nuclear fusion?
- Accretion converts more mass to radiation via Einstein's E = mc²
- Gravitational accretion converts ~10% of infalling mass-energy to radiation; nuclear fusion converts only ~0.7%
- Accretion disks are hotter, making reactions more efficient
- The magnetic fields in accretion disks amplify the energy output
correct: 1
explanation: Nuclear hydrogen fusion (H → He) converts about 0.7% of the rest mass energy to radiation. Accretion disks, by converting gravitational potential energy, release about 6–42% of the infalling mass-energy as radiation (depending on black hole spin). This extraordinary efficiency explains why quasars — actively accreting supermassive black holes — can outshine entire galaxies.
:::

:::quiz
question: What is the Innermost Stable Circular Orbit (ISCO) and why does it matter?
- The orbit of the nearest planet to a black hole
- The minimum orbital radius at which stable circular orbits exist — material inside spirals directly into the black hole and determines accretion efficiency
- The radius of the photon sphere
- The outer boundary of the accretion disk
correct: 1
explanation: General relativity predicts that below the ISCO (3 r_s for a non-spinning black hole), there are no stable circular orbits. Gas that reaches the ISCO quickly plunges into the black hole. The ISCO radius depends on black hole spin — a rapidly spinning black hole can have an ISCO down to 0.5 r_s, allowing more gravitational potential energy to be extracted before matter falls in.
:::`,
      },
      {
        id: "gravitational-waves",
        course_id: courseBH.id,
        module_id: modBH1.id,
        title: "Gravitational Waves",
        slug: "gravitational-waves",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "intermediate",
        order_index: 4,
        content_mdx: `# Gravitational Waves

In 2015, the LIGO detectors made one of the greatest discoveries in the history of science: the first direct detection of **gravitational waves** — ripples in the fabric of spacetime itself, predicted by Einstein 100 years earlier.

## What Are Gravitational Waves?

Einstein's general relativity predicts that accelerating massive objects distort spacetime and send ripples outward at the speed of light. These gravitational waves stretch and squeeze space alternately in two perpendicular directions (the h+ and h× polarisations).

:::stat
LIGO measures displacements of **~10⁻¹⁸ metres** — one-thousandth the diameter of a proton. To achieve this, it uses 4 km laser arms bounced ~280 times, 40 kg mirrors suspended on 8-stage seismic isolation, and quantum noise mitigation. It is the **most sensitive measuring instrument ever built by humanity**.
:::

:::formula
**h = ΔL/L ≈ 10⁻²¹**
The strain h measures the fractional change in length. For GW150914, a 4 km LIGO arm changed by ~10⁻¹⁸ m — a thousandth the width of a proton.
:::

:::interactive
type: grav-waves
description: Two merging black holes produce a chirp signal — rising in frequency and amplitude as the inspiral accelerates. The spacetime grid shows the h+ strain: space stretching in one direction while compressing in the perpendicular direction.
:::

:::discovery
**GW150914** was detected on **14 September 2015** — exactly 100 years after Einstein published the field equations of general relativity in 1915. The signal lasted just 0.2 seconds but confirmed: binary black holes exist, they merge, and gravitational waves travel at the speed of light. The peak power radiated at merger: **~3.6 × 10⁴⁹ watts** — more than the light output of all stars in the observable universe combined, for that fraction of a second.
:::

## The Binary Black Hole Inspiral

As two black holes orbit each other, they radiate gravitational waves and lose energy — causing their orbit to shrink. The system spirals inward (**inspiral phase**) with increasing frequency and amplitude until the black holes merge (**merger**) and the new single black hole rings down (**ringdown**).

This produces the characteristic **chirp** signal detected by LIGO — a waveform that uniquely identifies the source.

## What LIGO Detects

| Event | BH Masses | Distance | Date |
|---|---|---|---|
| GW150914 | 36 + 29 M☉ | 1.3 billion ly | Sep 2015 |
| GW170817 | NS + NS | 130 million ly | Aug 2017 |
| GW190814 | 23 + 2.6 M☉ | 800 million ly | Aug 2019 |

:::fact
The neutron star merger **GW170817** produced detectable quantities of **gold, platinum, and uranium** — an estimated ~10 Earth masses of gold in the kilonova afterglow. This confirmed that most of the gold on Earth, and in your jewellery, was forged in neutron star collisions billions of years ago.
:::

:::key
The neutron star merger GW170817 was simultaneously detected as a **gamma-ray burst**, marking the dawn of **multi-messenger astronomy** — observing the universe through both gravitational waves and electromagnetic light. This single event confirmed that neutron star mergers produce heavy elements like gold and platinum.
:::

:::quiz
question: GW150914 was detected as a strain of h ~ 10⁻²¹. For a 4 km LIGO arm, what was the actual displacement measured?
- 4 × 10⁻²¹ km = 4 × 10⁻¹⁸ m (smaller than a proton)
- 4 km × 10⁻²¹ = 4 × 10⁻²¹ m
- 4 km × 10⁻²¹ / 2 = 2 × 10⁻²¹ m
- 4 km × 10⁻²¹ × 1000 = 4 × 10⁻¹⁸ mm
correct: 0
explanation: ΔL = h × L = 10⁻²¹ × 4000 m = 4 × 10⁻¹⁸ m. This is about one-thousandth the diameter of a proton (~10⁻¹⁵ m). Measuring such a tiny displacement requires the most sensitive measurement ever achieved — LIGO's laser interferometry can detect motions smaller than any quantum of matter.
:::

:::quiz
question: What causes the "chirp" — the rising frequency and amplitude of a gravitational wave signal?
- The detectors are moving through space toward the source
- As the binary system loses energy to gravitational waves, the orbit shrinks and the orbital frequency increases — causing the GW frequency to "chirp" upward
- Doppler shifting from the expanding universe
- Interference between the two LIGO detectors
correct: 1
explanation: The gravitational wave frequency equals twice the orbital frequency. As the two compact objects spiral closer, orbital mechanics dictates they orbit faster (Kepler's Third Law). They also radiate more power (proportional to 1/r⁵), accelerating the inspiral. Both effects cause the frequency and amplitude to rise rapidly until merger.
:::`,
      },
      {
        id: "supermassive-black-holes",
        course_id: courseBH.id,
        module_id: modBH1.id,
        title: "Supermassive Black Holes",
        slug: "supermassive-black-holes",
        content_type: "concept",
        xp_reward: 100,
        difficulty_level: "intermediate",
        order_index: 5,
        content_mdx: `# Supermassive Black Holes

At the centre of every large galaxy lurks a **supermassive black hole** (SMBH) — objects with masses ranging from millions to tens of billions of solar masses. The one at the centre of our Milky Way, **Sagittarius A***, has a mass of 4 million M☉.

:::infographic
type: black-hole-anatomy
:::

## How Large Are They?

| Object | Mass | Schwarzschild Radius | Location |
|---|---|---|---|
| Sagittarius A* | 4 × 10⁶ M☉ | 12 million km | Milky Way centre |
| M87* | 6.5 × 10⁹ M☉ | 20 billion km | Galaxy M87 |
| TON 618 | 6.6 × 10¹⁰ M☉ | 200 billion km | Distant quasar |

M87*'s Schwarzschild radius is larger than our entire Solar System.

:::stat
**TON 618** — one of the most massive known black holes at **66 billion M☉** — has a Schwarzschild radius of ~1,300 AU. Neptune's orbit is at 30 AU; TON 618's event horizon would extend **43× farther than Neptune's orbit** from our Sun. If placed at the Sun's position, its event horizon would engulf our entire Solar System many times over.
:::

## Evidence for Sagittarius A*

For decades, astronomers tracked stars near the Galactic Centre completing elliptical orbits around an invisible point source. The star S2 has an orbital period of only 16 years and a periapsis distance of just 120 AU from Sgr A*. Newton's laws give a central mass of 4 million M☉ — too compact to be anything other than a black hole.

In 2022, the Event Horizon Telescope published the first image of Sagittarius A* — a glowing ring of hot plasma surrounding a dark shadow ~50 microarcseconds across (the angular diameter of an orange on the Moon).

## Quasars: Supermassive Black Holes at Work

When a SMBH actively accretes matter at a high rate, it becomes a **quasar** (quasi-stellar object) — the most luminous persistent objects in the universe. The most powerful quasars outshine their host galaxies by factors of 1,000 or more.

:::discovery
**Andrea Ghez** (UCLA) and **Reinhard Genzel** (Max Planck Institute) shared the **2020 Nobel Prize in Physics** for 30 years of tracking stars near the Galactic Centre. Their teams independently measured the orbits of dozens of stars around Sagittarius A*, proving beyond doubt that a 4-million-solar-mass black hole exists there — making Sgr A* the most carefully studied black hole in history.
:::

:::key
**Every large galaxy has a SMBH**, and the SMBH mass correlates with the properties of the galaxy's central bulge (the M-sigma relation). This suggests that SMBHs and their host galaxies co-evolved — growing together over cosmic time through a feedback process not yet fully understood.
:::

## How Do Supermassive Black Holes Form?

This remains an open question. Leading theories include:
1. **Direct collapse** of massive gas clouds in the early universe
2. **Mergers** of smaller black holes in galactic centres
3. Rapid growth of **Population III stellar remnants** (first generation stars)

The discovery of 10⁹ M☉ quasars at z > 7 (when the universe was <800 million years old) challenges all formation models.

:::quiz
question: How did astronomers confirm the existence of Sagittarius A* as a massive black hole before the EHT image?
- Detecting X-ray emissions
- Tracking the orbits of stars near the Galactic Centre — their elliptical orbits around an invisible point require 4 million M☉ in a tiny volume
- Measuring gravitational waves from Sgr A*
- Observing its photon ring with radio telescopes
correct: 1
explanation: Astronomers at the Keck Observatory and the Max Planck Institute tracked the motions of stars near the Galactic Centre over decades. Star S2 follows an ellipse with a 16-year period and a periapsis of just 120 AU from the central dark mass. Applying Kepler's Third Law gives 4 million M☉ concentrated in a region smaller than our Solar System — only a supermassive black hole fits.
:::

:::quiz
question: The M-sigma relation connects a galaxy's SMBH mass to which stellar property of its host galaxy?
- The total number of stars in the galaxy
- The velocity dispersion (σ) of stars in the galactic bulge
- The galaxy's rotation speed
- The colour of the galaxy's spiral arms
correct: 1
explanation: The M-sigma relation (M_BH ∝ σ⁴ to σ⁵) shows that SMBH mass correlates tightly with the velocity dispersion of stars in the host galaxy's central bulge — even though the SMBH's sphere of influence is tiny compared to the bulge. This unexpected correlation suggests that SMBH growth and galaxy formation are fundamentally linked, possibly through AGN feedback regulating star formation.
:::`,
      },
    ];

    for (const lesson of bhLessons) {
      const { error } = await adminClient.from("lessons").upsert(lesson, { onConflict: "id" });
      if (error) throw new Error(`lesson ${lesson.id}: ${error.message}`);
    }

    return NextResponse.json({
      message: `Seed complete! 4 subjects → 4 courses → 6 modules → 23 lessons inserted (Exoplanets M1×5 + M2×4, Stars×5, Solar System×4, Black Holes×5).`,
      breakdown: {
        subjects: 4,
        courses: 4,
        modules: 6,
        lessons: 23,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
