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
function CourseCard({
  course,
  compact = false,
  userIsPremium = false,
}: {
  course: any;
  compact?: boolean;
  userIsPremium?: boolean;
}) {
  const subject = course.subjects;
  const color: string = subject?.color ?? "#58a6ff";
  const icon: string = subject?.icon_name ?? "🌌";
  const href = `/learn/${subject?.slug ?? "course"}/${course.slug}`;
  const locked = course.is_premium && !userIsPremium;

  return (
    <Link
      href={href}
      className={`cosmic-card no-underline block group transition-all ${compact ? "p-4" : "p-6"} ${locked ? "opacity-80" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-lg flex items-center justify-center text-xl shrink-0 ${compact ? "w-9 h-9 text-base" : "w-11 h-11 text-xl"}`}
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {locked ? "🔒" : icon}
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
            <div className="flex items-center gap-1 shrink-0">
              {locked && (
                <span className="badge badge-gold text-[10px]">Premium</span>
              )}
              {course.status === "coming_soon" && (
                <span className="badge badge-orange text-[10px]">Soon</span>
              )}
            </div>
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

// ── My Courses progress card ─────────────────────────────────────────────────
function EnrolledCourseCard({
  course,
  completedLessons,
  totalLessons,
  continueHref,
}: {
  course: any;
  completedLessons: number;
  totalLessons: number;
  continueHref: string;
}) {
  const subject = course.subjects;
  const color: string = subject?.color ?? "#58a6ff";
  const icon: string = subject?.icon_name ?? "🌌";
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="cosmic-card p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#e6edf3] leading-snug">{course.title}</p>
          {subject?.title && (
            <p className="text-xs mt-0.5" style={{ color }}>{subject.title}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#8b949e] mb-1">
          <span>{percent}% complete</span>
          <span>{completedLessons} / {totalLessons} lessons</span>
        </div>
        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, background: color }}
          />
        </div>
      </div>

      <Link
        href={continueHref}
        className="btn-primary text-xs no-underline text-center py-2"
        style={{ background: `${color}20`, color, borderColor: `${color}40` } as React.CSSProperties}
      >
        Continue →
      </Link>
    </div>
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

  // Always fetch public course data
  const [subjectsRes, coursesRes] = await Promise.all([
    supabase.from("subjects").select("*").order("order"),
    supabase
      .from("courses")
      .select("*, subjects(id, title, slug, color, icon_name)")
      .eq("status", "published")
      .order("order_index"),
  ]);

  // User-specific data only when logged in
  let profile: any = null;
  let streak: any = null;
  let enrollments: any[] = [];

  if (user) {
    const [profileRes, streakRes, enrollmentsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      supabase
        .from("course_enrollments")
        .select("course_id, enrolled_at")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false }),
    ]);
    profile = profileRes.data;
    streak = streakRes.data;
    enrollments = enrollmentsRes.data ?? [];

    if (profile && !profile.onboarding_complete) redirect("/learn/onboarding");
  }

  const subjects = subjectsRes.data ?? [];
  const courses = coursesRes.data ?? [];
  const userIsPremium: boolean = profile?.is_premium ?? false;

  const displayName =
    profile?.display_name ?? profile?.full_name ?? user?.email?.split("@")[0] ?? "Explorer";
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

  // ── My Courses data ──────────────────────────────────────────────────────
  const enrolledCourseIds = enrollments.map((e: any) => e.course_id);
  const enrolledCourses = enrolledCourseIds
    .map((id: string) => courses.find((c: any) => c.id === id))
    .filter(Boolean);

  // Fetch lesson counts + completed progress for enrolled courses
  let enrolledWithProgress: {
    course: any;
    completedLessons: number;
    totalLessons: number;
    continueHref: string;
  }[] = [];

  if (enrolledCourses.length > 0) {
    // Fetch all modules+lessons for enrolled courses
    const { data: modulesData } = await supabase
      .from("modules")
      .select("id, course_id, order, lessons(id, slug, order_index)")
      .in("course_id", enrolledCourseIds)
      .order("order");

    // Fetch completed lesson ids for this user
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("lesson_id")
      .eq("user_id", user!.id)
      .eq("status", "completed");

    const completedSet = new Set((progressData ?? []).map((p: any) => p.lesson_id));

    // Build per-course lesson lists
    const courseLessonsMap: Record<string, any[]> = {};
    for (const mod of modulesData ?? []) {
      if (!courseLessonsMap[mod.course_id]) courseLessonsMap[mod.course_id] = [];
      courseLessonsMap[mod.course_id].push(...(mod.lessons ?? []));
    }

    // For each enrolled course, find first incomplete lesson href
    enrolledWithProgress = enrolledCourses.map((course: any) => {
      const subject = course.subjects;
      const allCourseLessons = (courseLessonsMap[course.id] ?? []).sort(
        (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      const completedLessons = allCourseLessons.filter((l: any) => completedSet.has(l.id)).length;

      // Find which module each lesson belongs to (to build URL)
      const courseModules = (modulesData ?? [])
        .filter((m: any) => m.course_id === course.id)
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

      // First incomplete lesson
      let continueHref = `/learn/${subject?.slug ?? "course"}/${course.slug}`;
      outer: for (let mi = 0; mi < courseModules.length; mi++) {
        const mod = courseModules[mi];
        const modLessons = [...(mod.lessons ?? [])].sort(
          (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
        );
        for (const lesson of modLessons) {
          if (!completedSet.has(lesson.id)) {
            continueHref = `/learn/${subject?.slug ?? "course"}/${course.slug}/module-${mi + 1}/${lesson.slug}`;
            break outer;
          }
        }
      }

      return {
        course,
        completedLessons,
        totalLessons: allCourseLessons.length,
        continueHref,
      };
    });
  }

  // Quick Start: most recently enrolled course's first incomplete lesson
  const quickStartHref = enrolledWithProgress.length > 0
    ? enrolledWithProgress[0].continueHref
    : courses.length > 0
      ? "/learn/exoplanets/exoplanet-detective/module-1/worlds-beyond"
      : null;

  return (
    <div className="content-container py-10 space-y-10">

      {user ? (
        <>
          {/* ── Authenticated: greeting + stats ── */}
          <div>
            <h1 className="text-3xl font-bold text-[#e6edf3]">
              Welcome back, <span className="text-gradient">{displayName}</span> 👋
            </h1>
            <p className="text-[#8b949e] mt-1">Continue your journey through the cosmos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="cosmic-card p-5 flex flex-col justify-between">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">Quick Start</div>
              <p className="text-sm text-[#c9d1d9] mb-4">Pick up where you left off or start something new.</p>
              {quickStartHref ? (
                <Link href={quickStartHref} className="btn-primary text-sm no-underline">
                  Continue Learning →
                </Link>
              ) : (
                <span className="text-xs text-[#8b949e]">No courses available yet.</span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── Guest: hero banner ── */
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-5xl">🔭</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-1">
              Explore the Universe — for free
            </h1>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              Browse {courses.length} astronomy and astrophysics courses across {subjects.length} subjects.
              Sign in to enrol, track your progress, earn XP, and unlock premium content.
            </p>
          </div>
          <Link
            href="/login?redirectTo=/learn"
            className="btn-primary no-underline text-sm px-6 py-2.5 shrink-0"
          >
            Sign in free →
          </Link>
        </div>
      )}

      {/* ── Premium upsell (logged-in free users only) ── */}
      {user && !userIsPremium && (
        <div className="rounded-2xl border border-[#f7cc4a30] bg-[#f7cc4a0d] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">⭐</span>
            <div>
              <p className="font-semibold text-[#e6edf3] text-sm">Unlock 8 more courses with Premium</p>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Exoplanet Atmospheres, Relativity, Cosmology, Galaxies, and more — unlimited access.
              </p>
            </div>
          </div>
          <Link
            href="/learn/upgrade"
            className="btn-primary no-underline text-sm px-6 py-2.5 shrink-0"
            style={{ background: "#f7cc4a", color: "#090d14", borderColor: "#f7cc4a" } as React.CSSProperties}
          >
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── My Courses (logged-in only) ── */}
      {enrolledWithProgress.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-[#e6edf3]">My Courses</h2>
              <p className="text-xs text-[#8b949e] mt-0.5">
                {enrolledWithProgress.length} enrolled
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledWithProgress.map(({ course, completedLessons, totalLessons, continueHref }) => (
              <EnrolledCourseCard
                key={course.id}
                course={course}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                continueHref={continueHref}
              />
            ))}
          </div>
        </div>
      )}

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
                    <CourseCard key={course.id} course={course} compact userIsPremium={userIsPremium} />
                  ))}
                </div>
              </div>
            ))}

            {/* Orphaned courses (no subject match) */}
            {orphans.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {orphans.map((course: any) => (
                  <CourseCard key={course.id} course={course} compact userIsPremium={userIsPremium} />
                ))}
              </div>
            )}
          </div>

        ) : (
          /* ── All Courses tile view ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course: any) => (
              <CourseCard key={course.id} course={course} userIsPremium={userIsPremium} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
