import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const XP_PER_LEVEL = 500;

function xpInfo(totalXp: number, level: number) {
  const base = (level - 1) * XP_PER_LEVEL;
  const progress = totalXp - base;
  return { progress, needed: XP_PER_LEVEL, percent: Math.min(100, Math.round((progress / XP_PER_LEVEL) * 100)) };
}

export default async function LearnDashboard() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/learn");

  const [profileRes, streakRes, coursesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("streaks").select("*").eq("user_id", user.id).single(),
    supabase.from("courses").select("*, subjects(title, slug, color)").eq("status", "published").order("order_index"),
  ]);

  const profile = profileRes.data;
  const streak = streakRes.data;
  const courses = coursesRes.data ?? [];

  // Redirect to onboarding if not complete
  if (profile && !profile.onboarding_complete) {
    redirect("/learn/onboarding");
  }

  const displayName =
    profile?.display_name ?? profile?.full_name ?? user.email?.split("@")[0] ?? "Explorer";
  const totalXp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xp = xpInfo(totalXp, level);

  return (
    <div className="content-container py-10 space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-[#e6edf3]">
          Welcome back, <span className="text-gradient">{displayName}</span> 👋
        </h1>
        <p className="text-[#8b949e] mt-1">Continue your journey through the cosmos.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* XP */}
        <div className="cosmic-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#8b949e] uppercase tracking-wider">Experience</span>
            <span className="badge badge-purple">Level {level}</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3] mb-2">{totalXp} XP</div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${xp.percent}%` }} />
          </div>
          <p className="text-xs text-[#8b949e] mt-1.5">{xp.progress} / {xp.needed} to Level {level + 1}</p>
        </div>

        {/* Streak */}
        <div className="cosmic-card p-5">
          <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">Daily Streak</div>
          <div className="flex items-end gap-2">
            <span className="text-4xl">🔥</span>
            <span className="text-3xl font-bold text-[#f0883e]">{streak?.current_streak ?? 0}</span>
            <span className="text-[#8b949e] text-sm pb-1">days</span>
          </div>
          {streak && streak.longest_streak > 0 && (
            <p className="text-xs text-[#8b949e] mt-2">Best: {streak.longest_streak} days</p>
          )}
        </div>

        {/* Quick start */}
        <div className="cosmic-card p-5 flex flex-col justify-between">
          <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">Quick Start</div>
          <p className="text-sm text-[#c9d1d9] mb-4">Pick up where you left off or start something new.</p>
          {courses.length > 0 ? (
            <Link
              href={`/learn/exoplanets/exoplanet-detective/module-1/worlds-beyond`}
              className="btn-primary text-sm no-underline"
            >
              Continue Learning →
            </Link>
          ) : (
            <span className="text-xs text-[#8b949e]">No courses available yet.</span>
          )}
        </div>
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-xl font-semibold text-[#e6edf3] mb-4">Available Courses</h2>
        {courses.length === 0 ? (
          <div className="cosmic-card p-12 text-center">
            <div className="text-4xl mb-3">🌌</div>
            <p className="text-[#8b949e]">Courses are being prepared. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => {
              const subject = course.subjects;
              const color = subject?.color ?? "#58a6ff";
              return (
                <Link
                  key={course.id}
                  href={`/learn/${subject?.slug ?? "course"}/${course.slug}`}
                  className="cosmic-card p-6 no-underline block group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    🪐
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                      {course.title}
                    </h3>
                    {course.status === "coming_soon" && (
                      <span className="badge badge-orange shrink-0">Soon</span>
                    )}
                  </div>
                  {subject && (
                    <p className="text-xs text-[#8b949e] mb-3">{subject.title}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {course.level_tag?.map((tag: string) => (
                      <span key={tag} className="badge badge-blue">{tag}</span>
                    ))}
                    {course.estimated_hours && (
                      <span className="text-xs text-[#8b949e]">{course.estimated_hours}h</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
