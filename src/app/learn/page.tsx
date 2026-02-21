import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const XP_PER_LEVEL = 500;

function xpInfo(totalXp: number, level: number) {
  const base = (level - 1) * XP_PER_LEVEL;
  const progress = totalXp - base;
  return { progress, needed: XP_PER_LEVEL, percent: Math.min(100, Math.round((progress / XP_PER_LEVEL) * 100)) };
}

// ── Course tile (shared between both views) ─────────────────────────────────
function CourseCard({ course, compact = false }: { course: any; compact?: boolean }) {
  const subject = course.subjects;
  const color: string = subject?.color ?? "#58a6ff";
  const icon: string = subject?.icon_name ?? "🌌";
  const href = `/learn/${subject?.slug ?? "course"}/${course.slug}`;

  return (
    <Link
      href={href}
      className={`cosmic-card no-underline block group transition-all ${compact ? "p-4" : "p-6"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-lg flex items-center justify-center text-xl shrink-0 ${compact ? "w-9 h-9 text-base" : "w-11 h-11 text-xl"}`}
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-[#e6edf3] group-hover:transition-colors leading-snug ${compact ? "text-sm" : "text-base"}`}
              style={{ ["--tw-text-opacity" as string]: 1 }}
            >
              <span className="group-hover:text-[var(--card-accent)]" style={{ ["--card-accent" as string]: color }}>
                {course.title}
              </span>
            </h3>
            {course.status === "coming_soon" && (
              <span className="badge badge-orange shrink-0 text-[10px]">Soon</span>
            )}
          </div>
          {!compact && course.description && (
            <p className="text-xs text-[#8b949e] mt-1 leading-relaxed line-clamp-2">{course.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {course.level_tag?.slice(0, 2).map((tag: string) => (
              <span key={tag} className="badge badge-blue text-[10px]">{tag}</span>
            ))}
            {course.estimated_hours && (
              <span className="text-[10px] text-[#484f58]">{course.estimated_hours}h</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function LearnDashboard({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/learn");

  const [profileRes, streakRes, subjectsRes, coursesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("streaks").select("*").eq("user_id", user.id).single(),
    supabase.from("subjects").select("*").order("order"),
    supabase
      .from("courses")
      .select("*, subjects(id, title, slug, color, icon_name)")
      .eq("status", "published")
      .order("order_index"),
  ]);

  const profile = profileRes.data;
  const streak = streakRes.data;
  const subjects = subjectsRes.data ?? [];
  const courses = coursesRes.data ?? [];

  if (profile && !profile.onboarding_complete) redirect("/learn/onboarding");

  const displayName =
    profile?.display_name ?? profile?.full_name ?? user.email?.split("@")[0] ?? "Explorer";
  const totalXp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xp = xpInfo(totalXp, level);

  const view = searchParams.view === "all" ? "all" : "subjects";

  // Group courses under their subject (preserving subject order)
  const subjectCourses: { subject: any; courses: any[] }[] = subjects
    .map((s) => ({
      subject: s,
      courses: courses.filter((c) => c.subjects?.id === s.id),
    }))
    .filter((g) => g.courses.length > 0);

  // Courses with no matched subject (edge case)
  const orphans = courses.filter((c) => !subjects.some((s) => s.id === c.subjects?.id));

  return (
    <div className="content-container py-10 space-y-10">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-3xl font-bold text-[#e6edf3]">
          Welcome back, <span className="text-gradient">{displayName}</span> 👋
        </h1>
        <p className="text-[#8b949e] mt-1">Continue your journey through the cosmos.</p>
      </div>

      {/* ── Stats bar ── */}
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
              href="/learn/exoplanets/exoplanet-detective/module-1/worlds-beyond"
              className="btn-primary text-sm no-underline"
            >
              Continue Learning →
            </Link>
          ) : (
            <span className="text-xs text-[#8b949e]">No courses available yet.</span>
          )}
        </div>
      </div>

      {/* ── Course library header + view toggle ── */}
      <div>
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-[#e6edf3]">Course Library</h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {subjects.length} subjects · {courses.length} courses
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg">
            <Link
              href="/learn?view=subjects"
              className={`px-3 py-1.5 rounded-md text-xs font-medium no-underline transition-colors ${
                view === "subjects"
                  ? "bg-[#21262d] text-[#e6edf3]"
                  : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              By Subject
            </Link>
            <Link
              href="/learn?view=all"
              className={`px-3 py-1.5 rounded-md text-xs font-medium no-underline transition-colors ${
                view === "all"
                  ? "bg-[#21262d] text-[#e6edf3]"
                  : "text-[#8b949e] hover:text-[#c9d1d9]"
              }`}
            >
              All Courses
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="cosmic-card p-12 text-center">
            <div className="text-4xl mb-3">🌌</div>
            <p className="text-[#8b949e]">Courses are being prepared. Check back soon!</p>
          </div>

        ) : view === "subjects" ? (
          /* ── By Subject view ── */
          <div className="space-y-8">
            {subjectCourses.map(({ subject, courses: sc }) => (
              <div key={subject.id}>
                {/* Subject header */}
                <div
                  className="flex items-center gap-3 mb-3 pb-3 border-b"
                  style={{ borderColor: `${subject.color}30` }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40` }}
                  >
                    {subject.icon_name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: subject.color }}
                    >
                      {subject.title}
                    </h3>
                    {subject.description && (
                      <p className="text-xs text-[#484f58] truncate">{subject.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#484f58] shrink-0">
                    {sc.length} {sc.length === 1 ? "course" : "courses"}
                  </span>
                </div>

                {/* Course tiles for this subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sc.map((course: any) => (
                    <CourseCard key={course.id} course={course} compact />
                  ))}
                </div>
              </div>
            ))}

            {/* Orphaned courses (no subject match) */}
            {orphans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphans.map((course: any) => (
                  <CourseCard key={course.id} course={course} compact />
                ))}
              </div>
            )}
          </div>

        ) : (
          /* ── All Courses tile view ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
