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

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    // ── Fetch existing subjects ───────────────────────────────────
    const { data: existingSubjects, error: subFetchErr } = await adminClient
      .from("subjects").select("id, slug");
    if (subFetchErr) throw new Error("fetch subjects: " + subFetchErr.message);
    const subMap: Record<string, string> = {};
    for (const s of existingSubjects ?? []) subMap[s.slug] = s.id;

    let totalLessons = 0;
    let totalCourses = 0;

    // ════════════════════════════════════════════════════════════════
    // A1 — Exoplanet Atmospheres & JWST
    // ════════════════════════════════════════════════════════════════
    if (subMap["exoplanets"]) {
      const { data: cAtm, error: cAtmErr } = await adminClient
        .from("courses")
        .upsert({
          id: "exoplanet-atmospheres",
          subject_id: subMap["exoplanets"],
          title: "Exoplanet Atmospheres & JWST",
          slug: "exoplanet-atmospheres",
          description: "Read alien skies with JWST transmission spectroscopy and hunt for biosignatures.",
          level_tag: ["intermediate", "advanced"],
          estimated_hours: 5,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (cAtmErr) throw new Error("course atm: " + cAtmErr.message);
      totalCourses++;

      const { data: mAtm, error: mAtmErr } = await adminClient
        .from("modules")
        .upsert({ course_id: cAtm.id, title: "Reading Alien Skies", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (mAtmErr) throw new Error("module atm: " + mAtmErr.message);

      const atmLessons = [
        {
          course_id: cAtm.id, module_id: mAtm.id,
          title: "How We Read Exoplanet Atmospheres", slug: "transmission-spectra",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 1,
          content_mdx: `<h2>Transmission Spectroscopy</h2>
<p>When a planet transits its star, starlight filters through its atmosphere. Different molecules absorb specific wavelengths, leaving chemical fingerprints we can detect from light years away.</p>
<p>JWST covers 0.6–28 μm, making it ideal for detecting H₂O, CO₂, CH₄, and even biosignatures in distant planetary atmospheres.</p>

:::callout{type="key"}
Transit depth varies with wavelength: ΔF(λ) = (Rp + h_eff(λ))² / R★². Each molecule has unique absorption bands — its spectral fingerprint.
:::

:::interactive
type: transmission-spectra
:::

:::quiz
question: Why does transit depth vary with wavelength in transmission spectroscopy?
options: ["The planet physically changes size","The star emits more light at some wavelengths","Atmospheric molecules absorb specific wavelengths making the planet appear larger","The telescope has different sensitivity at different wavelengths"]
correct: 2
explanation: Different molecules absorb specific wavelengths. Where a molecule absorbs, the atmosphere is opaque higher up, making the planet appear larger (deeper transit) at those wavelengths — creating its spectral fingerprint.
:::`,
        },
        {
          course_id: cAtm.id, module_id: mAtm.id,
          title: "The Search for Biosignatures", slug: "biosignatures",
          content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 2,
          content_mdx: `<h2>Chemical Signs of Life</h2>
<p>A biosignature is any chemical, physical, or structural sign that life is or was present. In atmospheres, we look for gases that wouldn't persist without biological replenishment.</p>
<p>Oxygen (O₂) and ozone (O₃) are the gold standard — photosynthesis is the only known mechanism to maintain high atmospheric O₂ on geological timescales.</p>

:::callout{type="key"}
The "biosignature cocktail": O₂ + H₂O + CH₄ in thermodynamic disequilibrium. CH₄ and O₂ should react; their coexistence implies continuous biological sources.
:::

:::interactive
type: biosignature-spectra
:::

:::quiz
question: What makes oxygen (O₂) a strong potential biosignature?
options: ["It glows visibly from space","It is only produced by living organisms","It is destroyed by UV and must be continuously replenished — primarily by photosynthesis","It is the most abundant gas in any atmosphere"]
correct: 2
explanation: O₂ reacts with rocks and is destroyed by UV radiation. Without continuous replenishment by oxygenic photosynthesis, it would disappear from an atmosphere within ~4 million years — making its sustained presence a strong biosignature.
:::`,
        },
        {
          course_id: cAtm.id, module_id: mAtm.id,
          title: "JWST's First Atmospheric Detections", slug: "jwst-discoveries",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 3,
          content_mdx: `<h2>JWST Changes Everything</h2>
<p>Launched December 25, 2021, JWST is ~100× more sensitive than Hubble for infrared spectroscopy. Its first exoplanet atmospheric results arrived in 2022–2023.</p>
<p>WASP-39b was the first exoplanet with CO₂ unambiguously detected (August 2022), followed by SO₂ from photochemistry — a first for any exoplanet.</p>

:::callout{type="note"}
The TRAPPIST-1 system — 7 Earth-sized planets, 3 in the habitable zone, just 40 light-years away — is JWST's primary atmospheric characterisation target. Results for TRAPPIST-1b (2023): no significant atmosphere detected.
:::

:::quiz
question: Which molecule was first unambiguously detected in an exoplanet atmosphere by JWST?
options: ["Water vapour (H₂O)","Carbon dioxide (CO₂)","Methane (CH₄)","Ozone (O₃)"]
correct: 1
explanation: CO₂ was detected in the hot Jupiter WASP-39b's atmosphere in August 2022 — JWST's first major exoplanet atmospheric discovery, confirming its extraordinary spectroscopic power.
:::`,
        },
        {
          course_id: cAtm.id, module_id: mAtm.id,
          title: "Habitable Zone Atmospheres", slug: "habitable-zone-atmospheres",
          content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 4,
          content_mdx: `<h2>What Makes an Atmosphere Habitable?</h2>
<p>The habitable zone is where liquid water can exist — but it depends heavily on atmosphere. CO₂ greenhouse warming can extend the outer edge; a runaway greenhouse (Venus) shrinks it from inside.</p>
<p>For rocky planets around M-dwarfs, strong stellar flares and lack of a magnetosphere threaten atmospheric retention.</p>

:::callout{type="exercise"}
Compare Earth and Venus: both near the Sun's habitable zone, yet Venus's CO₂ atmosphere creates 735 K. Mars's thin atmosphere averages −60 °C. Atmosphere is destiny.
:::

:::quiz
question: Why is a planetary magnetic field important for habitability?
options: ["It generates internal heat","It deflects stellar wind particles that would otherwise strip the atmosphere","It creates the aurora borealis","It stabilises the orbit"]
correct: 1
explanation: Stellar winds are streams of charged particles that can gradually erode an atmosphere. Earth's magnetosphere deflects most of these. Mars lost its field ~4 Gyr ago and subsequently lost most of its atmosphere to solar wind stripping.
:::`,
        },
      ];
      for (const l of atmLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
      }
      totalLessons += atmLessons.length;
    }

    // ════════════════════════════════════════════════════════════════
    // A2 — Variable Stars & Binary Systems
    // ════════════════════════════════════════════════════════════════
    if (subMap["stars"]) {
      const { data: cVar, error: cVarErr } = await adminClient
        .from("courses")
        .upsert({
          id: "variable-stars",
          subject_id: subMap["stars"],
          title: "Variable Stars & Binary Systems",
          slug: "variable-stars",
          description: "Explore pulsating Cepheids, eclipsing binaries, and the cosmic distance ladder.",
          level_tag: ["intermediate"],
          estimated_hours: 4,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (cVarErr) throw new Error("course var: " + cVarErr.message);
      totalCourses++;

      const { data: mVar, error: mVarErr } = await adminClient
        .from("modules")
        .upsert({ course_id: cVar.id, title: "Stars That Change", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (mVarErr) throw new Error("module var: " + mVarErr.message);

      const varLessons = [
        {
          course_id: cVar.id, module_id: mVar.id,
          title: "Cepheid Variables — The Cosmic Ruler", slug: "cepheids",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 1,
          content_mdx: `<h2>Pulsating Standard Candles</h2>
<p>Cepheid variables are giant yellow stars that pulsate with clock-like precision. Henrietta Swan Leavitt discovered in 1908 that their pulsation period directly correlates with their intrinsic luminosity — the Period-Luminosity relation.</p>
<p>This allows astronomers to measure distances to other galaxies by observing a Cepheid's period and comparing its apparent brightness to its known true brightness.</p>

:::callout{type="formula"}
Leavitt's Law: log(L/L☉) ≈ 1.15 × log(P/days) + 2.47 · Periods range 1–100 days; luminosities 1,000–30,000× the Sun.
:::

:::interactive
type: cepheid
:::

:::quiz
question: What physical property makes Cepheids useful as standard candles?
options: ["They are always the same colour","Their pulsation period reveals their intrinsic luminosity","They only exist in the Milky Way","They never change brightness"]
correct: 1
explanation: Leavitt's Period-Luminosity relation means measuring a Cepheid's pulsation period gives its true luminosity. Comparing true to apparent brightness via the inverse-square law yields the distance — the basis of the extragalactic distance ladder.
:::`,
        },
        {
          course_id: cVar.id, module_id: mVar.id,
          title: "Eclipsing Binaries — Weighing the Stars", slug: "eclipsing-binaries",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 2,
          content_mdx: `<h2>Two Stars, One Light Curve</h2>
<p>When two stars orbit each other nearly edge-on, each periodically passes in front of the other, causing brightness dips. These eclipsing binaries are nature's most precise stellar scales — from light curves alone we can determine stellar masses, radii, and temperatures.</p>

:::callout{type="key"}
Primary minimum: the hotter star is eclipsed → deeper dip. Secondary minimum: cooler star is eclipsed → shallower dip. The ratio of depths gives the ratio of surface temperatures (T₁/T₂)⁴.
:::

:::interactive
type: eclipsing-binary
:::

:::quiz
question: Why is the primary minimum in an eclipsing binary deeper than the secondary minimum?
options: ["The primary star is always larger","When the hotter star is eclipsed, more total luminosity is blocked","The primary eclipse lasts longer","The two stars are at different distances"]
correct: 1
explanation: Eclipse depth is proportional to the surface flux of the star being eclipsed. The hotter star has higher flux per unit area, so eclipsing it removes more total light — producing the deeper primary minimum.
:::`,
        },
        {
          course_id: cVar.id, module_id: mVar.id,
          title: "The Cosmic Distance Ladder", slug: "distance-ladder",
          content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 3,
          content_mdx: `<h2>Building a Universe-Wide Ruler</h2>
<p>No single method reaches all cosmic distances. Astronomers use overlapping techniques: parallax → Cepheids → Type Ia supernovae → Hubble flow. Each rung is calibrated by the one below it.</p>
<p>Parallax reaches ~10 kpc, Cepheids to ~50 Mpc, SNe Ia to ~1000 Mpc, and Hubble flow for everything beyond.</p>

:::callout{type="note"}
The Hubble tension: CMB measurements give H₀ ≈ 67.4 km/s/Mpc; the distance ladder gives ~73 km/s/Mpc. This 5σ discrepancy may signal new physics beyond ΛCDM.
:::

:::quiz
question: What is the "Hubble Tension"?
options: ["Light stretching as it travels","A disagreement between two independent H₀ measurements","The force dark energy exerts on expansion","The difficulty of observing at high redshift"]
correct: 1
explanation: The Hubble constant measured from the CMB (early universe) and from Cepheid/SNe Ia (late universe) disagree by ~9%. This >5σ tension is one of cosmology's most significant open problems and may indicate new physics beyond standard ΛCDM.
:::`,
        },
      ];
      for (const l of varLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
      }
      totalLessons += varLessons.length;
    }

    // ════════════════════════════════════════════════════════════════
    // A3 — Moons of the Solar System
    // ════════════════════════════════════════════════════════════════
    if (subMap["solar-system"]) {
      const { data: cMoons, error: cMoonsErr } = await adminClient
        .from("courses")
        .upsert({
          id: "moons-solar-system",
          subject_id: subMap["solar-system"],
          title: "Moons of the Solar System",
          slug: "moons-solar-system",
          description: "Dive into ocean worlds, volcanic moons, and the search for life beyond Earth.",
          level_tag: ["intermediate"],
          estimated_hours: 4,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (cMoonsErr) throw new Error("course moons: " + cMoonsErr.message);
      totalCourses++;

      const { data: mMoons, error: mMoonsErr } = await adminClient
        .from("modules")
        .upsert({ course_id: cMoons.id, title: "Ocean Worlds & Volcanic Moons", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (mMoonsErr) throw new Error("module moons: " + mMoonsErr.message);

      const moonLessons = [
        {
          course_id: cMoons.id, module_id: mMoons.id,
          title: "Europa — Ocean World Under Ice", slug: "europa-ocean-world",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 1,
          content_mdx: `<h2>An Ocean in Deep Freeze</h2>
<p>Europa, Jupiter's fourth-largest moon, is covered by a globally smooth ice shell ~10–30 km thick. Beneath lies a liquid ocean estimated at 60–150 km deep — more water than all of Earth's oceans combined.</p>
<p>The energy source is tidal heating: Jupiter's gravity flexes Europa's interior as it orbits in a slightly elliptical orbit, generating enough heat to keep the ocean liquid despite −160 °C surface temperatures.</p>

:::callout{type="key"}
Tidal heating ∝ e²·M_planet² / r⁶. Even tiny eccentricities (e = 0.009) produce enormous internal heating when the planet is as massive as Jupiter.
:::

:::interactive
type: tidal-heating
:::

:::quiz
question: What maintains Europa's subsurface ocean despite being so far from the Sun?
options: ["Radioactive decay of heavy elements","Tidal heating from Jupiter's time-varying gravitational pull","Hydrothermal vents heated by the core","Residual formation heat from 4.5 Gyr ago"]
correct: 1
explanation: Europa's slightly elliptical orbit (maintained by Laplace resonance with Io and Ganymede) causes Jupiter's tidal force to continuously deform its interior. This mechanical friction generates enough heat to maintain a liquid water ocean beneath the ice.
:::`,
        },
        {
          course_id: cMoons.id, module_id: mMoons.id,
          title: "Titan — A World with Rivers and Rain", slug: "titan-methane-world",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 2,
          content_mdx: `<h2>Saturn's Hazy Sibling</h2>
<p>Titan is the only moon with a dense atmosphere (1.5× Earth's surface pressure) and the only world besides Earth with stable liquids on its surface — but it's liquid methane, not water. Methane rains from orange clouds, fills lakes, and carves river channels.</p>

:::callout{type="note"}
NASA's Dragonfly mission (launch 2028, arrival 2034) will send a nuclear-powered rotorcraft to hop across Titan's surface, studying prebiotic chemistry in methane lakes and organic dune fields.
:::

:::quiz
question: What is the liquid on Titan's surface made of?
options: ["Water (H₂O)","Liquid nitrogen","Liquid methane and ethane (CH₄/C₂H₆)","Sulphuric acid"]
correct: 2
explanation: At Titan's surface temperature of −179 °C, methane and ethane are liquid. They form rivers, rain, and lakes in a complete "methane hydrological cycle" analogous to Earth's water cycle.
:::`,
        },
        {
          course_id: cMoons.id, module_id: mMoons.id,
          title: "Io — The Solar System's Most Volcanic World", slug: "io-volcanic-moon",
          content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 3,
          content_mdx: `<h2>A Moon on Fire</h2>
<p>Io, Jupiter's innermost large moon, has over 400 active volcanoes erupting simultaneously at any time. Like Europa, it is tidally heated — but far more intensely due to its closer orbit and larger forced eccentricity from the Laplace resonance (Io:Europa:Ganymede = 1:2:4).</p>

:::callout{type="key"}
Io's entire lithosphere is recycled through volcanism on timescales of millions of years — meaning it has no impact craters despite 4.5 Gyr of bombardment.
:::

:::quiz
question: Why doesn't Io have any impact craters?
options: ["Jupiter's gravity deflects all impactors","Its atmosphere burns up asteroids","Continuous volcanic resurfacing buries craters faster than they form","It is too small to retain craters"]
correct: 2
explanation: Io's volcanic resurfacing rate (~1–3 cm/year) is so high that any impact crater is quickly buried under fresh lava flows and sulphur deposits, leaving no ancient craters visible today.
:::`,
        },
      ];
      for (const l of moonLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
      }
      totalLessons += moonLessons.length;
    }

    // ════════════════════════════════════════════════════════════════
    // A4 — Relativity & Spacetime
    // ════════════════════════════════════════════════════════════════
    if (subMap["black-holes"]) {
      const { data: cRel, error: cRelErr } = await adminClient
        .from("courses")
        .upsert({
          id: "relativity-spacetime",
          subject_id: subMap["black-holes"],
          title: "Relativity & Spacetime",
          slug: "relativity-spacetime",
          description: "Master special and general relativity — from time dilation to curved spacetime.",
          level_tag: ["advanced"],
          estimated_hours: 5,
          status: "published",
          difficulty: "advanced",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (cRelErr) throw new Error("course rel: " + cRelErr.message);
      totalCourses++;

      const { data: mRel, error: mRelErr } = await adminClient
        .from("modules")
        .upsert({ course_id: cRel.id, title: "Bending Space and Time", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (mRelErr) throw new Error("module rel: " + mRelErr.message);

      const relLessons = [
        {
          course_id: cRel.id, module_id: mRel.id,
          title: "Moving Clocks Run Slow — Special Relativity", slug: "time-dilation",
          content_type: "concept", xp_reward: 75, difficulty_level: "advanced", order_index: 1,
          content_mdx: `<h2>The Postulates of Special Relativity</h2>
<p>Einstein's 1905 paper rested on two postulates: (1) The laws of physics are identical in all inertial frames, and (2) The speed of light is the same for all observers regardless of the source's motion.</p>
<p>These lead to startling consequences: moving clocks tick slower (time dilation), moving objects contract (length contraction), and E = mc².</p>

:::callout{type="formula"}
Time dilation: τ = t/γ, where γ = 1/√(1−v²/c²). At v = 0.866c, γ = 2 — the moving clock runs at half speed.
:::

:::interactive
type: time-dilation
:::

:::quiz
question: A spaceship travels at v = 0.8c for 10 years of Earth time. How much does the crew age?
options: ["10 years","8 years","6 years","4 years"]
correct: 2
explanation: γ = 1/√(1−0.64) = 1/0.6 = 1.667. Proper time τ = t/γ = 10/1.667 ≈ 6 years. The crew ages only 6 years while 10 years pass on Earth — they arrive younger than their Earth-bound twins.
:::`,
        },
        {
          course_id: cRel.id, module_id: mRel.id,
          title: "Mass Warps Spacetime — General Relativity", slug: "curved-spacetime",
          content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 2,
          content_mdx: `<h2>Gravity as Geometry</h2>
<p>Newton described gravity as a force; Einstein reimagined it as the curvature of 4-dimensional spacetime. Mass-energy warps the fabric of spacetime, and objects follow the straightest possible paths (geodesics) through that curved geometry.</p>

:::callout{type="key"}
GPS satellites experience two relativistic effects: they run fast due to weaker gravity (+45 μs/day) and slow due to orbital velocity (−7 μs/day). The net +38 μs/day must be corrected or GPS errors accumulate at ~10 km/day.
:::

:::interactive
type: spacetime-curvature
:::

:::quiz
question: How does general relativity describe gravity differently from Newton?
options: ["As a force carried by gravitons","As curvature of 4D spacetime caused by mass-energy","As a property of electric charge","As a quantum effect"]
correct: 1
explanation: GR replaces Newton's "force at a distance" with curved spacetime geometry. Mass-energy warps the spacetime manifold; objects follow geodesics through this curved geometry — what we perceive as gravitational attraction.
:::`,
        },
        {
          course_id: cRel.id, module_id: mRel.id,
          title: "Testing General Relativity", slug: "tests-and-predictions",
          content_type: "concept", xp_reward: 75, difficulty_level: "advanced", order_index: 3,
          content_mdx: `<h2>From Mercury's Orbit to LIGO</h2>
<p>GR's immediate predictions: (1) Mercury's perihelion precesses 43 arcsec/century — Newton failed here. (2) Light bends 1.75 arcsec near the Sun — confirmed by Eddington's 1919 eclipse expedition. (3) Gravitational redshift — confirmed by Pound-Rebka 1959.</p>
<p>Modern tests: Shapiro delay, gravitational waves (LIGO 2015), Event Horizon Telescope images of M87* (2019) and Sgr A* (2022).</p>

:::callout{type="note"}
LIGO's first detection (GW150914) measured a strain of h = ΔL/L = 10⁻²¹ — equivalent to measuring the distance to the nearest star to the width of a proton. The signal lasted 0.2 seconds.
:::

:::quiz
question: What was the significance of Eddington's 1919 solar eclipse expedition?
options: ["It discovered the first exoplanet","It confirmed that gravity bends light, exactly as GR predicted","It measured the speed of light","It proved Earth orbits the Sun"]
correct: 1
explanation: During the 1919 eclipse, stars near the Sun appeared shifted by 1.75 arcseconds — exactly GR's prediction. This confirmed that mass curves spacetime for light too, making Einstein world-famous overnight.
:::`,
        },
      ];
      for (const l of relLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
      }
      totalLessons += relLessons.length;
    }

    // ════════════════════════════════════════════════════════════════
    // B1 — Cosmology (new subject)
    // ════════════════════════════════════════════════════════════════
    const { data: subCosmo, error: subCosmoErr } = await adminClient
      .from("subjects")
      .upsert({ title: "Cosmology", slug: "cosmology", icon_name: "🌌", description: "The origin, evolution, and fate of the universe.", color: "#bc8cff", order: 5 }, { onConflict: "slug" })
      .select().single();
    if (subCosmoErr) throw new Error("subject cosmology: " + subCosmoErr.message);

    const { data: cCosmo, error: cCosmoErr } = await adminClient
      .from("courses")
      .upsert({ id: "big-bang-beyond", subject_id: subCosmo.id, title: "The Big Bang & Beyond", slug: "big-bang-beyond", description: "From the Big Bang to dark energy — the origin and fate of the universe.", level_tag: ["intermediate", "advanced"], estimated_hours: 6, status: "published", difficulty: "intermediate", order_index: 1, is_public: true }, { onConflict: "id" })
      .select().single();
    if (cCosmoErr) throw new Error("course cosmology: " + cCosmoErr.message);
    totalCourses++;

    const { data: mCosmo, error: mCosmoErr } = await adminClient
      .from("modules")
      .upsert({ course_id: cCosmo.id, title: "From Nothing to Everything", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (mCosmoErr) throw new Error("module cosmo: " + mCosmoErr.message);

    const cosmoLessons = [
      {
        course_id: cCosmo.id, module_id: mCosmo.id,
        title: "The Expanding Universe", slug: "expanding-universe",
        content_type: "concept", xp_reward: 50, difficulty_level: "beginner", order_index: 1,
        content_mdx: `<h2>Hubble's Discovery</h2>
<p>In 1929, Edwin Hubble showed that distant galaxies recede at speeds proportional to distance: v = H₀d. This is not galaxies moving through space but space itself expanding — stretching light wavelengths (redshift) as photons travel.</p>
<p>Running the expansion backwards implies all matter originated from an extremely hot, dense state ~13.8 billion years ago: the Big Bang.</p>

:::callout{type="formula"}
Hubble's Law: v = H₀ × d · H₀ ≈ 70 km/s/Mpc. The Hubble time tH = 1/H₀ ≈ 14 Gyr — a rough age estimate.
:::

:::interactive
type: cosmic-expansion
:::

:::quiz
question: What does Hubble's Law v = H₀d tell us?
options: ["Galaxies move through space away from us","The universe is expanding — space itself stretches between galaxies","Only the Milky Way is at the centre","Gravity has reversed direction"]
correct: 1
explanation: Hubble's Law reveals cosmological expansion: space itself is stretching. Every galaxy recedes from every other, with velocity proportional to distance. There is no centre — every point sees all others receding, like raisins in rising bread dough.
:::`,
      },
      {
        course_id: cCosmo.id, module_id: mCosmo.id,
        title: "The CMB — Echo of the Big Bang", slug: "cosmic-microwave-background",
        content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 2,
        content_mdx: `<h2>The Oldest Light</h2>
<p>The CMB is thermal radiation from when the universe was 380,000 years old — the moment hydrogen formed and photons could travel freely. We see those photons today, cooled to 2.725 K.</p>
<p>Tiny temperature fluctuations (ΔT/T ~ 10⁻⁵) were seeded by quantum fluctuations during inflation and grew into all galaxies, clusters, and cosmic structure.</p>

:::callout{type="key"}
CMB acoustic peaks encode the baryon-to-photon ratio, spatial geometry, and dark matter density. The first peak at l ≈ 200 indicates a spatially flat universe (Ω_total ≈ 1).
:::

:::interactive
type: cmb
:::

:::quiz
question: What caused the temperature fluctuations seen in the CMB?
options: ["Hot and cold gas regions at recombination","Quantum vacuum fluctuations amplified by inflation in the first 10⁻³² seconds","Gravitational waves from the Big Bang","Milky Way foreground emission"]
correct: 1
explanation: During inflation, quantum vacuum fluctuations were stretched to macroscopic scales. These density perturbations evolved into acoustic oscillations in the baryon-photon plasma, imprinted as ΔT/T ≈ 10⁻⁵ fluctuations in the CMB.
:::`,
      },
      {
        course_id: cCosmo.id, module_id: mCosmo.id,
        title: "Dark Energy — The Accelerating Universe", slug: "dark-energy-lesson",
        content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 3,
        content_mdx: `<h2>Einstein's Cosmological Constant Returns</h2>
<p>In 1998, Type Ia supernovae appeared fainter than expected for a decelerating universe. The expansion is accelerating — driven by dark energy (Λ), which constitutes ~68% of the universe's energy content.</p>
<p>The cosmological constant predicts 10¹²⁰ times more vacuum energy than observed — the worst prediction in physics. DESI 2024 hints that w ≠ −1, suggesting dynamical dark energy.</p>

:::callout{type="key"}
Equation of state: w = P/(ρc²). Cosmological constant: w = −1. Phantom energy (w < −1) would lead to a Big Rip in ~22 Gyr.
:::

:::interactive
type: dark-energy
:::

:::quiz
question: What did 1998 Type Ia supernova surveys discover?
options: ["The universe is older than 20 Gyr","The expansion is accelerating, implying dark energy","The Hubble constant is zero","Supernovae create new dark matter"]
correct: 1
explanation: Perlmutter, Schmidt, and Riess (Nobel Prize 2011) found distant SNe Ia were ~25% fainter than expected — they were farther away than a decelerating universe predicts. The expansion is accelerating, driven by a mysterious dark energy Λ.
:::`,
      },
      {
        course_id: cCosmo.id, module_id: mCosmo.id,
        title: "The Fate of the Universe", slug: "fate-of-universe",
        content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 4,
        content_mdx: `<h2>How Does It End?</h2>
<p>If Λ is constant (w = −1), the universe expands forever. Stars burn out, black holes evaporate via Hawking radiation, and the universe reaches maximum entropy — the "Heat Death." If dark energy strengthens (w < −1), a "Big Rip" tears apart everything in ~22 Gyr.</p>

:::callout{type="note"}
Timescales: last star formation ~10¹⁴ yr · stellar BHs evaporate ~10⁶⁷ yr · supermassive BHs ~10⁹⁸ yr. The universe has barely begun.
:::

:::quiz
question: What is the "Heat Death" of the universe?
options: ["The Sun expanding to engulf Earth","The universe reaching maximum entropy with no free energy available","A Big Crunch collapse","All stars becoming neutron stars"]
correct: 1
explanation: Heat Death is thermodynamic equilibrium at maximum entropy. All black holes have evaporated, all matter has decayed to its most stable forms, and no temperature gradients remain to drive any physical processes. The universe becomes static and eventless.
:::`,
      },
    ];
    for (const l of cosmoLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
    }
    totalLessons += cosmoLessons.length;

    // ════════════════════════════════════════════════════════════════
    // B2 — Galaxies (new subject)
    // ════════════════════════════════════════════════════════════════
    const { data: subGal, error: subGalErr } = await adminClient
      .from("subjects")
      .upsert({ title: "Galaxies", slug: "galaxies", icon_name: "🌀", description: "From the Milky Way to the most distant quasars.", color: "#f7cc4a", order: 6 }, { onConflict: "slug" })
      .select().single();
    if (subGalErr) throw new Error("subject galaxies: " + subGalErr.message);

    const { data: cGal, error: cGalErr } = await adminClient
      .from("courses")
      .upsert({ id: "milky-way-beyond", subject_id: subGal.id, title: "The Milky Way & Beyond", slug: "milky-way-beyond", description: "Explore our galaxy and the vast universe of galaxies beyond it.", level_tag: ["beginner", "intermediate"], estimated_hours: 5, status: "published", difficulty: "beginner", order_index: 1, is_public: true }, { onConflict: "id" })
      .select().single();
    if (cGalErr) throw new Error("course galaxies: " + cGalErr.message);
    totalCourses++;

    const { data: mGal, error: mGalErr } = await adminClient
      .from("modules")
      .upsert({ course_id: cGal.id, title: "Islands in the Cosmos", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (mGalErr) throw new Error("module gal: " + mGalErr.message);

    const galLessons = [
      {
        course_id: cGal.id, module_id: mGal.id,
        title: "Our Galaxy — The Milky Way", slug: "our-milky-way",
        content_type: "concept", xp_reward: 50, difficulty_level: "beginner", order_index: 1,
        content_mdx: `<h2>Home Galaxy</h2>
<p>The Milky Way is a barred spiral galaxy (SBbc) with 200–400 billion stars, ~100,000 light-years across. Our Solar System is ~26,000 light-years from the centre in the Orion Arm. The galactic centre hosts Sgr A* — a 4-million M☉ supermassive black hole confirmed by the Event Horizon Telescope in 2022.</p>

:::callout{type="note"}
The Milky Way is part of the Local Group (>80 galaxies), within the Virgo Supercluster, within the Laniakea Supercluster (500 Mpc, 10¹⁷ M☉). The observable universe contains ~2 trillion galaxies.
:::

:::quiz
question: Where in the Milky Way is our Solar System?
options: ["At the galactic centre near Sgr A*","In the Orion Arm, ~26,000 light-years from the centre","At the outer edge of the disc","In a globular cluster in the halo"]
correct: 1
explanation: The Solar System is in the Orion Spur (Orion Arm), a minor spiral arm of the Milky Way, approximately 26,000 light-years from the galactic centre — safely distant from the intense radiation environment near Sgr A*.
:::`,
      },
      {
        course_id: cGal.id, module_id: mGal.id,
        title: "The Hubble Sequence — Galaxy Shapes", slug: "galaxy-morphology",
        content_type: "concept", xp_reward: 75, difficulty_level: "beginner", order_index: 2,
        content_mdx: `<h2>Why Do Galaxies Look Different?</h2>
<p>Hubble classified galaxies in 1926 into a "tuning fork": ellipticals (E0–E7), lenticulars (S0), spirals (Sa–Sc), and barred spirals (SBa–SBc). Morphology correlates with star formation rate, gas content, and environment.</p>

:::callout{type="key"}
Blue galaxies = active star formation (hot O/B stars). Red galaxies = "quenched" — dominated by old cool stars. The "green valley" marks galaxies transitioning between active and quiescent.
:::

:::interactive
type: galaxy-morphology
:::

:::quiz
question: What causes most elliptical galaxies to have little or no star formation?
options: ["They have no gas at all","Their gas was consumed or expelled, quenching star formation","They rotate too fast for stars to form","Ellipticals are too small"]
correct: 1
explanation: Ellipticals form primarily through mergers of spirals. During major mergers, gas is consumed in starbursts or expelled by AGN feedback. Without cold gas supply, new stars cannot form — the galaxy "quenches" and ages to a red, passively-evolving state.
:::`,
      },
      {
        course_id: cGal.id, module_id: mGal.id,
        title: "Dark Matter — The Invisible Scaffolding", slug: "dark-matter-rotation-curves",
        content_type: "concept", xp_reward: 100, difficulty_level: "intermediate", order_index: 3,
        content_mdx: `<h2>The Missing Mass Problem</h2>
<p>In the 1970s, Vera Rubin and Kent Ford measured galaxy rotation curves and found stars in the outer disc orbit at constant speeds rather than falling off as v ∝ 1/√r — indicating far more mass than visible. Dark matter halos extend far beyond the visible disc, contributing ~85% of total mass.</p>

:::callout{type="key"}
Additional evidence: gravitational lensing (clusters bend light more than visible mass predicts), the Bullet Cluster (mass and hot gas separate during cluster collision), CMB power spectrum.
:::

:::interactive
type: galaxy-rotation
:::

:::quiz
question: What does a flat galaxy rotation curve imply?
options: ["The galaxy is not rotating","There is more mass at large radii than visible stars and gas can account for","The measurement is incorrect","All galaxies have equal amounts of dark and visible matter"]
correct: 1
explanation: Kepler's law predicts v ∝ 1/√r beyond the bulk of the mass. A flat curve (v ≈ const) requires M(r) ∝ r — mass continues to increase with radius where no stars are visible. This unseen mass is the extended dark matter halo.
:::`,
      },
      {
        course_id: cGal.id, module_id: mGal.id,
        title: "Quasars & Active Galactic Nuclei", slug: "active-galactic-nuclei",
        content_type: "concept", xp_reward: 100, difficulty_level: "advanced", order_index: 4,
        content_mdx: `<h2>The Most Luminous Objects in the Universe</h2>
<p>Active Galactic Nuclei (AGN) are powered by matter spiralling into a supermassive black hole (10⁶–10¹⁰ M☉). Gravitational potential energy converts to radiation with up to 40% efficiency — vastly exceeding nuclear fusion's 0.7%. Quasars are the most luminous AGN, visible across 90% of the observable universe.</p>

:::callout{type="key"}
AGN Unification: the same central engine (SMBH + accretion disc + jets) appears different by viewing angle. Face-on: blazar. Through torus: Seyfert 2. High power: quasar.
:::

:::quiz
question: What powers quasars to such extreme luminosities?
options: ["Rapid nuclear fusion more efficient than in stars","Matter accreting onto a supermassive black hole","Simultaneous supernovae","Extremely rapid star formation"]
correct: 1
explanation: Accretion onto a SMBH converts gravitational potential energy to radiation with up to ~40% efficiency — far exceeding fusion's ~0.7%. A quasar can emit 1000× the Milky Way's total luminosity from a region the size of our solar system.
:::`,
      },
    ];
    for (const l of galLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
    }
    totalLessons += galLessons.length;

    // ════════════════════════════════════════════════════════════════
    // B3 — Observational Astronomy (new subject)
    // ════════════════════════════════════════════════════════════════
    const { data: subObs, error: subObsErr } = await adminClient
      .from("subjects")
      .upsert({ title: "Observational Astronomy", slug: "observational-astronomy", icon_name: "🔭", description: "How astronomers observe the universe across all wavelengths.", color: "#58a6ff", order: 7 }, { onConflict: "slug" })
      .select().single();
    if (subObsErr) throw new Error("subject obs: " + subObsErr.message);

    const { data: cObs, error: cObsErr } = await adminClient
      .from("courses")
      .upsert({ id: "how-we-see-universe", subject_id: subObs.id, title: "How We See the Universe", slug: "how-we-see-universe", description: "Discover how telescopes, light, and detectors reveal the invisible cosmos.", level_tag: ["beginner"], estimated_hours: 4, status: "published", difficulty: "beginner", order_index: 1, is_public: true }, { onConflict: "id" })
      .select().single();
    if (cObsErr) throw new Error("course obs: " + cObsErr.message);
    totalCourses++;

    const { data: mObs, error: mObsErr } = await adminClient
      .from("modules")
      .upsert({ course_id: cObs.id, title: "Light, Telescopes & Detectors", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (mObsErr) throw new Error("module obs: " + mObsErr.message);

    const obsLessons = [
      {
        course_id: cObs.id, module_id: mObs.id,
        title: "The Electromagnetic Spectrum", slug: "electromagnetic-spectrum",
        content_type: "concept", xp_reward: 50, difficulty_level: "beginner", order_index: 1,
        content_mdx: `<h2>All the Colours of the Universe</h2>
<p>Visible light is a tiny sliver of the EM spectrum. The universe radiates across 20 orders of magnitude in wavelength — from radio waves metres long to gamma rays 10⁻¹⁴ m. Each band reveals different physics: radio synchrotron and cold hydrogen; X-ray hot gas and compact objects; gamma-ray nuclear reactions and GRBs.</p>

:::interactive
type: em-spectrum
:::

:::quiz
question: Why do astronomers need telescopes at many different wavelengths?
options: ["Optical telescopes are too expensive","Different physical processes emit at different wavelengths — no single band shows everything","Different wavelengths travel at different speeds","The atmosphere blocks all wavelengths equally"]
correct: 1
explanation: A complete picture of any astronomical object requires multiple wavelengths. Hot corona emits X-rays; stellar photosphere emits optical; surrounding dust emits infrared; molecular clouds emit radio. Multiwavelength astronomy reveals the full physics.
:::`,
      },
      {
        course_id: cObs.id, module_id: mObs.id,
        title: "How Telescopes Work", slug: "telescope-optics",
        content_type: "concept", xp_reward: 75, difficulty_level: "beginner", order_index: 2,
        content_mdx: `<h2>Gathering Light from the Cosmos</h2>
<p>A telescope's primary purpose is light collection, not magnification. Aperture D determines how many photons are collected per second. The Rayleigh criterion θ = 1.22λ/D sets the diffraction-limited angular resolution.</p>

:::callout{type="formula"}
Light gathering ∝ D². Resolution θ ∝ λ/D. A 4-metre telescope collects 4× more light than a 2-metre. Doubling aperture halves the minimum resolvable angle.
:::

:::interactive
type: telescope-optics
:::

:::quiz
question: Why do radio telescopes need to be far larger than optical telescopes for the same angular resolution?
options: ["Radio waves travel slower","Radio waves are invisible so more are needed","θ = 1.22λ/D — radio wavelengths are ~10⁷× longer, requiring proportionally larger apertures","Radio telescopes collect fewer photons per area"]
correct: 2
explanation: The Rayleigh criterion θ = 1.22λ/D means resolution scales with wavelength. Radio waves at 21 cm are ~400,000× longer than 500 nm visible light, requiring an aperture ~400,000× larger for the same resolution — hence VLBI arrays spanning continents.
:::`,
      },
      {
        course_id: cObs.id, module_id: mObs.id,
        title: "Space Observatories", slug: "space-telescopes",
        content_type: "concept", xp_reward: 75, difficulty_level: "beginner", order_index: 3,
        content_mdx: `<h2>Above the Atmosphere</h2>
<p>Earth's atmosphere blocks gamma, X-ray, far-UV, and far-IR — and blurs optical images to ~1 arcsecond resolution. Space telescopes access the full spectrum and achieve diffraction-limited performance.</p>
<p>Key missions: HST (optical/UV), Chandra (X-ray), Fermi (gamma), Planck (CMB), Spitzer/Herschel (infrared), and JWST (near/mid-IR, launched 2021).</p>

:::callout{type="note"}
JWST sits at the Sun-Earth L2 point, 1.5 million km away. Its 6.5-metre mirror — 18 gold-coated beryllium segments — and 5-layer sunshield cool the telescope to 40 K, essential for mid-infrared sensitivity.
:::

:::quiz
question: Why is JWST optimised for infrared rather than visible light?
options: ["Infrared is cheaper to detect","Distant galaxies are redshifted into the infrared, and cool/dusty objects emit there","JWST's mirror only reflects infrared","Infrared passes through Earth's atmosphere so space is unnecessary"]
correct: 1
explanation: Two reasons: (1) Galaxies at z > 2 have their rest-frame optical light redshifted into the near-infrared. (2) Cool objects — planet-forming discs, exoplanet atmospheres, brown dwarfs — peak in mid-infrared emission. JWST was purpose-built for both.
:::`,
      },
    ];
    for (const l of obsLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
    }
    totalLessons += obsLessons.length;

    // ════════════════════════════════════════════════════════════════
    // B4 — Astrobiology (new subject)
    // ════════════════════════════════════════════════════════════════
    const { data: subAstro, error: subAstroErr } = await adminClient
      .from("subjects")
      .upsert({ title: "Astrobiology", slug: "astrobiology", icon_name: "👽", description: "The science of life in the universe.", color: "#3fb950", order: 8 }, { onConflict: "slug" })
      .select().single();
    if (subAstroErr) throw new Error("subject astrobiology: " + subAstroErr.message);

    const { data: cLife, error: cLifeErr } = await adminClient
      .from("courses")
      .upsert({ id: "life-in-universe", subject_id: subAstro.id, title: "Is Anyone Out There?", slug: "life-in-universe", description: "Explore extremophiles, the Drake Equation, and the search for extraterrestrial life.", level_tag: ["beginner", "intermediate"], estimated_hours: 5, status: "published", difficulty: "beginner", order_index: 1, is_public: true }, { onConflict: "id" })
      .select().single();
    if (cLifeErr) throw new Error("course life: " + cLifeErr.message);
    totalCourses++;

    const { data: mLife, error: mLifeErr } = await adminClient
      .from("modules")
      .upsert({ course_id: cLife.id, title: "The Search for Life", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (mLifeErr) throw new Error("module life: " + mLifeErr.message);

    const lifeLessons = [
      {
        course_id: cLife.id, module_id: mLife.id,
        title: "Life at the Extremes — Lessons from Earth", slug: "extremophiles",
        content_type: "concept", xp_reward: 50, difficulty_level: "beginner", order_index: 1,
        content_mdx: `<h2>Life Finds a Way</h2>
<p>Extremophiles thrive in conditions once thought lethal. Deep-sea hydrothermal vent communities (discovered 1977) survive without sunlight using chemosynthesis. Tardigrades survive vacuum, radiation, and temperatures from −272 °C to +150 °C. These discoveries dramatically expand the range of environments that might host life.</p>

:::callout{type="key"}
Key requirements for carbon-based life: liquid water, energy source (light or chemical), CHNOPS elements, and thermodynamic disequilibrium. Extremophiles show life needs far less than we assumed.
:::

:::quiz
question: Why is the discovery of deep-sea hydrothermal vent ecosystems important for astrobiology?
options: ["They proved life needs sunlight","They showed life can be powered entirely by chemical energy without sunlight","They proved all life has a common ancestor","They discovered life survives in outer space"]
correct: 1
explanation: Hydrothermal vent communities use chemosynthesis — oxidising hydrogen sulphide for energy. This proved sunlight is not a prerequisite for life, dramatically expanding potential habitats to include icy moon subsurface oceans far from any star.
:::`,
      },
      {
        course_id: cLife.id, module_id: mLife.id,
        title: "Habitable Zones — Where Could Life Exist?", slug: "habitable-zones",
        content_type: "concept", xp_reward: 75, difficulty_level: "beginner", order_index: 2,
        content_mdx: `<h2>The Goldilocks Zone</h2>
<p>The circumstellar habitable zone (CHZ) is the range of distances where a rocky planet can maintain liquid water on its surface, assuming Earth-like atmospheric pressure. The inner edge is the runaway greenhouse threshold; the outer edge is where CO₂ condenses.</p>
<p>For the Sun: CHZ spans ~0.95–1.67 AU. For red dwarfs: ~0.1–0.4 AU, raising concerns about tidal locking and stellar flares.</p>

:::callout{type="note"}
The CHZ concept underestimates habitable real estate. Europa and Enceladus are outside the Sun's CHZ but may host life in subsurface oceans heated by tidal forces — expanding potential habitats by 10–100×.
:::

:::quiz
question: Why are planets in M-dwarf habitable zones potentially problematic for life?
options: ["Red dwarfs are too cold for photosynthesis","HZ planets are likely tidally locked plus experience frequent powerful UV/X-ray flares","Red dwarfs lack enough heavy elements for rocky planets","Their HZs are too large for one planet"]
correct: 1
explanation: Planets at ~0.1–0.4 AU from an M-dwarf are likely tidally locked (one face always toward the star), creating extreme temperature gradients. M-dwarfs are also highly flare-active, bombarding close-in planets with UV and X-ray radiation that can strip atmospheres and damage DNA.
:::`,
      },
      {
        course_id: cLife.id, module_id: mLife.id,
        title: "The Drake Equation & the Fermi Paradox", slug: "drake-equation-lesson",
        content_type: "concept", xp_reward: 100, difficulty_level: "intermediate", order_index: 3,
        content_mdx: `<h2>How Many Civilisations?</h2>
<p>Frank Drake's 1961 equation N = R★ × fₚ × nₑ × fₗ × fᵢ × fᵪ × L estimates detectable civilisations in our galaxy. Optimistic estimates range from 1,000 to millions; pessimistic estimates give N ≈ 1 (us). The Fermi Paradox asks: if N is large, where is everyone?</p>

:::callout{type="key"}
The Great Filter: something must prevent most potential civilisations from becoming spacefaring. If it's behind us (e.g., origin of life is rare), we may be unique. If ahead (e.g., civilisations self-destruct), the implications are terrifying.
:::

:::interactive
type: drake-equation
:::

:::quiz
question: What is the "Great Filter" in response to the Fermi Paradox?
options: ["A physical barrier at the galaxy's edge blocking signals","An extremely improbable evolutionary step preventing civilisations from becoming spacefaring","A filter used to remove noise from SETI signals","A magnetic barrier around solar systems"]
correct: 1
explanation: Robin Hanson (1998) proposed that something in the pathway from non-life to spacefaring civilisation is extraordinarily improbable. The key question: is the filter in our past (making us rare/unique) or in our future (civilisations regularly self-destruct)?
:::`,
      },
      {
        course_id: cLife.id, module_id: mLife.id,
        title: "SETI — 60 Years of Searching", slug: "seti-search",
        content_type: "concept", xp_reward: 75, difficulty_level: "intermediate", order_index: 4,
        content_mdx: `<h2>Listening to the Cosmos</h2>
<p>Project Ozma (1960) — Frank Drake's first SETI search — observed Tau Ceti and Epsilon Eridani at 1.42 GHz (the 21-cm hydrogen line, a "cosmic watering hole"). Since then: the "Wow! signal" (1977, unrepeated), SETI@home (1999–2020, 5.2 million volunteers), Breakthrough Listen (2016–present). As of 2025, N_detected = 0.</p>

:::callout{type="note"}
Technosignatures extend beyond radio: optical laser pulses, atmospheric pollutants (NO₂, CFCs detectable by JWST), Dyson sphere infrared excesses, gravitational wave beacons. The search has barely begun.
:::

:::quiz
question: Why is 1.42 GHz (21-cm hydrogen line) significant for SETI?
options: ["It is the only frequency penetrating interstellar gas","It is naturally produced by all stars","Any technological civilisation capable of radio astronomy would know this universal frequency — a 'cosmic watering hole'","21 cm is the minimum resolution achievable by radio telescopes"]
correct: 2
explanation: The 21-cm line is emitted by neutral hydrogen — the most abundant element in the universe. Morrison and Cocconi (1959) proposed in the first modern SETI paper that this universal frequency would be the natural choice for interstellar communication.
:::`,
      },
    ];
    for (const l of lifeLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({ ...l, id: l.slug }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.slug}: ${le.message}`);
    }
    totalLessons += lifeLessons.length;

    return NextResponse.json({
      message: `Expansion seeded! ${totalCourses} new courses · ${totalLessons} new lessons across 8 courses (4 Option A + 4 Option B new subjects).`,
      breakdown: { totalNewCourses: totalCourses, totalNewLessons: totalLessons },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("seed-expansion error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
