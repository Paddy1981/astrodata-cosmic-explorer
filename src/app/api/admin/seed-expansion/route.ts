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

    // ════════════════════════════════════════════════════════════════
    // OPTION A — New courses within existing subjects
    // ════════════════════════════════════════════════════════════════

    // ── Fetch existing subjects ───────────────────────────────────
    const { data: subjects, error: subErr } = await adminClient
      .from("subjects").select("id, slug");
    if (subErr) throw new Error("fetch subjects: " + subErr.message);

    const subjectMap: Record<string, string> = {};
    for (const s of subjects ?? []) subjectMap[s.slug] = s.id;

    // ── A1: Exoplanet Atmospheres & JWST (under exoplanets) ────────
    if (subjectMap["exoplanets"]) {
      const { data: courseAtm, error: courseAtmErr } = await adminClient
        .from("courses")
        .upsert({
          id: "exoplanet-atmospheres",
          title: "Exoplanet Atmospheres & JWST",
          slug: "exoplanet-atmospheres",
          description: "Dive into the chemistry of alien skies — from hot Jupiters to Earth-sized worlds — using JWST's revolutionary transmission spectroscopy.",
          subject_id: subjectMap["exoplanets"],
          level_tag: ["intermediate", "advanced"],
          estimated_hours: 5,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (courseAtmErr) throw new Error("courses exoplanet-atmospheres: " + courseAtmErr.message);

      const { data: modAtm, error: modAtmErr } = await adminClient
        .from("modules")
        .upsert({ course_id: courseAtm.id, title: "Reading Alien Skies", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (modAtmErr) throw new Error("module atm: " + modAtmErr.message);

      const atmLessons = [
        {
          id: "atm-transmission-spectra",
          slug: "transmission-spectra",
          title: "How We Read Exoplanet Atmospheres",
          order: 1,
          xp_reward: 75,
          content_mdx: `<h2>Transmission Spectroscopy</h2>
<p>When a planet transits its star, starlight filters through its atmosphere. Different molecules absorb specific wavelengths, leaving chemical fingerprints we can detect.</p>
<p>JWST covers wavelengths from 0.6–28 μm, making it ideal for detecting H₂O, CO₂, CH₄, and even biosignatures in distant planetary atmospheres.</p>

:::callout{type="key"}
Transit depth varies with wavelength: Δλ = (Rp + h_eff(λ))² / R★² where h_eff is the effective atmospheric scale height at each wavelength.
:::

:::interactive
type: transmission-spectra
:::

:::quiz
question: Why does transit depth vary with wavelength in transmission spectroscopy?
options: ["The planet changes size at different wavelengths","The star emits more light at some wavelengths","Atmospheric molecules absorb specific wavelengths, making the planet appear larger","The telescope has wavelength-dependent sensitivity"]
correct: 2
explanation: Different molecules have absorption bands at specific wavelengths. When a molecule absorbs, the atmosphere is opaque higher up, making the planet appear larger (deeper transit) at those wavelengths.
:::`,
        },
        {
          id: "atm-biosignatures",
          slug: "biosignatures",
          title: "The Search for Biosignatures",
          order: 2,
          xp_reward: 100,
          content_mdx: `<h2>Chemical Signs of Life</h2>
<p>A biosignature is any chemical, physical, or structural sign that life has existed or is active. In atmospheres, we look for gases that wouldn't persist without biological replenishment.</p>
<p>Oxygen (O₂) and ozone (O₃) are the gold standard biosignatures — photosynthesis is the only known mechanism to maintain high atmospheric O₂ concentrations on geological timescales.</p>

:::callout{type="key"}
The "biosignature cocktail" — O₂ + H₂O + CH₄ in thermodynamic disequilibrium — is a strong indicator. CH₄ and O₂ together should react; their coexistence implies continuous biological sources.
:::

:::interactive
type: biosignature-spectra
:::

:::quiz
question: What makes oxygen (O₂) a strong potential biosignature?
options: ["It glows visibly from space","It is only produced by living organisms","It is destroyed by UV radiation and must be replenished continuously","It is the most abundant gas in any atmosphere"]
correct: 2
explanation: O₂ reacts with rocks and UV creates ozone; without continuous replenishment (primarily by oxygenic photosynthesis), it would disappear from an atmosphere within ~4 million years.
:::`,
        },
        {
          id: "atm-jwst-discoveries",
          slug: "jwst-discoveries",
          title: "JWST's First Atmospheric Detections",
          order: 3,
          xp_reward: 75,
          content_mdx: `<h2>JWST Changes Everything</h2>
<p>Launched December 25, 2021, JWST is 100× more sensitive than Hubble for infrared spectroscopy. Its first exoplanet atmospheric results arrived in 2022–2023.</p>
<p><strong>WASP-39b</strong> was the first exoplanet to have CO₂ unambiguously detected (August 2022), followed by SO₂ (sulphur dioxide) from photochemistry — a first for any exoplanet.</p>

:::callout{type="note"}
The TRAPPIST-1 system — 7 Earth-sized planets, 3 in the habitable zone, 40 light years away — is JWST's primary atmospheric characterisation target. Results for TRAPPIST-1b (no significant atmosphere) and TRAPPIST-1c arrived in 2023.
:::

:::quiz
question: Which molecule was first unambiguously detected in an exoplanet atmosphere by JWST?
options: ["Water vapour (H₂O)","Carbon dioxide (CO₂)","Methane (CH₄)","Ozone (O₃)"]
correct: 1
explanation: CO₂ was detected in hot Jupiter WASP-39b's atmosphere in August 2022, marking JWST's first major exoplanet atmospheric discovery and proof of its extraordinary spectroscopic power.
:::`,
        },
        {
          id: "atm-hab-zone-atm",
          slug: "habitable-zone-atmospheres",
          title: "Atmospheres in the Habitable Zone",
          order: 4,
          xp_reward: 100,
          content_mdx: `<h2>What Makes an Atmosphere Habitable?</h2>
<p>The habitable zone is where liquid water can exist on the surface — but the zone depends heavily on the planetary atmosphere. CO₂ and greenhouse gases can extend the outer edge; a runaway greenhouse (Venus) shrinks it from inside.</p>
<p>For rocky planets around M-dwarfs (red dwarfs), strong stellar flares and a lack of a magnetosphere pose additional threats to atmospheric retention.</p>

:::callout{type="exercise"}
Compare Earth and Venus: both are in or near the Sun's habitable zone, but Venus's CO₂-dominated atmosphere creates a 735 K surface temperature. Mars's thin atmosphere results in −60 °C average. Atmosphere is destiny.
:::

:::quiz
question: Why is a strong planetary magnetic field important for habitability?
options: ["It generates heat for the planet's interior","It deflects charged particles from stellar winds that would strip the atmosphere","It creates the aurora borealis","It keeps the planet's orbit stable"]
correct: 1
explanation: Stellar winds — streams of charged particles — can gradually erode an atmosphere. Earth's magnetosphere deflects most of these particles. Mars lost its magnetic field ~4 Gyr ago and subsequently lost most of its atmosphere.
:::`,
        },
      ];

      for (const l of atmLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({
          id: l.id, slug: l.slug, title: l.title, module_id: modAtm.id,
          order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
          status: "published",
        }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
      }
    }

    // ── A2: Variable Stars & Binary Systems (under stars) ─────────
    if (subjectMap["stars"]) {
      const { data: courseVar, error: courseVarErr } = await adminClient
        .from("courses")
        .upsert({
          id: "variable-stars",
          title: "Variable Stars & Binary Systems",
          slug: "variable-stars",
          description: "Explore pulsating Cepheids, eclipsing binaries, and the cosmic distance ladder they underpin.",
          subject_id: subjectMap["stars"],
          level_tag: ["intermediate"],
          estimated_hours: 4,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (courseVarErr) throw new Error("courses variable-stars: " + courseVarErr.message);

      const { data: modVar, error: modVarErr } = await adminClient
        .from("modules")
        .upsert({ course_id: courseVar.id, title: "Stars That Change", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (modVarErr) throw new Error("module var: " + modVarErr.message);

      const varLessons = [
        {
          id: "var-cepheids",
          slug: "cepheids",
          title: "Cepheid Variables — The Cosmic Ruler",
          order: 1,
          xp_reward: 75,
          content_mdx: `<h2>Pulsating Standards</h2>
<p>Cepheid variables are giant yellow stars that pulsate with clock-like precision. Henrietta Swan Leavitt discovered in 1908 that their period of pulsation correlates directly with their intrinsic luminosity.</p>
<p>This Period-Luminosity relation allows astronomers to measure distances to other galaxies by observing a Cepheid's period and comparing its apparent brightness to its known true brightness.</p>

:::callout{type="formula"}
Leavitt's Law: log(L/L☉) ≈ 1.15 × log(P/days) + 2.47 · Cepheids have periods 1–100 days and are 1,000–30,000× more luminous than the Sun.
:::

:::interactive
type: cepheid
:::

:::quiz
question: What is the key physical property that makes Cepheids useful as "standard candles"?
options: ["They are always the same colour","Their pulsation period directly reveals their intrinsic luminosity","They only exist in our galaxy","They don't change in brightness"]
correct: 1
explanation: The Period-Luminosity relation (Leavitt's Law) means that by measuring how long a Cepheid takes to pulsate, astronomers know its true luminosity. Comparing this to its apparent brightness gives the distance via the inverse-square law.
:::`,
        },
        {
          id: "var-eclipsing-binary",
          slug: "eclipsing-binaries",
          title: "Eclipsing Binaries — Weighing the Stars",
          order: 2,
          xp_reward: 75,
          content_mdx: `<h2>Two Stars, One Light Curve</h2>
<p>When two stars orbit each other and we see the system nearly edge-on, each star periodically passes in front of the other, causing dips in the combined brightness. These eclipsing binaries are nature's most precise stellar scales.</p>
<p>From the light curve shape, depth, and duration — combined with radial velocity measurements — astronomers can calculate stellar masses, radii, and temperatures with extraordinary precision.</p>

:::callout{type="key"}
Primary minimum: the hotter (brighter) star is eclipsed → deeper dip. Secondary minimum: the cooler star is eclipsed → shallower dip. The ratio of depths gives the ratio of surface temperatures.
:::

:::interactive
type: eclipsing-binary
:::

:::quiz
question: Why is the primary minimum in an eclipsing binary light curve deeper than the secondary minimum?
options: ["The primary star is always larger","When the hotter star is eclipsed, more total light is lost","The primary eclipse lasts longer","The two stars are at different distances from Earth"]
correct: 1
explanation: The depth of an eclipse is proportional to the flux of the star being eclipsed. When the hotter, more luminous star is behind its companion (primary eclipse), more total light is blocked, producing a deeper dip.
:::`,
        },
        {
          id: "var-distance-ladder",
          slug: "distance-ladder",
          title: "The Cosmic Distance Ladder",
          order: 3,
          xp_reward: 100,
          content_mdx: `<h2>Building a Universe-Wide Ruler</h2>
<p>No single method can measure all cosmic distances. Instead, astronomers use overlapping techniques, each calibrated by the previous: parallax → main sequence fitting → Cepheids → Type Ia supernovae → Hubble flow.</p>
<p>Each "rung" extends our reach: parallax to ~10 kpc, Cepheids to ~50 Mpc, SNe Ia to ~1000 Mpc (z ~ 0.3), and Hubble flow for anything beyond.</p>

:::callout{type="note"}
The Hubble tension: measurements using the early universe (CMB, Planck) give H₀ ≈ 67.4 km/s/Mpc. Measurements using the late universe distance ladder give H₀ ≈ 73 km/s/Mpc. This 5σ discrepancy may indicate new physics.
:::

:::quiz
question: What is the "Hubble Tension"?
options: ["The stretching of light by the expanding universe","A disagreement between two independent H₀ measurements","The tension in space caused by dark energy","The difficulty of observing at high redshift"]
correct: 1
explanation: The Hubble constant H₀ measured from the CMB (early universe) and from Cepheid/SNe Ia (late universe) disagree by ~9%. This >5σ tension is one of the most significant open problems in cosmology and may signal new physics beyond ΛCDM.
:::`,
        },
      ];

      for (const l of varLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({
          id: l.id, slug: l.slug, title: l.title, module_id: modVar.id,
          order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
          status: "published",
        }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
      }
    }

    // ── A3: Moons of the Solar System (under solar-system) ─────────
    if (subjectMap["solar-system"]) {
      const { data: courseMoons, error: courseMoonsErr } = await adminClient
        .from("courses")
        .upsert({
          id: "moons-solar-system",
          title: "Moons of the Solar System",
          slug: "moons-solar-system",
          description: "Explore Europa's subsurface ocean, Titan's methane lakes, and Io's volcanic fury — the most geologically active worlds in the solar system.",
          subject_id: subjectMap["solar-system"],
          level_tag: ["intermediate"],
          estimated_hours: 4,
          status: "published",
          difficulty: "intermediate",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (courseMoonsErr) throw new Error("courses moons: " + courseMoonsErr.message);

      const { data: modMoons, error: modMoonsErr } = await adminClient
        .from("modules")
        .upsert({ course_id: courseMoons.id, title: "Ocean Worlds & Volcanic Moons", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (modMoonsErr) throw new Error("module moons: " + modMoonsErr.message);

      const moonLessons = [
        {
          id: "moons-europa",
          slug: "europa-ocean-world",
          title: "Europa — Ocean World Under Ice",
          order: 1,
          xp_reward: 75,
          content_mdx: `<h2>An Ocean in Deep Freeze</h2>
<p>Europa, Jupiter's fourth-largest moon, is covered by a globally smooth ice shell approximately 10–30 km thick. Beneath lies a liquid water ocean estimated to be 60–150 km deep — containing more water than all of Earth's oceans combined.</p>
<p>The energy source is tidal heating: Jupiter's gravity flexes Europa's interior as it orbits in a slightly elliptical orbit. This friction generates enough heat to keep the ocean liquid despite temperatures of −160 °C at the surface.</p>

:::callout{type="key"}
Tidal power ∝ e² × M★² / r⁶, where e is orbital eccentricity, M★ is the planet mass, and r is orbital radius. Even tiny eccentricities produce enormous tidal heating.
:::

:::interactive
type: tidal-heating
:::

:::quiz
question: What maintains Europa's subsurface liquid ocean despite being so far from the Sun?
options: ["Radioactive decay of heavy elements","Tidal heating from Jupiter's gravitational pull","Hydrothermal vents from the core","Residual heat from solar system formation"]
correct: 1
explanation: Europa's slightly elliptical orbit (eccentricity e=0.009, maintained by orbital resonance with Io and Ganymede) causes Jupiter's tidal forces to continuously deform its interior. This friction generates heat — enough to maintain a liquid water ocean beneath the ice.
:::`,
        },
        {
          id: "moons-titan",
          slug: "titan-methane-world",
          title: "Titan — A World with Rivers and Rain",
          order: 2,
          xp_reward: 75,
          content_mdx: `<h2>Saturn's Hazy Sibling</h2>
<p>Titan is the only moon in the solar system with a dense atmosphere (1.5× Earth's surface pressure) and the only world besides Earth with stable liquid on its surface — but it's liquid methane, not water. Methane rains from orange clouds, fills lakes, and carves river channels.</p>
<p>The Cassini-Huygens mission (2004–2017) mapped Titan's surface and atmosphere, revealing seas of liquid methane/ethane near the poles and vast dune fields of organic "sand" near the equator.</p>

:::callout{type="note"}
The Dragonfly mission (NASA, launching 2028, arriving 2034) will send a nuclear-powered rotorcraft to hop across Titan's surface, studying prebiotic chemistry in methane lakes and dunes.
:::

:::quiz
question: What is the liquid on Titan's surface composed of?
options: ["Water (H₂O)","Liquid nitrogen","Liquid methane and ethane (CH₄/C₂H₆)","Sulphuric acid"]
correct: 2
explanation: At Titan's surface temperature of −179 °C, methane and ethane are liquid. These form rivers, rain, and lakes in a "hydrological cycle" analogous to Earth's water cycle but driven by methane instead.
:::`,
        },
        {
          id: "moons-io",
          slug: "io-volcanic-moon",
          title: "Io — The Solar System's Most Volcanic World",
          order: 3,
          xp_reward: 75,
          content_mdx: `<h2>A Moon on Fire</h2>
<p>Io, Jupiter's innermost large moon, is the most volcanically active body in the solar system — with over 400 active volcanoes erupting simultaneously at any given time. Loki Patera, a lava lake the size of Lake Ontario, cycles eruptions every 420–540 days.</p>
<p>Like Europa, Io is tidally heated — but far more intensely due to its closer orbit and larger eccentricity forced by the Laplace resonance (Io:Europa:Ganymede = 1:2:4 orbital periods).</p>

:::callout{type="key"}
Io's tidal heating is so intense that the entire lithosphere is recycled through volcanism on timescales of millions of years — meaning Io has no impact craters despite 4.5 Gyr of bombardment.
:::

:::quiz
question: Why doesn't Io have any impact craters despite being 4.5 billion years old?
options: ["Jupiter's gravity deflects all incoming impactors","Its atmosphere burns up asteroids","Continuous volcanic activity resurfaces it too quickly for craters to survive","It is too small to retain craters"]
correct: 2
explanation: Io's global volcanic resurfacing rate is so high (estimated 1–3 cm of new surface per year) that any impact crater is quickly buried under fresh lava flows and sulphur deposits, leaving no ancient craters visible today.
:::`,
        },
      ];

      for (const l of moonLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({
          id: l.id, slug: l.slug, title: l.title, module_id: modMoons.id,
          order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
          status: "published",
        }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
      }
    }

    // ── A4: Relativity & Spacetime (under black-holes) ─────────────
    if (subjectMap["black-holes"]) {
      const { data: courseRel, error: courseRelErr } = await adminClient
        .from("courses")
        .upsert({
          id: "relativity-spacetime",
          title: "Relativity & Spacetime",
          slug: "relativity-spacetime",
          description: "Master Einstein's special and general relativity — time dilation, curved spacetime, and how mass shapes the universe.",
          subject_id: subjectMap["black-holes"],
          level_tag: ["advanced"],
          estimated_hours: 5,
          status: "published",
          difficulty: "advanced",
          order_index: 2,
          is_public: true,
        }, { onConflict: "id" })
        .select().single();
      if (courseRelErr) throw new Error("courses relativity: " + courseRelErr.message);

      const { data: modRel, error: modRelErr } = await adminClient
        .from("modules")
        .upsert({ course_id: courseRel.id, title: "Bending Space and Time", order: 1 }, { onConflict: "course_id,order" })
        .select().single();
      if (modRelErr) throw new Error("module rel: " + modRelErr.message);

      const relLessons = [
        {
          id: "rel-time-dilation",
          slug: "time-dilation",
          title: "Moving Clocks Run Slow — Special Relativity",
          order: 1,
          xp_reward: 75,
          content_mdx: `<h2>The Postulates of Special Relativity</h2>
<p>Einstein's 1905 paper rested on two postulates: (1) The laws of physics are identical in all inertial frames, and (2) The speed of light in vacuum is the same for all observers, regardless of the motion of the source.</p>
<p>These simple postulates lead to startling consequences: moving clocks tick slower (time dilation), moving objects contract along the direction of motion (length contraction), and mass and energy are equivalent (E = mc²).</p>

:::callout{type="formula"}
Time dilation: Δτ = Δt / γ, where γ = 1/√(1−v²/c²) is the Lorentz factor. At v = 0.866c, γ = 2 — the moving clock runs at half speed.
:::

:::interactive
type: time-dilation
:::

:::quiz
question: An astronaut travels at v = 0.6c for 10 years of Earth time. How much does the astronaut age?
options: ["10 years (same as Earth)","8 years","6 years — γ = 1.25 so τ = 10/1.25","2 years"]
correct: 2
explanation: γ = 1/√(1−0.36) = 1/√0.64 = 1/0.8 = 1.25. Proper time τ = Δt/γ = 10/1.25 = 8 years. The astronaut ages 8 years while 10 years pass on Earth. (Answer B is correct — 8 years.)
:::`,
        },
        {
          id: "rel-curved-spacetime",
          slug: "curved-spacetime",
          title: "Mass Warps Spacetime — General Relativity",
          order: 2,
          xp_reward: 100,
          content_mdx: `<h2>Gravity as Geometry</h2>
<p>Newton described gravity as a force; Einstein reimagined it as the curvature of 4-dimensional spacetime. Mass and energy warp the spacetime fabric, and objects follow the straightest possible paths (geodesics) through that curved geometry.</p>
<p>Einstein's field equations G_μν = 8πT_μν relate the curvature of spacetime (left side) to the distribution of mass-energy (right side). They predict gravitational lensing, time dilation near massive objects, and the existence of black holes.</p>

:::callout{type="key"}
GPS satellites experience two relativistic effects: they run faster due to being higher in Earth's gravitational field (+45 μs/day) and slower due to their orbital velocity (−7 μs/day). The net effect (+38 μs/day) must be corrected for GPS to work.
:::

:::interactive
type: spacetime-curvature
:::

:::quiz
question: How does general relativity describe gravity, in contrast to Newton's theory?
options: ["As a force transmitted by gravitons","As the curvature of 4D spacetime caused by mass-energy","As a property of electric charge","As a quantum mechanical effect"]
correct: 1
explanation: General relativity replaces Newton's "force at a distance" with the concept of curved spacetime. Mass-energy warps the spacetime manifold, and objects follow geodesics (straightest paths) through this curved geometry — what we perceive as gravitational attraction.
:::`,
        },
        {
          id: "rel-tests-predictions",
          slug: "tests-and-predictions",
          title: "Testing General Relativity",
          order: 3,
          xp_reward: 75,
          content_mdx: `<h2>From Mercury's Orbit to LIGO</h2>
<p>GR made three immediate, testable predictions that Newtonian gravity failed to explain: (1) the anomalous precession of Mercury's perihelion (43 arcsec/century), (2) the deflection of light by the Sun (1.75 arcsec), confirmed by Eddington's 1919 eclipse expedition, and (3) gravitational redshift.</p>
<p>Modern tests include Shapiro delay, gravitational wave detection (LIGO, 2015), the Event Horizon Telescope image of M87* (2019) and Sgr A* (2022), and pulsar timing arrays detecting a stochastic gravitational wave background (2023).</p>

:::callout{type="note"}
LIGO's first detection (GW150914, September 2015) measured a spacetime strain of h = ΔL/L = 10⁻²¹ — equivalent to measuring the distance to the nearest star to the precision of an atom's width.
:::

:::quiz
question: What was significant about Eddington's 1919 solar eclipse expedition?
options: ["It discovered the first exoplanet","It confirmed that gravity bends light, as predicted by general relativity","It measured the speed of light for the first time","It proved the Earth orbits the Sun"]
correct: 1
explanation: During the 1919 eclipse, stars near the Sun's disc appeared shifted from their true positions by 1.75 arcseconds — exactly the value GR predicted. This confirmed that the Sun's gravity deflects light, making Einstein world-famous overnight.
:::`,
        },
      ];

      for (const l of relLessons) {
        const { error: le } = await adminClient.from("lessons").upsert({
          id: l.id, slug: l.slug, title: l.title, module_id: modRel.id,
          order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
          status: "published",
        }, { onConflict: "id" });
        if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // OPTION B — Four entirely new subjects
    // ════════════════════════════════════════════════════════════════

    // ── B1: Cosmology ──────────────────────────────────────────────
    const { data: subCosmo, error: subCosmoErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Cosmology",
        slug: "cosmology",
        icon_name: "🌌",
        description: "The origin, evolution, and ultimate fate of the universe — from the Big Bang to dark energy.",
        color: "#bc8cff",
        order: 5,
      }, { onConflict: "slug" })
      .select().single();
    if (subCosmoErr) throw new Error("subjects cosmology: " + subCosmoErr.message);

    const { data: courseBigBang, error: courseBigBangErr } = await adminClient
      .from("courses")
      .upsert({
        id: "big-bang-beyond",
        title: "The Big Bang & Beyond",
        slug: "big-bang-beyond",
        description: "Trace the universe's history from the first fraction of a second to its far future — inflation, nucleosynthesis, recombination, and the accelerating expansion.",
        subject_id: subCosmo.id,
        level_tag: ["intermediate", "advanced"],
        estimated_hours: 6,
        status: "published",
        difficulty: "intermediate",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select().single();
    if (courseBigBangErr) throw new Error("courses big-bang: " + courseBigBangErr.message);

    const { data: modCosmo, error: modCosmoErr } = await adminClient
      .from("modules")
      .upsert({ course_id: courseBigBang.id, title: "From Nothing to Everything", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (modCosmoErr) throw new Error("module cosmo: " + modCosmoErr.message);

    const cosmoLessons = [
      {
        id: "cosmo-expanding-universe",
        slug: "expanding-universe",
        title: "The Expanding Universe",
        order: 1,
        xp_reward: 50,
        content_mdx: `<h2>Hubble's Discovery</h2>
<p>In 1929, Edwin Hubble announced that distant galaxies are receding from us at speeds proportional to their distance: v = H₀d. This is not galaxies moving through space, but space itself expanding — stretching the wavelengths of light (redshift) as photons travel.</p>
<p>Running the expansion backwards in time implies that all matter originated from an extremely hot, dense state approximately 13.8 billion years ago: the Big Bang.</p>

:::callout{type="formula"}
Hubble's Law: v = H₀ × d · H₀ = 70 km/s/Mpc (Planck value 67.4; distance ladder value 73.0). The Hubble time t_H = 1/H₀ ≈ 14 Gyr — a rough estimate of the universe's age.
:::

:::interactive
type: cosmic-expansion
:::

:::quiz
question: What does Hubble's Law v = H₀d tell us about the universe?
options: ["Galaxies are moving through space away from us","The universe is expanding — space itself stretches between galaxies","Only the Milky Way is at the centre of the universe","Gravity has reversed direction"]
correct: 1
explanation: Hubble's Law reveals cosmological expansion: space itself is stretching. Every galaxy recedes from every other galaxy, with velocity proportional to distance. There is no "centre" — every point sees all others receding, like raisins in rising bread dough.
:::`,
      },
      {
        id: "cosmo-cmb",
        slug: "cosmic-microwave-background",
        title: "The CMB — Echo of the Big Bang",
        order: 2,
        xp_reward: 75,
        content_mdx: `<h2>The Oldest Light</h2>
<p>The Cosmic Microwave Background (CMB) is thermal radiation left over from when the universe was 380,000 years old. Before this "recombination" epoch, the universe was an opaque plasma. When electrons combined with protons to form neutral hydrogen, photons could travel freely for the first time — and we see those photons today, cooled to 2.725 K.</p>
<p>The CMB is nearly perfectly uniform, but tiny temperature fluctuations (ΔT/T ~ 10⁻⁵) seeded by quantum fluctuations during inflation grew into all galaxies, clusters, and cosmic structure we see today.</p>

:::callout{type="key"}
The CMB acoustic peaks encode the baryon-to-photon ratio, the geometry of the universe, and the dark matter density. The first peak at l ~ 200 indicates a spatially flat universe.
:::

:::interactive
type: cmb
:::

:::quiz
question: What caused the temperature fluctuations we see in the CMB?
options: ["Hot and cold regions of gas at recombination","Quantum fluctuations amplified by inflation in the first 10⁻³² seconds","Gravitational waves from the Big Bang","The Milky Way's emission contaminating the signal"]
correct: 1
explanation: During inflation (the rapid exponential expansion in the first ~10⁻³² seconds), quantum vacuum fluctuations were stretched to macroscopic scales. These density perturbations evolved into acoustic oscillations of the baryon-photon plasma, which are imprinted in the CMB as temperature fluctuations of ΔT/T ≈ 10⁻⁵.
:::`,
      },
      {
        id: "cosmo-dark-energy",
        slug: "dark-energy",
        title: "Dark Energy — The Accelerating Universe",
        order: 3,
        xp_reward: 100,
        content_mdx: `<h2>Einstein's "Biggest Blunder" Returns</h2>
<p>In 1917 Einstein introduced a cosmological constant Λ into his equations to allow a static universe. When Hubble proved the universe expands, Einstein called Λ his "biggest blunder." But in 1998, Type Ia supernovae revealed the expansion is accelerating — requiring exactly this kind of Λ (dark energy).</p>
<p>Dark energy constitutes ~68% of the universe's energy content, yet its nature remains unknown. The simplest model — vacuum energy — predicts 10¹²⁰ times more energy than observed (the worst prediction in physics). Alternative models include dynamical dark energy (quintessence) and modified gravity.</p>

:::callout{type="key"}
The equation of state parameter w = P/(ρc²). Cosmological constant: w = −1 exactly. DESI 2024 results hint at w ≠ −1, suggesting dynamical dark energy — one of the most important open questions in physics.
:::

:::interactive
type: dark-energy
:::

:::quiz
question: What did the 1998 Type Ia supernova surveys discover about the universe?
options: ["The universe is older than 20 billion years","The expansion of the universe is accelerating, driven by dark energy","The Hubble constant is zero — the universe is static","Supernova explosions are creating new dark matter"]
correct: 1
explanation: Saul Perlmutter, Brian Schmidt, and Adam Riess (Nobel Prize 2011) found that distant Type Ia supernovae appeared ~25% fainter than expected for a decelerating universe. This meant they were further away than predicted — the expansion is speeding up, driven by a mysterious dark energy.
:::`,
      },
      {
        id: "cosmo-fate",
        slug: "fate-of-the-universe",
        title: "The Fate of the Universe",
        order: 4,
        xp_reward: 100,
        content_mdx: `<h2>How Does It End?</h2>
<p>The universe's ultimate fate depends on the dark energy equation of state. If Λ is constant (w = −1), the universe expands forever: galaxies move beyond each other's horizons, stars burn out, black holes evaporate via Hawking radiation, and eventually even protons may decay — the "Heat Death."</p>
<p>If dark energy strengthens (w < −1, "phantom energy"), the Big Rip tears apart galaxies, then solar systems, planets, atoms, and finally spacetime itself in ~22 billion years.</p>

:::callout{type="note"}
Timescales: last star formation ~10¹⁴ yr, stellar black holes evaporate ~10⁶⁷ yr, supermassive black holes ~10⁹⁸ yr, proton decay (if it occurs) ~10³⁴ yr. The universe has barely begun.
:::

:::quiz
question: What is the "Heat Death" of the universe?
options: ["The Sun expanding into a red giant and burning Earth","The universe reaching maximum entropy with no free energy for work","A Big Crunch collapse into infinite density","All stars becoming neutron stars simultaneously"]
correct: 1
explanation: In the Heat Death scenario, the universe reaches thermodynamic equilibrium: maximum entropy. All black holes have evaporated, all particles have decayed to their most stable forms (photons and leptons), and no temperature gradients remain to drive any physical processes. Time effectively becomes meaningless.
:::`,
      },
    ];

    for (const l of cosmoLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({
        id: l.id, slug: l.slug, title: l.title, module_id: modCosmo.id,
        order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
        status: "published",
      }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
    }

    // ── B2: Galaxies ───────────────────────────────────────────────
    const { data: subGal, error: subGalErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Galaxies",
        slug: "galaxies",
        icon_name: "🌀",
        description: "From the Milky Way to the most distant quasars — the architecture of the cosmos.",
        color: "#f7cc4a",
        order: 6,
      }, { onConflict: "slug" })
      .select().single();
    if (subGalErr) throw new Error("subjects galaxies: " + subGalErr.message);

    const { data: courseGal, error: courseGalErr } = await adminClient
      .from("courses")
      .upsert({
        id: "milky-way-beyond",
        title: "The Milky Way & Beyond",
        slug: "milky-way-beyond",
        description: "Navigate our home galaxy, explore galaxy morphology, and discover how dark matter shapes the universe on the largest scales.",
        subject_id: subGal.id,
        level_tag: ["beginner", "intermediate"],
        estimated_hours: 5,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select().single();
    if (courseGalErr) throw new Error("courses galaxies: " + courseGalErr.message);

    const { data: modGal, error: modGalErr } = await adminClient
      .from("modules")
      .upsert({ course_id: courseGal.id, title: "Islands in the Cosmos", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (modGalErr) throw new Error("module gal: " + modGalErr.message);

    const galLessons = [
      {
        id: "gal-milky-way",
        slug: "our-milky-way",
        title: "Our Galaxy — The Milky Way",
        order: 1,
        xp_reward: 50,
        content_mdx: `<h2>Home Galaxy</h2>
<p>The Milky Way is a barred spiral galaxy (type SBbc) containing 200–400 billion stars, with a diameter of ~100,000 light-years. Our Solar System sits ~26,000 light-years from the centre, in the Orion Arm — a minor spiral arm between the Sagittarius and Perseus arms.</p>
<p>The galactic centre hosts Sagittarius A* — a supermassive black hole of 4 million solar masses, confirmed by the Event Horizon Telescope in 2022.</p>

:::callout{type="note"}
The Milky Way is part of the Local Group (>80 galaxies), within the Virgo Supercluster, within the Laniakea Supercluster (500 Mpc, 10¹⁷ M☉). The observable universe contains ~2 trillion galaxies.
:::

:::quiz
question: Where in the Milky Way is our Solar System located?
options: ["At the galactic centre near Sgr A*","In the Orion Arm, about 26,000 light-years from the centre","At the outer edge of the galactic disc","In one of the galactic halo globular clusters"]
correct: 1
explanation: The Solar System is located in the Orion Arm (also called the Orion Spur), a minor spiral arm of the Milky Way. We are approximately 26,000 light-years from the galactic centre — a comfortable distance from the dense, radiation-intense central region.
:::`,
      },
      {
        id: "gal-morphology",
        slug: "galaxy-morphology",
        title: "The Hubble Sequence — Galaxy Shapes",
        order: 2,
        xp_reward: 75,
        content_mdx: `<h2>Why Do Galaxies Look So Different?</h2>
<p>Edwin Hubble classified galaxies in 1926 into a "tuning fork" diagram: ellipticals (E0–E7) at the handle, and spirals (Sa–Sc) and barred spirals (SBa–SBc) along two prongs, with lenticulars (S0) at the junction. Irregular galaxies don't fit the scheme.</p>
<p>Galaxy morphology correlates with star formation rate, gas content, and environment. Dense cluster environments favour ellipticals (red, "dead") via ram-pressure stripping and mergers; isolated field galaxies are more likely to be blue spirals.</p>

:::callout{type="key"}
Colour indicates stellar population age: blue galaxies have active star formation (hot O/B stars); red/orange galaxies are "quenched" — dominated by old cool stars. The "green valley" marks the transition.
:::

:::interactive
type: galaxy-morphology
:::

:::quiz
question: What causes most elliptical galaxies to have little star formation?
options: ["They have no gas at all","They are too cold for star formation","Their gas has been used up or stripped away, quenching star formation","Elliptical galaxies rotate too fast for stars to form"]
correct: 2
explanation: Elliptical galaxies form primarily through mergers of spiral galaxies. During major mergers, gas is consumed in starbursts or expelled by AGN feedback. Without cold gas, new stars cannot form — the galaxy "quenches" and its stellar population ages to a red, old state.
:::`,
      },
      {
        id: "gal-dark-matter",
        slug: "dark-matter-rotation-curves",
        title: "Dark Matter — The Invisible Scaffolding",
        order: 3,
        xp_reward: 100,
        content_mdx: `<h2>The Missing Mass Problem</h2>
<p>In the 1970s, Vera Rubin and Kent Ford measured rotation curves of spiral galaxies: the orbital velocities of stars vs. their distance from the galactic centre. Instead of falling off like a Keplerian orbit (v ∝ 1/√r) at large radii, the curves remained flat or even rose slightly — indicating far more mass than visible stars and gas.</p>
<p>This "missing mass" — dark matter — must extend in a spherical halo far beyond the visible disc, contributing ~85% of the total mass. It interacts only via gravity (and possibly weak nuclear force) and remains undetected in direct laboratory experiments.</p>

:::callout{type="key"}
Additional evidence for dark matter: gravitational lensing (galaxy clusters bend light from background galaxies far more than visible mass predicts), the Bullet Cluster (mass distribution separates from hot gas during cluster collision), and structure formation in the CMB.
:::

:::interactive
type: galaxy-rotation
:::

:::quiz
question: What does a "flat" galaxy rotation curve imply?
options: ["The galaxy is not rotating","The galaxy has equal amounts of dark and visible matter at all radii","There is more mass at large radii than visible matter alone can account for","The rotation curve measurement is incorrect"]
correct: 2
explanation: Kepler's third law predicts v ∝ 1/√r for orbits beyond the bulk of the mass. A flat curve (v = const) implies M(r) ∝ r — mass continues to increase with radius even where no stars are visible. This unseen mass is the dark matter halo.
:::`,
      },
      {
        id: "gal-active-galactic-nuclei",
        slug: "active-galactic-nuclei",
        title: "Quasars & Active Galactic Nuclei",
        order: 4,
        xp_reward: 100,
        content_mdx: `<h2>The Most Luminous Objects in the Universe</h2>
<p>Active Galactic Nuclei (AGN) are powered by material spiralling into a supermassive black hole (SMBH) — masses of 10⁶ to 10¹⁰ M☉. As matter falls through the accretion disc, gravitational potential energy converts to radiation with up to 40% efficiency (nuclear fusion achieves only 0.7%).</p>
<p>Quasars are the most luminous AGN — visible across 90% of the observable universe. The most distant known (z ~ 7.6) existed when the universe was only 700 million years old, presenting a puzzle: how did billion-solar-mass black holes form so quickly?</p>

:::callout{type="key"}
AGN Unification Model: the same central engine (SMBH + accretion disc + jets) appears differently depending on viewing angle. Face-on → Seyfert 1 / blazar. Edge-on through torus → Seyfert 2. High power → quasar.
:::

:::quiz
question: What powers quasars to be so extraordinarily luminous?
options: ["Nuclear fusion reactions far more efficient than in stars","Matter falling into a supermassive black hole via an accretion disc","A chain reaction of supernovae exploding simultaneously","Extremely rapid star formation in a compact region"]
correct: 1
explanation: Accretion onto a supermassive black hole converts gravitational potential energy to radiation with up to ~40% efficiency — far exceeding the ~0.7% of nuclear fusion. A quasar can emit 1000× the energy of an entire Milky Way from a region the size of our solar system.
:::`,
      },
    ];

    for (const l of galLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({
        id: l.id, slug: l.slug, title: l.title, module_id: modGal.id,
        order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
        status: "published",
      }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
    }

    // ── B3: Observational Astronomy ────────────────────────────────
    const { data: subObs, error: subObsErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Observational Astronomy",
        slug: "observational-astronomy",
        icon_name: "🔭",
        description: "Learn how astronomers observe the universe — telescopes, detectors, and the full electromagnetic spectrum.",
        color: "#58a6ff",
        order: 7,
      }, { onConflict: "slug" })
      .select().single();
    if (subObsErr) throw new Error("subjects obs: " + subObsErr.message);

    const { data: courseObs, error: courseObsErr } = await adminClient
      .from("courses")
      .upsert({
        id: "how-we-see-universe",
        title: "How We See the Universe",
        slug: "how-we-see-universe",
        description: "From optical telescopes to radio arrays and space observatories — the instruments that revealed the cosmos.",
        subject_id: subObs.id,
        level_tag: ["beginner"],
        estimated_hours: 4,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select().single();
    if (courseObsErr) throw new Error("courses obs: " + courseObsErr.message);

    const { data: modObs, error: modObsErr } = await adminClient
      .from("modules")
      .upsert({ course_id: courseObs.id, title: "Light, Telescopes & Detectors", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (modObsErr) throw new Error("module obs: " + modObsErr.message);

    const obsLessons = [
      {
        id: "obs-em-spectrum",
        slug: "electromagnetic-spectrum",
        title: "The Electromagnetic Spectrum",
        order: 1,
        xp_reward: 50,
        content_mdx: `<h2>All the Colours of the Universe</h2>
<p>Visible light — the sliver of the EM spectrum detectable by human eyes — spans 400–700 nm. But the universe radiates across 20 orders of magnitude in wavelength: radio waves metres long, microwaves (where the CMB shines), infrared, visible, ultraviolet, X-rays, and gamma rays down to 10⁻¹⁴ m.</p>
<p>Each band reveals different physical processes and objects: radio: synchrotron radiation, cold hydrogen; X-ray: hot gas, neutron stars; gamma: nuclear reactions, GRBs. A complete picture of the cosmos requires all wavelengths.</p>

:::interactive
type: em-spectrum
:::

:::quiz
question: Why do astronomers need telescopes at many different wavelengths?
options: ["Optical telescopes are expensive and scientists prefer radio telescopes","Different physical processes emit at different wavelengths — no single band shows everything","The atmosphere blocks all wavelengths equally","Different wavelengths travel at different speeds through space"]
correct: 1
explanation: A star's chromosphere glows in UV, its corona in X-rays, its photosphere in visible light, and the surrounding dust cloud in infrared. A galaxy cluster contains hot intracluster gas (X-ray), cool molecular clouds (radio/mm), and stars (optical/infrared). Multiwavelength astronomy reveals the full physics.
:::`,
      },
      {
        id: "obs-telescope-optics",
        slug: "telescope-optics",
        title: "How Telescopes Work",
        order: 2,
        xp_reward: 75,
        content_mdx: `<h2>Gathering Light from the Cosmos</h2>
<p>A telescope's primary purpose is not magnification but light collection. The larger the aperture (objective lens or primary mirror diameter), the more photons collected per second, enabling detection of fainter, more distant objects. The Rayleigh criterion θ = 1.22λ/D sets the diffraction-limited angular resolution.</p>
<p>Modern observatories use giant segmented mirrors (ELT: 39 m, GMT: 24 m), adaptive optics to correct atmospheric turbulence, and charge-coupled devices (CCDs) achieving >90% quantum efficiency as detectors.</p>

:::callout{type="formula"}
Light gathering power ∝ D². A 4-metre telescope collects 4× more light than a 2-metre. Resolution scales as θ ∝ λ/D — larger aperture or shorter wavelength gives sharper images.
:::

:::interactive
type: telescope-optics
:::

:::quiz
question: Why do radio telescopes need to be much larger than optical telescopes to achieve the same angular resolution?
options: ["Radio waves travel slower than light","Radio waves are invisible so more are needed","Resolution θ = 1.22λ/D — radio wavelengths are ~10⁷× longer, requiring proportionally larger apertures","Radio telescopes are less efficient at collecting photons"]
correct: 2
explanation: The Rayleigh criterion θ = 1.22λ/D means that to achieve the same resolution as a 10-cm optical telescope at 500 nm, a radio telescope at 21 cm (HI line) needs D = 0.1 m × (0.21/500e-9) ≈ 42 km aperture. This is why radio astronomers use interferometric arrays spanning continents (VLBI).
:::`,
      },
      {
        id: "obs-space-telescopes",
        slug: "space-telescopes",
        title: "Above the Atmosphere — Space Observatories",
        order: 3,
        xp_reward: 75,
        content_mdx: `<h2>Why Go to Space?</h2>
<p>Earth's atmosphere blocks most of the EM spectrum: only optical/near-IR windows and radio windows reach the ground. Gamma, X-ray, far-UV, and far-infrared require space-based observatories. Even for optical astronomy, turbulence degrades resolution to ~1 arcsecond — space gives the diffraction limit.</p>
<p>Key space observatories: HST (optical/UV, 1990–present), Chandra (X-ray), XMM-Newton, Fermi (gamma), Spitzer/Herschel (infrared), Planck (CMB), and the transformational JWST (near/mid-IR, 2021–present).</p>

:::callout{type="note"}
JWST sits at the Sun-Earth L2 Lagrange point, 1.5 million km from Earth. Its 6.5-metre mirror, 18 hexagonal gold-coated beryllium segments, and 5-layer sunshield (the size of a tennis court) allow it to cool to 40 K — essential for mid-infrared sensitivity.
:::

:::quiz
question: Why is JWST optimised for infrared rather than visible light?
options: ["Infrared is cheaper to detect than visible light","The most distant galaxies are redshifted into the infrared, and cold objects (planets, dust) emit there","JWST's mirror can only reflect infrared wavelengths","Infrared is not blocked by Earth's atmosphere so no space telescope is needed for visible"]
correct: 1
explanation: Two reasons: (1) Distant galaxies (z > 2) have their visible-light emission cosmologically redshifted into the near-infrared, making them invisible to optical telescopes but bright to JWST. (2) Cold objects — planet-forming discs, brown dwarfs, exoplanet atmospheres — peak in mid-infrared emission.
:::`,
      },
    ];

    for (const l of obsLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({
        id: l.id, slug: l.slug, title: l.title, module_id: modObs.id,
        order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
        status: "published",
      }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
    }

    // ── B4: Astrobiology ───────────────────────────────────────────
    const { data: subAstro, error: subAstroErr } = await adminClient
      .from("subjects")
      .upsert({
        title: "Astrobiology",
        slug: "astrobiology",
        icon_name: "👽",
        description: "The science of life in the universe — from extreme life on Earth to the search for intelligent civilisations.",
        color: "#3fb950",
        order: 8,
      }, { onConflict: "slug" })
      .select().single();
    if (subAstroErr) throw new Error("subjects astrobiology: " + subAstroErr.message);

    const { data: courseLife, error: courseLifeErr } = await adminClient
      .from("courses")
      .upsert({
        id: "life-in-universe",
        title: "Is Anyone Out There?",
        slug: "life-in-universe",
        description: "Explore the conditions for life, the Drake equation, the Fermi paradox, and SETI — humanity's search for a second genesis.",
        subject_id: subAstro.id,
        level_tag: ["beginner", "intermediate"],
        estimated_hours: 5,
        status: "published",
        difficulty: "beginner",
        order_index: 1,
        is_public: true,
      }, { onConflict: "id" })
      .select().single();
    if (courseLifeErr) throw new Error("courses life: " + courseLifeErr.message);

    const { data: modLife, error: modLifeErr } = await adminClient
      .from("modules")
      .upsert({ course_id: courseLife.id, title: "The Search for Life", order: 1 }, { onConflict: "course_id,order" })
      .select().single();
    if (modLifeErr) throw new Error("module life: " + modLifeErr.message);

    const lifeLessons = [
      {
        id: "life-extremophiles",
        slug: "extremophiles",
        title: "Life at the Extremes — Lessons from Earth",
        order: 1,
        xp_reward: 50,
        content_mdx: `<h2>Life Finds a Way</h2>
<p>Extremophiles — organisms that thrive in conditions once thought lethal — have dramatically expanded our understanding of life's limits. Deep-sea hydrothermal vent communities (discovered 1977) survive without sunlight, using chemosynthesis. Tardigrades survive vacuum, radiation, temperatures from −272 °C to +150 °C.</p>
<p>The key conditions for carbon-based life: liquid water as solvent, energy source (light or chemical), key elements (CHNOPS: carbon, hydrogen, nitrogen, oxygen, phosphorus, sulphur), and thermodynamic disequilibrium.</p>

:::callout{type="key"}
Extremophile record holders: Deinococcus radiodurans survives 1.5 million rads of radiation. Psychrobacter arcticus grows at −10 °C. Strain 121 (Archaea) reproduces at 121 °C. Black smoker communities at 400 °C pressure-elevated water.
:::

:::quiz
question: Why is the discovery of deep-sea hydrothermal vent ecosystems astrobiologically significant?
options: ["They proved that life needs sunlight to exist","They showed life can be powered entirely by chemical energy (chemosynthesis), independent of sunlight","They discovered life can survive in outer space","They proved that all life descended from a single common ancestor"]
correct: 1
explanation: Hydrothermal vent communities (discovered 1977) use chemosynthesis — oxidising hydrogen sulphide (H₂S) instead of photosynthesis. This proved that life does not require sunlight, dramatically expanding the range of environments (including icy moon subsurface oceans) that could support life.
:::`,
      },
      {
        id: "life-habitable-zone",
        slug: "habitable-zones",
        title: "Habitable Zones — Where Could Life Exist?",
        order: 2,
        xp_reward: 75,
        content_mdx: `<h2>The Goldilocks Zone</h2>
<p>The circumstellar habitable zone (CHZ) is the range of orbital distances where a rocky planet can maintain liquid water on its surface — assuming Earth-like atmospheric pressure and composition. The inner edge is the runaway greenhouse threshold; the outer edge is where CO₂ condenses.</p>
<p>For the Sun, the CHZ spans ~0.95–1.67 AU. For red dwarfs (M-type stars), it's much closer (0.1–0.4 AU), raising concerns about tidal locking and stellar flares. For F-type stars (hotter than the Sun), it's further out.</p>

:::callout{type="note"}
"Habitable zone" is a simplified concept. Europa and Enceladus are outside the Sun's HZ, yet may host life powered by tidal heating in subsurface oceans. The HZ for surface liquid water may underestimate habitable real estate by 10–100×.
:::

:::quiz
question: Why are planets in the habitable zone of red dwarf (M-type) stars potentially problematic for life?
options: ["Red dwarfs are too cold to support photosynthesis","Habitable zone planets are likely tidally locked, facing extreme temperature contrasts, plus frequent powerful flares","Red dwarfs don't have enough heavy elements to form rocky planets","Their habitable zones are too large for any single planet to occupy"]
correct: 1
explanation: Planets in M-dwarf HZs orbit very close (0.1–0.4 AU) and are likely tidally locked (one face always towards the star). This creates permanent day/night temperature extremes. Additionally, M-dwarfs have frequent powerful UV/X-ray flares that could strip atmospheres and damage DNA on the surface.
:::`,
      },
      {
        id: "life-drake-equation",
        slug: "drake-equation",
        title: "The Drake Equation & the Fermi Paradox",
        order: 3,
        xp_reward: 100,
        content_mdx: `<h2>How Many Civilisations?</h2>
<p>Frank Drake formulated his famous equation in 1961 at the first SETI conference in Green Bank, WV. N = R★ × fp × ne × fl × fi × fc × L estimates the number of technologically communicating civilisations in our galaxy at any given time.</p>
<p>Optimistic estimates (Drake's own ~1000, Sagan's millions) contrast sharply with the "rare Earth" hypothesis (N ~ 1 or fewer). The Fermi Paradox asks: if N is large, why have we found no evidence of extraterrestrial intelligence in 60+ years of SETI?</p>

:::callout{type="key"}
The Great Filter: there may be one or more steps in the evolutionary path to spacefaring civilisation that are extremely improbable. If the filter is behind us (e.g., the origin of life), we are alone. If ahead, civilisations regularly self-destruct — a terrifying implication.
:::

:::interactive
type: drake-equation
:::

:::quiz
question: What is the "Great Filter" hypothesis in response to the Fermi Paradox?
options: ["A giant magnetic filter at the galaxy's edge that blocks alien radio signals","One or more extremely improbable evolutionary steps that prevent most potential civilisations from becoming spacefaring","The idea that aliens filter their communications to avoid detection","A physical barrier at the edge of the solar system preventing signals from escaping"]
correct: 1
explanation: Robin Hanson (1998) proposed that something must prevent the emergence of spacefaring civilisations — a "Great Filter" step. The crucial question is whether it lies in our past (e.g., the origin of life is extraordinarily rare) — making us possibly unique — or in our future (e.g., advanced civilisations inevitably self-destruct), which would be deeply alarming.
:::`,
      },
      {
        id: "life-seti",
        slug: "seti-search",
        title: "SETI — 60 Years of Searching",
        order: 4,
        xp_reward: 75,
        content_mdx: `<h2>Listening to the Cosmos</h2>
<p>Project Ozma (1960) — Frank Drake's first SETI search — pointed the 85-foot Green Bank telescope at Tau Ceti and Epsilon Eridani for signals at 1.42 GHz (the 21-cm HI line, a "cosmic watering hole" frequency where any technological civilisation might broadcast).</p>
<p>Since then: the "Wow! signal" (1977, never repeated), SETI@home (1999–2020, 5.2 million volunteers), Breakthrough Listen (2016–present, 10-year $100M programme, surveying 1 million nearby stars). As of 2025, N_detected = 0.</p>

:::callout{type="note"}
Technosignatures extend beyond radio: laser pulses (optical SETI), atmospheric pollutants (NO₂, CFCs), megastructures (Dyson spheres reducing stellar flux — the "Tabby's Star" mystery), and gravitational wave beacons. JWST atmospheric surveys are the newest frontier.
:::

:::quiz
question: What is the significance of the 21-cm (1.42 GHz) hydrogen line in SETI?
options: ["It is the only frequency that can penetrate interstellar gas","It is naturally produced by all stars, providing a beacon","It is a universal frequency likely known to any technological civilisation — a 'cosmic watering hole' for communication","21 cm is the minimum resolution achievable by radio telescopes"]
correct: 2
explanation: The 21-cm line is emitted by neutral hydrogen — the most abundant element in the universe. Any civilisation capable of radio astronomy would know this frequency, making it a natural choice for interstellar communication. Morrison and Cocconi (1959) proposed this rationale in the first modern SETI paper.
:::`,
      },
    ];

    for (const l of lifeLessons) {
      const { error: le } = await adminClient.from("lessons").upsert({
        id: l.id, slug: l.slug, title: l.title, module_id: modLife.id,
        order: l.order, xp_reward: l.xp_reward, content_mdx: l.content_mdx,
        status: "published",
      }, { onConflict: "id" });
      if (le) throw new Error(`lesson ${l.id}: ${le.message}`);
    }

    // ════════════════════════════════════════════════════════════════
    // SUMMARY
    // ════════════════════════════════════════════════════════════════
    return NextResponse.json({
      message: "Expansion seeded successfully!",
      breakdown: {
        newSubjects: 4,
        newCoursesInExistingSubjects: 4,
        newSubjectCourses: 4,
        totalNewCourses: 8,
        totalNewLessons: 30, // 4+3+3+3 (Option A) + 4+4+3+4 (Option B)
        newAnimationTypes: [
          "transmission-spectra", "biosignature-spectra", "cepheid", "eclipsing-binary",
          "tidal-heating", "time-dilation", "spacetime-curvature", "cosmic-expansion",
          "cmb", "dark-energy", "galaxy-morphology", "galaxy-rotation",
          "em-spectrum", "telescope-optics", "drake-equation",
        ],
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("seed-expansion error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
