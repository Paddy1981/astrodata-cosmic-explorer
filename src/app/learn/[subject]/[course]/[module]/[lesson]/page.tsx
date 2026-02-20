import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface Props {
  params: {
    subject: string;
    course: string;
    module: string;
    lesson: string;
  };
}

export default async function LessonPage({ params }: Props) {
  const supabase = getSupabaseServerClient();

  const { data: lessonData } = await supabase
    .from("lessons")
    .select(`
      *,
      modules (
        title,
        courses (
          title, slug,
          subjects ( title, slug )
        )
      )
    `)
    .eq("slug", params.lesson)
    .single();

  if (!lessonData) notFound();

  const course = lessonData.modules?.courses;
  const subject = course?.subjects;

  return (
    <div className="content-container py-10 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#8b949e] mb-8 flex-wrap">
        <Link href="/learn" className="no-underline hover:text-[#58a6ff]">Learn</Link>
        <span>/</span>
        {subject && (
          <>
            <span className="capitalize">{subject.title}</span>
            <span>/</span>
          </>
        )}
        {course && (
          <>
            <Link
              href={`/learn/${subject?.slug}/${course.slug}`}
              className="no-underline hover:text-[#58a6ff]"
            >
              {course.title}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#e6edf3]">{lessonData.title}</span>
      </nav>

      {/* Lesson header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="badge badge-blue capitalize">{lessonData.content_type}</span>
          <span className="badge badge-gold">+{lessonData.xp_reward} XP</span>
          {lessonData.difficulty_level && (
            <span className="badge badge-purple capitalize">{lessonData.difficulty_level}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#e6edf3]">{lessonData.title}</h1>
      </div>

      {/* Lesson content */}
      <div className="cosmic-card p-8">
        {lessonData.content_mdx ? (
          <div className="prose prose-invert max-w-none text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
            {lessonData.content_mdx}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-[#8b949e]">Interactive content coming in Phase 2.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Link href={`/learn/${params.subject}/${params.course}`} className="btn-secondary no-underline">
          ← Back to Course
        </Link>
        <button className="btn-primary">Mark Complete ✓</button>
      </div>
    </div>
  );
}
