/**
 * Standalone seed runner — calls seed API with service role key bypass.
 * Usage:  node --env-file=.env.local scripts/run-seed.mjs
 * Requires dev server running: npm run dev
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const restHeaders = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function checkDb() {
  const [subjects, courses, lessons] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/subjects?select=slug`, { headers: restHeaders }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/courses?select=slug,status`, { headers: restHeaders }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/lessons?select=id`, { headers: restHeaders }).then(r => r.json()),
  ]);
  return { subjects: subjects.length, courses: courses.length, lessons: lessons.length };
}

async function checkLesson(id, field) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/lessons?select=${field}&id=eq.${id}`,
    { headers: restHeaders }
  );
  const data = await res.json();
  return data[0]?.[field] ?? null;
}

async function callSeedEndpoint(path) {
  const url = `${SITE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": SERVICE_KEY,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  console.log("🌱 AstroData Seed Runner\n");

  // Check current state
  const before = await checkDb();
  console.log(`DB state: ${before.subjects} subjects · ${before.courses} courses · ${before.lessons} lessons`);

  const transitMdx = await checkLesson("transit-method", "content_mdx");
  const hasCallouts    = transitMdx?.includes(":::stat") || transitMdx?.includes(":::warning");
  const hasInfographic = transitMdx?.includes(":::infographic");

  console.log(`Callout enrichment (:::stat/:::warning): ${hasCallouts    ? "✓" : "✗ MISSING"}`);
  console.log(`Infographic blocks (:::infographic):     ${hasInfographic ? "✓" : "✗ MISSING"}`);
  console.log();

  if (hasCallouts && hasInfographic) {
    console.log("✅ Latest content is already in the database. No re-seed needed.");
    return;
  }

  // Try dev server
  let serverRunning = false;
  try {
    const res = await fetch(`${SITE_URL}/`, { signal: AbortSignal.timeout(3000) });
    serverRunning = res.ok || res.status < 500;
  } catch {}

  if (!serverRunning) {
    console.log("⚠️  Dev server not running. Options:");
    console.log("");
    console.log("  Option A — Admin panel:");
    console.log(`    1. npm run dev`);
    console.log(`    2. Open ${SITE_URL}/admin → Seed tab → Run Seed`);
    console.log("");
    console.log("  Option B — CLI (after starting dev server):");
    console.log(`    npm run dev  # in another terminal`);
    console.log(`    node --env-file=.env.local scripts/run-seed.mjs`);
    return;
  }

  // Run Phase 1
  process.stdout.write("▶ Phase 1 (core seed)… ");
  try {
    const r1 = await callSeedEndpoint("/api/admin/seed");
    console.log("✓", r1.message ?? "done");
  } catch (e) {
    console.error("✗ failed:", e.message);
    process.exit(1);
  }

  // Run Phase 2
  process.stdout.write("▶ Phase 2 (expansion seed)… ");
  try {
    const r2 = await callSeedEndpoint("/api/admin/seed-expansion");
    console.log("✓", r2.message ?? "done");
  } catch (e) {
    console.error("✗ failed:", e.message);
    process.exit(1);
  }

  // Verify
  const after = await checkDb();
  const afterMdx = await checkLesson("transit-method", "content_mdx");
  console.log();
  console.log("📊 After seed:");
  console.log(`   ${after.subjects} subjects · ${after.courses} courses · ${after.lessons} lessons`);
  console.log(`   Infographics: ${afterMdx?.includes(":::infographic") ? "✓ seeded" : "✗ still missing"}`);
  console.log("\n🎉 Seed complete!");
}

main().catch(e => { console.error(e); process.exit(1); });
