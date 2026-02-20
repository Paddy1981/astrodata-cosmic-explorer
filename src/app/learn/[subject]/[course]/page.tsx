import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface Props {
  params: { subject: string; course: string };
}

export default async function CoursePage({ params }: Props) {
  const supabase = getSupabaseServerClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, subjects(title, slug, color)")
    .eq("slug", params.course)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(id, title, slug, content_type, xp_reward, difficulty_level, order_index)")
    .eq("course_id", course.id)
    .order("order");

  const subject = course.subjects as any;
  const color = subject?.color ?? "#58a6ff";
  const allLessons = (modules ?? []).flatMap((m: any) => m.lessons ?? []);
  const totalXp = allLessons.reduce((sum: number, l: any) => sum + (l.xp_reward ?? 0), 0);

  return (
    <div className="content-container py-10 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#8b949e] mb-8">
        <Link href="/learn" className="no-underline hover:text-[#58a6ff]">Learn</Link>
        <span>/</span>
        <span className="text-[#e6edf3]">{course.title}</span>
      </nav>

      {/* Course header */}
      <div className="cosmic-card p-8 mb-8">
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            🪐
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {subject && <span className="badge badge-blue">{subject.title}</span>}
              {course.level_tag?.map((t: string) => (
                <span key={t} className="badge badge-purple capitalize">{t}</span>
              ))}
              {course.estimated_hours && (
                <span className="text-xs text-[#8b949e]">{course.estimated_hours}h</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[#e6edf3] mb-2">{course.title}</h1>
            {course.description && (
              <p className="text-[#8b949e] text-sm leading-relaxed">{course.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-[#8b949e]">
              <span>📚 {allLessons.length} lessons</span>
              <span>⭐ {totalXp} XP available</span>
              <span>📦 {(modules ?? []).length} modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules & lessons */}
      <div className="space-y-6">
        {(modules ?? []).length === 0 ? (
          <div className="cosmic-card p-12 text-center">
            <div className="text-4xl mb-3">🔭</div>
            <p className="text-[#8b949e]">Lessons are being prepared. Check back soon!</p>
          </div>
        ) : (
          (modules ?? []).map((module: any, mi: number) => {
            const lessons = [...(module.lessons ?? [])].sort(
              (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
            );
            return (
              <div key={module.id} className="cosmic-card overflow-hidden">
                {/* Module header */}
                <div className="px-6 py-4 border-b border-[#30363d] flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${color}30`, color }}
                  >
                    {mi + 1}
                  </div>
                  <h2 className="font-semibold text-[#e6edf3]">{module.title}</h2>
                  <span className="ml-auto text-xs text-[#8b949e]">{lessons.length} lessons</span>
                </div>

                {/* Lessons list */}
                <div className="divide-y divide-[#30363d]/50">
                  {lessons.map((lesson: any, li: number) => {
                    const typeIcon: Record<string, string> = {
                      concept: "📖",
                      interactive: "🎮",
                      data_exercise: "📊",
                      quiz: "❓",
                    };
                    const moduleSlug = `module-${mi + 1}`;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${params.subject}/${params.course}/${moduleSlug}/${lesson.slug}`}
                        className="flex items-center gap-4 px-6 py-4 no-underline hover:bg-[#1c2333] transition-colors group"
                      >
                        <span className="text-[#484f58] text-sm w-5 shrink-0">{li + 1}</span>
                        <span className="text-lg shrink-0">{typeIcon[lesson.content_type] ?? "📄"}</span>
                        <span className="flex-1 text-sm text-[#c9d1d9] group-hover:text-white transition-colors">
                          {lesson.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.difficulty_level && (
                            <span className="badge badge-purple capitalize hidden sm:inline-flex">
                              {lesson.difficulty_level}
                            </span>
                          )}
                          <span className="badge badge-gold">+{lesson.xp_reward} XP</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Start button */}
      {allLessons.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href={`/learn/${params.subject}/${params.course}/module-1/${allLessons.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))[0]?.slug}`}
            className="btn-primary no-underline text-base px-8 py-3"
          >
            Start Course →
          </Link>
        </div>
      )}
    </div>
  );
}
