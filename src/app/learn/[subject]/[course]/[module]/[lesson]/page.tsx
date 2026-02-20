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

// Minimal markdown renderer — bold, headings, lists, blockquote, code, tables
function renderMdx(text: string) {
  const lines = text.split("\n");
  const html: string[] = [];
  let inList = false;
  let inTable = false;

  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, '<code class="bg-[#161b22] px-1 py-0.5 rounded text-[#58a6ff] text-sm font-mono">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#58a6ff] underline">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Close list/table if needed
    if (inList && !line.startsWith("- ") && !line.startsWith("* ")) {
      html.push("</ul>"); inList = false;
    }
    if (inTable && !line.startsWith("|")) {
      html.push("</tbody></table></div>"); inTable = false;
    }

    if (!line) { html.push('<div class="h-3"></div>'); continue; }

    // Headings
    if (line.startsWith("### ")) { html.push(`<h3 class="text-lg font-semibold text-[#e6edf3] mt-6 mb-2">${inline(line.slice(4))}</h3>`); continue; }
    if (line.startsWith("## "))  { html.push(`<h2 class="text-xl font-bold text-[#e6edf3] mt-8 mb-3">${inline(line.slice(3))}</h2>`); continue; }
    if (line.startsWith("# "))   { html.push(`<h1 class="text-2xl font-bold text-gradient mt-2 mb-4">${inline(line.slice(2))}</h1>`); continue; }

    // Blockquote
    if (line.startsWith("> ")) {
      html.push(`<blockquote class="border-l-4 border-[#58a6ff] pl-4 py-1 my-3 text-[#8b949e] italic">${inline(line.slice(2))}</blockquote>`);
      continue;
    }

    // Code block (simple — just render as pre)
    if (line.startsWith("```")) {
      html.push('<pre class="bg-[#161b22] border border-[#30363d] rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono text-[#8b949e]">');
      continue;
    }

    // Horizontal rule
    if (line.startsWith("---")) {
      html.push('<hr class="border-[#30363d] my-6" />');
      continue;
    }

    // List item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) { html.push('<ul class="space-y-1.5 my-3 pl-4">'); inList = true; }
      html.push(`<li class="flex gap-2 text-[#c9d1d9]"><span class="text-[#58a6ff] mt-0.5 shrink-0">•</span><span>${inline(line.slice(2))}</span></li>`);
      continue;
    }

    // Table
    if (line.startsWith("|")) {
      if (!inTable) {
        html.push('<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse">');
        inTable = true;
      }
      const cells = line.split("|").filter((_, i, a) => i > 0 && i < a.length - 1);
      if (cells.every(c => /^[-: ]+$/.test(c))) continue; // separator row
      const isHeader = !html.some(h => h.includes("<tbody>"));
      if (isHeader && !html.some(h => h.includes("<thead>"))) {
        html.push('<thead>');
        html.push(`<tr class="border-b border-[#30363d]">${cells.map(c => `<th class="text-left px-3 py-2 text-[#8b949e] font-medium">${inline(c.trim())}</th>`).join("")}</tr>`);
        html.push('</thead><tbody>');
      } else {
        html.push(`<tr class="border-b border-[#30363d]/50">${cells.map(c => `<td class="px-3 py-2 text-[#c9d1d9]">${inline(c.trim())}</td>`).join("")}</tr>`);
      }
      continue;
    }

    // Paragraph
    html.push(`<p class="text-[#c9d1d9] leading-relaxed my-2">${inline(line)}</p>`);
  }

  if (inList)  html.push("</ul>");
  if (inTable) html.push("</tbody></table></div>");

  return html.join("\n");
}

export default async function LessonPage({ params }: Props) {
  const supabase = getSupabaseServerClient();

  // Fetch lesson by slug
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", params.lesson)
    .single();

  if (!lesson) notFound();

  // Fetch module
  const { data: module } = lesson.module_id
    ? await supabase.from("modules").select("*, courses(title, slug, subject_id)").eq("id", lesson.module_id).single()
    : { data: null };

  // Fetch subject
  const course = module?.courses as any;
  const { data: subject } = course?.subject_id
    ? await supabase.from("subjects").select("title, slug, color").eq("id", course.subject_id).single()
    : { data: null };

  // Fetch next lesson in same module
  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("slug, title")
    .eq("module_id", lesson.module_id)
    .gt("order_index", lesson.order_index ?? 0)
    .order("order_index")
    .limit(1)
    .single();

  const typeIcon: Record<string, string> = {
    concept: "📖", interactive: "🎮", data_exercise: "📊", quiz: "❓",
  };

  return (
    <div className="content-container py-10 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#8b949e] mb-8 flex-wrap">
        <Link href="/learn" className="no-underline hover:text-[#58a6ff]">Learn</Link>
        <span>/</span>
        {course && (
          <>
            <Link
              href={`/learn/${subject?.slug ?? params.subject}/${course.slug}`}
              className="no-underline hover:text-[#58a6ff]"
            >
              {course.title}
            </Link>
            <span>/</span>
          </>
        )}
        {module && <><span className="text-[#8b949e]">{module.title}</span><span>/</span></>}
        <span className="text-[#e6edf3]">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="badge badge-blue">{typeIcon[lesson.content_type]} {lesson.content_type}</span>
          <span className="badge badge-gold">+{lesson.xp_reward} XP</span>
          {lesson.difficulty_level && (
            <span className="badge badge-purple capitalize">{lesson.difficulty_level}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#e6edf3]">{lesson.title}</h1>
      </div>

      {/* Lesson content */}
      <div className="cosmic-card p-8">
        {lesson.content_mdx ? (
          <div
            className="text-[#c9d1d9]"
            dangerouslySetInnerHTML={{ __html: renderMdx(lesson.content_mdx) }}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-[#8b949e]">Interactive content coming in Phase 2.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Link
          href={`/learn/${subject?.slug ?? params.subject}/${course?.slug ?? params.course}`}
          className="btn-secondary no-underline"
        >
          ← Back to Course
        </Link>
        {nextLesson ? (
          <Link
            href={`/learn/${params.subject}/${params.course}/${params.module}/${nextLesson.slug}`}
            className="btn-primary no-underline"
          >
            Next Lesson →
          </Link>
        ) : (
          <Link
            href={`/learn/${subject?.slug ?? params.subject}/${course?.slug ?? params.course}`}
            className="btn-primary no-underline"
          >
            Complete Module ✓
          </Link>
        )}
      </div>
    </div>
  );
}
