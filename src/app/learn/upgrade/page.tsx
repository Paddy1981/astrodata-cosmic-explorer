import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const FREE_COURSES = [
  { title: "Exoplanet Detective", icon: "🪐", desc: "Hunt for planets with Kepler data" },
  { title: "The Life of Stars", icon: "⭐", desc: "From stellar birth to supernovae" },
  { title: "Our Cosmic Neighbourhood", icon: "☀️", desc: "Explore the solar system" },
  { title: "Beyond the Event Horizon", icon: "🕳️", desc: "Black holes & gravitational waves" },
];

const PREMIUM_COURSES = [
  { title: "Exoplanet Atmospheres & JWST", icon: "🌌", desc: "Read alien skies with JWST" },
  { title: "Variable Stars & Binary Systems", icon: "💫", desc: "Cepheids and the distance ladder" },
  { title: "Moons of the Solar System", icon: "🌕", desc: "Ocean worlds and volcanic moons" },
  { title: "Relativity & Spacetime", icon: "⏱️", desc: "Special and general relativity" },
  { title: "The Big Bang & Beyond", icon: "🌌", desc: "Cosmology from first principles" },
  { title: "The Milky Way & Beyond", icon: "🌀", desc: "Galaxies, dark matter, quasars" },
  { title: "How We See the Universe", icon: "🔭", desc: "Telescopes and the EM spectrum" },
  { title: "Is Anyone Out There?", icon: "👽", desc: "Astrobiology and SETI" },
];

export default async function UpgradePage() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/learn/upgrade");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, display_name, full_name")
    .eq("id", user.id)
    .single();

  const isAlreadyPremium = profile?.is_premium ?? false;
  const displayName = profile?.display_name ?? profile?.full_name ?? user.email?.split("@")[0] ?? "Explorer";

  return (
    <div className="content-container py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#f7cc4a20] border border-[#f7cc4a40] rounded-full px-4 py-1.5 mb-4">
          <span className="text-[#f7cc4a] text-sm font-medium">✦ AstroData Premium</span>
        </div>
        <h1 className="text-4xl font-bold text-[#e6edf3] mb-3">
          Explore the <span className="text-gradient">entire cosmos</span>
        </h1>
        <p className="text-[#8b949e] text-lg max-w-xl mx-auto">
          Unlock all 12 courses — 51+ lessons of real astronomy, real data, and real science.
          No limits. Learn at your pace.
        </p>
      </div>

      {isAlreadyPremium ? (
        /* Already premium */
        <div className="cosmic-card p-10 text-center mb-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">
            You&apos;re already Premium, {displayName}!
          </h2>
          <p className="text-[#8b949e] mb-6">
            You have unlimited access to all courses. Time to explore.
          </p>
          <Link href="/learn" className="btn-primary no-underline text-base px-8 py-3">
            Back to Dashboard →
          </Link>
        </div>
      ) : (
        <>
          {/* Pricing card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Free */}
            <div className="cosmic-card p-6 border border-[#30363d]">
              <div className="mb-4">
                <span className="badge badge-blue text-xs">Free</span>
                <div className="text-3xl font-bold text-[#e6edf3] mt-2">£0 <span className="text-base font-normal text-[#8b949e]">/ forever</span></div>
              </div>
              <ul className="space-y-2 mb-6">
                {FREE_COURSES.map((c) => (
                  <li key={c.title} className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                    <span className="text-[#3fb950]">✓</span>
                    <span>{c.icon} {c.title}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm text-[#484f58]">
                  <span>✗</span> <span>8 premium courses locked</span>
                </li>
              </ul>
              <div className="text-xs text-[#484f58] text-center">Your current plan</div>
            </div>

            {/* Premium */}
            <div
              className="cosmic-card p-6 relative overflow-hidden"
              style={{ border: "1px solid #f7cc4a50", background: "linear-gradient(135deg, #f7cc4a0a 0%, #090d14 100%)" }}
            >
              <div className="absolute top-4 right-4">
                <span className="badge badge-gold text-xs">Most Popular</span>
              </div>
              <div className="mb-4">
                <span className="text-[#f7cc4a] text-xs font-semibold uppercase tracking-wider">Premium</span>
                <div className="text-3xl font-bold text-[#e6edf3] mt-2">
                  £9.99 <span className="text-base font-normal text-[#8b949e]">/ month</span>
                </div>
                <p className="text-xs text-[#8b949e] mt-1">or £79.99/year (save 33%)</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                  <span className="text-[#3fb950]">✓</span>
                  <span>All 4 free courses included</span>
                </li>
                {PREMIUM_COURSES.map((c) => (
                  <li key={c.title} className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                    <span className="text-[#f7cc4a]">✦</span>
                    <span>{c.icon} {c.title}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm text-[#c9d1d9]">
                  <span className="text-[#3fb950]">✓</span>
                  <span>Unlimited enrolments & progress tracking</span>
                </li>
              </ul>
              {/* Placeholder CTA — wire to payment provider */}
              <button
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "#f7cc4a", color: "#090d14" }}
                disabled
              >
                Coming Soon — Payments in Progress
              </button>
              <p className="text-xs text-[#484f58] text-center mt-2">
                Stripe integration coming shortly.
              </p>
            </div>
          </div>

          {/* Feature comparison */}
          <div className="cosmic-card overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[#30363d]">
              <h2 className="font-semibold text-[#e6edf3]">What you get with Premium</h2>
            </div>
            <div className="divide-y divide-[#30363d]/50">
              {[
                { feature: "4 core courses (Exoplanets, Stars, Solar System, Black Holes)", free: true, premium: true },
                { feature: "8 expansion courses (Atmospheres, Relativity, Cosmology, Galaxies & more)", free: false, premium: true },
                { feature: "Interactive simulations & data exercises", free: true, premium: true },
                { feature: "XP, levels & streak tracking", free: true, premium: true },
                { feature: "Course enrolment & personal My Courses dashboard", free: true, premium: true },
                { feature: "51+ lessons of real astrophysics content", free: "23 lessons", premium: "51+ lessons" },
                { feature: "Early access to new courses", free: false, premium: true },
              ].map(({ feature, free, premium }) => (
                <div key={feature} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="flex-1 text-sm text-[#c9d1d9]">{feature}</span>
                  <div className="w-16 text-center text-sm">
                    {free === true ? (
                      <span className="text-[#3fb950]">✓</span>
                    ) : free === false ? (
                      <span className="text-[#484f58]">✗</span>
                    ) : (
                      <span className="text-[#8b949e] text-xs">{free}</span>
                    )}
                  </div>
                  <div className="w-20 text-center text-sm">
                    {premium === true ? (
                      <span className="text-[#f7cc4a]">✦</span>
                    ) : (
                      <span className="text-[#8b949e] text-xs">{premium}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-2 border-t border-[#30363d] flex justify-end gap-6 text-xs text-[#484f58]">
              <span className="w-16 text-center">Free</span>
              <span className="w-20 text-center text-[#f7cc4a]">Premium</span>
            </div>
          </div>
        </>
      )}

      <div className="text-center">
        <Link href="/learn" className="text-sm text-[#8b949e] hover:text-[#c9d1d9] no-underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
