import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import LessonContent, { type Segment } from "./LessonContent";

interface Props {
  params: {
    subject: string;
    course: string;
    module: string;
    lesson: string;
  };
}

// ── Markdown → HTML (server-side only) ─────────────────────────────────────
function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineMd(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /`(.+?)`/g,
      '<code class="bg-[#0d1117] px-1.5 py-0.5 rounded text-[#58a6ff] text-sm font-mono border border-[#30363d]">$1</code>'
    )
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[#58a6ff] underline hover:opacity-80">$1</a>');
}

function renderLines(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let inCode = false;
  const codeLines: string[] = [];

  const closeOpen = (line: string) => {
    if (inUl && !line.startsWith("- ") && !line.startsWith("* ")) {
      out.push("</ul>"); inUl = false;
    }
    if (inOl && !/^\d+\. /.test(line)) {
      out.push("</ol>"); inOl = false;
    }
    if (inTable && !line.startsWith("|")) {
      out.push("</tbody></table></div>"); inTable = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Code fence toggle
    if (line.startsWith("```")) {
      if (!inCode) { inCode = true; codeLines.length = 0; }
      else {
        out.push(
          `<pre class="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 my-5 overflow-x-auto text-sm font-mono text-[#e6edf3] leading-relaxed">${codeLines.map(escHtml).join("\n")}</pre>`
        );
        inCode = false;
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    closeOpen(line);

    if (!line) { out.push('<div class="h-4"></div>'); continue; }

    // Headings
    if (line.startsWith("### ")) {
      out.push(`<h3 class="text-base font-semibold text-[#e6edf3] mt-7 mb-2 border-l-2 border-[#58a6ff]/40 pl-3">${inlineMd(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(`<h2 class="text-xl font-bold text-[#e6edf3] mt-10 mb-4">${inlineMd(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(`<h1 class="text-2xl font-bold text-[#e6edf3] mt-2 mb-5">${inlineMd(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      out.push(
        `<div class="border-l-4 border-[#58a6ff] pl-4 py-2 my-4 bg-[#0d1f33] rounded-r-lg"><p class="text-[#c9d1d9] italic leading-relaxed">${inlineMd(line.slice(2))}</p></div>`
      );
      continue;
    }

    // HR
    if (line === "---") { out.push('<hr class="border-[#30363d] my-8" />'); continue; }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inUl) { out.push('<ul class="space-y-2 my-4 pl-2">'); inUl = true; }
      out.push(
        `<li class="flex gap-3 text-[#c9d1d9] leading-relaxed"><span class="text-[#58a6ff] mt-1 shrink-0 font-bold">•</span><span>${inlineMd(line.slice(2))}</span></li>`
      );
      continue;
    }

    // Ordered list
    const olM = line.match(/^(\d+)\. (.*)/);
    if (olM) {
      if (!inOl) { out.push('<ol class="space-y-2.5 my-4 pl-2 list-none">'); inOl = true; }
      out.push(
        `<li class="flex gap-3 text-[#c9d1d9] leading-relaxed"><span class="w-6 h-6 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center text-xs font-bold text-[#58a6ff] shrink-0">${olM[1]}</span><span>${inlineMd(olM[2])}</span></li>`
      );
      continue;
    }

    // Table
    if (line.startsWith("|")) {
      if (!inTable) {
        out.push('<div class="overflow-x-auto my-6 rounded-xl border border-[#30363d]"><table class="w-full text-sm border-collapse">');
        inTable = true;
      }
      const cells = line.split("|").filter((_, i, a) => i > 0 && i < a.length - 1);
      if (cells.every(c => /^[-: ]+$/.test(c))) continue; // separator
      const isHeader = !out.some(h => h.includes("<tbody>"));
      if (isHeader && !out.some(h => h.includes("<thead>"))) {
        out.push("<thead>");
        out.push(
          `<tr class="bg-[#161b22]">${cells.map(c => `<th class="text-left px-4 py-3 text-[#8b949e] font-semibold text-xs uppercase tracking-wider">${inlineMd(c.trim())}</th>`).join("")}</tr>`
        );
        out.push("</thead><tbody>");
      } else {
        out.push(
          `<tr class="border-t border-[#30363d] hover:bg-[#161b22]/50 transition-colors">${cells.map(c => `<td class="px-4 py-3 text-[#c9d1d9]">${inlineMd(c.trim())}</td>`).join("")}</tr>`
        );
      }
      continue;
    }

    out.push(`<p class="text-[#c9d1d9] leading-[1.8] my-3 text-[15px]">${inlineMd(line)}</p>`);
  }

  if (inUl)  out.push("</ul>");
  if (inOl)  out.push("</ol>");
  if (inTable) out.push("</tbody></table></div>");
  if (inCode)
    out.push(
      `<pre class="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 my-5 overflow-x-auto text-sm font-mono text-[#e6edf3]">${codeLines.map(escHtml).join("\n")}</pre>`
    );

  return out.join("\n");
}

// ── Quiz block parser ────────────────────────────────────────────────────────
function parseQuizBlock(content: string): Extract<Segment, { type: "quiz" }> {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  let question = "";
  const options: string[] = [];
  let correct = 0;
  let explanation = "";

  for (const line of lines) {
    if (line.startsWith("question:")) {
      question = line.slice("question:".length).trim();
    } else if (line.startsWith("- ")) {
      options.push(line.slice(2).trim());
    } else if (line.startsWith("correct:")) {
      correct = parseInt(line.slice("correct:".length).trim(), 10);
    } else if (line.startsWith("explanation:")) {
      explanation = line.slice("explanation:".length).trim();
    } else if (explanation) {
      explanation += " " + line; // multi-line explanation
    }
  }

  return { type: "quiz", question, options, correct, explanation };
}

// ── MDX → Segments (server-side parse) ──────────────────────────────────────
function parseMdxSegments(mdx: string): Segment[] {
  const segments: Segment[] = [];
  const blockRe = /:::(\w+)\n([\s\S]*?)\n:::/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRe.exec(mdx)) !== null) {
    if (match.index > lastIndex) {
      const chunk = mdx.slice(lastIndex, match.index).trim();
      if (chunk) segments.push({ type: "html", htmlContent: renderLines(chunk) });
    }

    const blockType = match[1];
    const blockContent = match[2];

    if (blockType === "quiz") {
      segments.push(parseQuizBlock(blockContent));
    } else {
      segments.push({
        type: "callout",
        calloutType: blockType,
        htmlContent: renderLines(blockContent),
      });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < mdx.length) {
    const remaining = mdx.slice(lastIndex).trim();
    if (remaining) segments.push({ type: "html", htmlContent: renderLines(remaining) });
  }

  return segments;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function LessonPage({ params }: Props) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", params.lesson)
    .single();

  if (!lesson) notFound();

  // Module + course + subject
  const { data: mod } = lesson.module_id
    ? await supabase
        .from("modules")
        .select("id, title, courses(id, title, slug, subject_id)")
        .eq("id", lesson.module_id)
        .single()
    : { data: null };

  const course = (mod as any)?.courses ?? null;
  const { data: subject } = course?.subject_id
    ? await supabase.from("subjects").select("title, slug, color").eq("id", course.subject_id).single()
    : { data: null };

  const color: string = (subject as any)?.color ?? "#58a6ff";
  const subjectSlug = (subject as any)?.slug ?? params.subject;
  const courseSlug = course?.slug ?? params.course;
  const coursePath = `/learn/${subjectSlug}/${courseSlug}`;

  // All lessons in module (for sidebar)
  const { data: modLessons } = lesson.module_id
    ? await supabase
        .from("lessons")
        .select("id, slug, title, xp_reward, order_index")
        .eq("module_id", lesson.module_id)
        .order("order_index")
    : { data: [] };

  const sorted = [...(modLessons ?? [])].sort(
    (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  // User progress for sidebar dots
  const lessonIds = sorted.map((l: any) => l.id);
  const { data: progressRows } = user && lessonIds.length > 0
    ? await supabase
        .from("user_progress")
        .select("lesson_id, status")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [] };

  const completedIds = new Set(
    (progressRows ?? []).filter((p: any) => p.status === "completed").map((p: any) => p.lesson_id)
  );
  const isCompleted = completedIds.has(lesson.id);

  const currentIdx = sorted.findIndex((l: any) => l.id === lesson.id);
  const nextLesson = sorted[currentIdx + 1] ?? null;
  const nextHref = nextLesson
    ? `/learn/${params.subject}/${params.course}/${params.module}/${nextLesson.slug}`
    : coursePath;

  const segments = parseMdxSegments(lesson.content_mdx ?? "");

  const typeLabel: Record<string, string> = {
    concept: "Reading",
    interactive: "Interactive",
    data_exercise: "Data Exercise",
    quiz: "Quiz",
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* ── Top progress bar ─────────────────────────────────── */}
      <div className="border-b border-[#30363d] bg-[#0d1117] px-4 sm:px-8 py-3 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href={coursePath}
            className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline flex items-center gap-1.5 transition-colors"
          >
            ← {course?.title ?? "Course"}
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#8b949e]">
            {sorted.length > 0 && (
              <>
                <span>
                  Lesson {currentIdx + 1} of {sorted.length}
                </span>
                <div className="w-28 h-1.5 bg-[#21262d] rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((currentIdx + 1) / sorted.length) * 100)}%`,
                      background: color,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            {mod && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Module</p>
                <h2 className="text-sm font-semibold text-[#e6edf3] leading-snug">{(mod as any).title}</h2>
              </div>
            )}

            <div className="space-y-1">
              {sorted.map((l: any, i: number) => {
                const isCurrent = l.id === lesson.id;
                const isDone = completedIds.has(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/learn/${params.subject}/${params.course}/${params.module}/${l.slug}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors ${
                      isCurrent
                        ? "bg-[#161b22] text-[#e6edf3]"
                        : "text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22]/60"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold transition-all ${
                        isDone
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : isCurrent
                          ? "border-[#58a6ff] text-[#58a6ff]"
                          : "border-[#30363d] text-[#484f58]"
                      }`}
                      style={isCurrent && !isDone ? { borderColor: color, color } : {}}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="flex-1 leading-snug text-xs">{l.title}</span>
                    {l.xp_reward && (
                      <span className="text-[10px] text-[#484f58] shrink-0">+{l.xp_reward}</span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Module total XP */}
            {sorted.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#21262d] text-xs text-[#8b949e] flex items-center justify-between">
                <span>Module XP</span>
                <span className="text-[#f0883e] font-medium">
                  {sorted.reduce((s: number, l: any) => s + (l.xp_reward ?? 0), 0)} XP
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="min-w-0">
          {/* Lesson header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="badge badge-blue text-xs">{typeLabel[lesson.content_type] ?? lesson.content_type}</span>
              <span className="badge badge-gold text-xs">+{lesson.xp_reward} XP</span>
              {lesson.difficulty_level && (
                <span className="badge badge-purple capitalize text-xs">{lesson.difficulty_level}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#e6edf3] leading-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Interactive lesson content */}
          {lesson.content_mdx ? (
            <div className="cosmic-card p-6 sm:p-8 mb-2">
              <LessonContent
                segments={segments}
                lessonId={lesson.id}
                xpReward={lesson.xp_reward ?? 50}
                isCompleted={isCompleted}
                nextHref={nextHref}
                isLastLesson={!nextLesson}
                color={color}
              />
            </div>
          ) : (
            <div className="cosmic-card p-12 text-center mb-8">
              <div className="text-5xl mb-4">🔭</div>
              <p className="text-[#8b949e]">Interactive content coming soon.</p>
              <div className="flex justify-end mt-8">
                <Link href={nextHref} className="btn-primary no-underline">
                  {!nextLesson ? "Complete Module →" : "Next Lesson →"}
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
