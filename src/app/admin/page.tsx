"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Tab = "subjects" | "courses" | "modules" | "lessons" | "seed";

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient();
  const [tab, setTab] = useState<Tab>("subjects");

  // ── Subjects ──
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState({ title: "", slug: "", icon_name: "🌌", description: "", color: "#58a6ff", order: 0 });

  // ── Courses ──
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourse, setNewCourse] = useState({ subject_id: "", title: "", slug: "", level_tag: "", estimated_hours: "", status: "draft", order: 0 });

  // ── Modules ──
  const [modules, setModules] = useState<any[]>([]);
  const [newModule, setNewModule] = useState({ course_id: "", title: "", order: 0 });

  // ── Lessons ──
  const [lessons, setLessons] = useState<any[]>([]);
  const [newLesson, setNewLesson] = useState({ module_id: "", title: "", slug: "", content_type: "concept", content_mdx: "", xp_reward: 50, difficulty_level: "beginner", order: 0 });

  // ── Seed ──
  const [seedStatus, setSeedStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [seedMsg, setSeedMsg] = useState("");

  const [msg, setMsg] = useState("");

  async function load() {
    const [s, c, m, l] = await Promise.all([
      supabase.from("subjects").select("*").order("order"),
      supabase.from("courses").select("*, subjects(title)").order("order"),
      supabase.from("modules").select("*, courses(title)").order("order"),
      supabase.from("lessons").select("*, modules(title)").order("order"),
    ]);
    setSubjects(s.data ?? []);
    setCourses(c.data ?? []);
    setModules(m.data ?? []);
    setLessons(l.data ?? []);
  }

  useEffect(() => { load(); }, []);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function addSubject(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("subjects").insert(newSubject);
    if (error) flash("Error: " + error.message);
    else { flash("Subject added!"); load(); setNewSubject({ title: "", slug: "", icon_name: "🌌", description: "", color: "#58a6ff", order: 0 }); }
  }

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...newCourse, level_tag: newCourse.level_tag.split(",").map(s => s.trim()).filter(Boolean), estimated_hours: newCourse.estimated_hours ? Number(newCourse.estimated_hours) : null };
    const { error } = await supabase.from("courses").insert(payload);
    if (error) flash("Error: " + error.message);
    else { flash("Course added!"); load(); }
  }

  async function addModule(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("modules").insert(newModule);
    if (error) flash("Error: " + error.message);
    else { flash("Module added!"); load(); }
  }

  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("lessons").insert({ ...newLesson, xp_reward: Number(newLesson.xp_reward), order: Number(newLesson.order) });
    if (error) flash("Error: " + error.message);
    else { flash("Lesson added!"); load(); }
  }

  async function runSeed() {
    setSeedStatus("running");
    setSeedMsg("Running Phase 1…");
    const r1 = await fetch("/api/admin/seed", { method: "POST" });
    const j1 = await r1.json();
    if (!r1.ok) { setSeedStatus("error"); setSeedMsg(j1.error ?? "Phase 1 failed."); return; }

    setSeedMsg("Running Phase 2…");
    const r2 = await fetch("/api/admin/seed-expansion", { method: "POST" });
    const j2 = await r2.json();
    if (!r2.ok) { setSeedStatus("error"); setSeedMsg(j2.error ?? "Phase 2 failed."); return; }

    setSeedStatus("done");
    setSeedMsg(`All content seeded — 4 subjects · 12 courses · 53 lessons`);
    load();
  }

  const inputCls = "w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-sm focus:outline-none focus:border-[#58a6ff] transition-colors";
  const labelCls = "block text-xs text-[#8b949e] mb-1";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#e6edf3] mb-6">Content Management</h1>

      {msg && <div className="mb-4 p-3 rounded-lg bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] text-sm">{msg}</div>}

      <div className="tab-nav">
        {(["subjects", "courses", "modules", "lessons", "seed"] as Tab[]).map(t => (
          <button key={t} className={`tab-btn capitalize ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Subjects */}
      {tab === "subjects" && (
        <div className="space-y-6">
          <form onSubmit={addSubject} className="cosmic-card p-6 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 font-semibold text-[#e6edf3]">Add Subject</h3>
            <div><label className={labelCls}>Title</label><input className={inputCls} required value={newSubject.title} onChange={e => setNewSubject(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className={labelCls}>Slug</label><input className={inputCls} required value={newSubject.slug} onChange={e => setNewSubject(p => ({ ...p, slug: e.target.value }))} placeholder="exoplanets" /></div>
            <div><label className={labelCls}>Icon</label><input className={inputCls} value={newSubject.icon_name} onChange={e => setNewSubject(p => ({ ...p, icon_name: e.target.value }))} /></div>
            <div><label className={labelCls}>Color</label><input className={inputCls} value={newSubject.color} onChange={e => setNewSubject(p => ({ ...p, color: e.target.value }))} /></div>
            <div className="col-span-2"><label className={labelCls}>Description</label><input className={inputCls} value={newSubject.description} onChange={e => setNewSubject(p => ({ ...p, description: e.target.value }))} /></div>
            <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={newSubject.order} onChange={e => setNewSubject(p => ({ ...p, order: Number(e.target.value) }))} /></div>
            <div className="flex items-end"><button type="submit" className="btn-primary w-full justify-center">Add Subject</button></div>
          </form>
          <div className="cosmic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e]">
                <th className="p-3">Title</th><th className="p-3">Slug</th><th className="p-3">Color</th><th className="p-3">Order</th>
              </tr></thead>
              <tbody>{subjects.map(s => <tr key={s.id} className="border-b border-[#30363d]/50 text-[#c9d1d9]">
                <td className="p-3">{s.title}</td><td className="p-3 font-mono text-xs">{s.slug}</td>
                <td className="p-3"><span className="badge" style={{ background: s.color + "30", color: s.color }}>{s.color}</span></td>
                <td className="p-3">{s.order}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <div className="space-y-6">
          <form onSubmit={addCourse} className="cosmic-card p-6 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 font-semibold text-[#e6edf3]">Add Course</h3>
            <div><label className={labelCls}>Subject</label>
              <select className={inputCls} required value={newCourse.subject_id} onChange={e => setNewCourse(p => ({ ...p, subject_id: e.target.value }))}>
                <option value="">Select subject…</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Title</label><input className={inputCls} required value={newCourse.title} onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className={labelCls}>Slug</label><input className={inputCls} required value={newCourse.slug} onChange={e => setNewCourse(p => ({ ...p, slug: e.target.value }))} /></div>
            <div><label className={labelCls}>Level Tags (comma-sep)</label><input className={inputCls} value={newCourse.level_tag} onChange={e => setNewCourse(p => ({ ...p, level_tag: e.target.value }))} placeholder="beginner, intermediate" /></div>
            <div><label className={labelCls}>Est. Hours</label><input type="number" className={inputCls} value={newCourse.estimated_hours} onChange={e => setNewCourse(p => ({ ...p, estimated_hours: e.target.value }))} /></div>
            <div><label className={labelCls}>Status</label>
              <select className={inputCls} value={newCourse.status} onChange={e => setNewCourse(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="coming_soon">Coming Soon</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end"><button type="submit" className="btn-primary">Add Course</button></div>
          </form>
          <div className="cosmic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e]">
                <th className="p-3">Title</th><th className="p-3">Subject</th><th className="p-3">Status</th><th className="p-3">Slug</th>
              </tr></thead>
              <tbody>{courses.map(c => <tr key={c.id} className="border-b border-[#30363d]/50 text-[#c9d1d9]">
                <td className="p-3">{c.title}</td><td className="p-3">{c.subjects?.title}</td>
                <td className="p-3"><span className={`badge ${c.status === "published" ? "badge-green" : "badge-orange"}`}>{c.status}</span></td>
                <td className="p-3 font-mono text-xs">{c.slug}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules */}
      {tab === "modules" && (
        <div className="space-y-6">
          <form onSubmit={addModule} className="cosmic-card p-6 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 font-semibold text-[#e6edf3]">Add Module</h3>
            <div><label className={labelCls}>Course</label>
              <select className={inputCls} required value={newModule.course_id} onChange={e => setNewModule(p => ({ ...p, course_id: e.target.value }))}>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Title</label><input className={inputCls} required value={newModule.title} onChange={e => setNewModule(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={newModule.order} onChange={e => setNewModule(p => ({ ...p, order: Number(e.target.value) }))} /></div>
            <div className="flex items-end"><button type="submit" className="btn-primary w-full justify-center">Add Module</button></div>
          </form>
          <div className="cosmic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e]"><th className="p-3">Title</th><th className="p-3">Course</th><th className="p-3">Order</th></tr></thead>
              <tbody>{modules.map(m => <tr key={m.id} className="border-b border-[#30363d]/50 text-[#c9d1d9]">
                <td className="p-3">{m.title}</td><td className="p-3">{m.courses?.title}</td><td className="p-3">{m.order}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lessons */}
      {tab === "lessons" && (
        <div className="space-y-6">
          <form onSubmit={addLesson} className="cosmic-card p-6 grid grid-cols-2 gap-4">
            <h3 className="col-span-2 font-semibold text-[#e6edf3]">Add Lesson</h3>
            <div><label className={labelCls}>Module</label>
              <select className={inputCls} required value={newLesson.module_id} onChange={e => setNewLesson(p => ({ ...p, module_id: e.target.value }))}>
                <option value="">Select module…</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title} ({m.courses?.title})</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Title</label><input className={inputCls} required value={newLesson.title} onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className={labelCls}>Slug</label><input className={inputCls} required value={newLesson.slug} onChange={e => setNewLesson(p => ({ ...p, slug: e.target.value }))} /></div>
            <div><label className={labelCls}>Content Type</label>
              <select className={inputCls} value={newLesson.content_type} onChange={e => setNewLesson(p => ({ ...p, content_type: e.target.value }))}>
                <option value="concept">Concept</option><option value="interactive">Interactive</option><option value="data_exercise">Data Exercise</option><option value="quiz">Quiz</option>
              </select>
            </div>
            <div><label className={labelCls}>XP Reward</label><input type="number" className={inputCls} value={newLesson.xp_reward} onChange={e => setNewLesson(p => ({ ...p, xp_reward: Number(e.target.value) }))} /></div>
            <div><label className={labelCls}>Difficulty</label>
              <select className={inputCls} value={newLesson.difficulty_level} onChange={e => setNewLesson(p => ({ ...p, difficulty_level: e.target.value }))}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={newLesson.order} onChange={e => setNewLesson(p => ({ ...p, order: Number(e.target.value) }))} /></div>
            <div className="col-span-2"><label className={labelCls}>Content (MDX/Markdown)</label>
              <textarea rows={6} className={inputCls} value={newLesson.content_mdx} onChange={e => setNewLesson(p => ({ ...p, content_mdx: e.target.value }))} placeholder="Write lesson content here…" />
            </div>
            <div className="col-span-2 flex justify-end"><button type="submit" className="btn-primary">Add Lesson</button></div>
          </form>
          <div className="cosmic-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#30363d] text-left text-xs text-[#8b949e]"><th className="p-3">Title</th><th className="p-3">Module</th><th className="p-3">Type</th><th className="p-3">XP</th></tr></thead>
              <tbody>{lessons.map(l => <tr key={l.id} className="border-b border-[#30363d]/50 text-[#c9d1d9]">
                <td className="p-3">{l.title}</td><td className="p-3">{l.modules?.title}</td>
                <td className="p-3"><span className="badge badge-blue">{l.content_type}</span></td>
                <td className="p-3">{l.xp_reward}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seed */}
      {tab === "seed" && (
        <div className="max-w-lg mx-auto mt-4">
          <div className="cosmic-card p-8 text-center">
            <div className="text-4xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">Re-seed All Content</h3>
            <p className="text-[#8b949e] text-sm mb-2">
              Upserts the full content library — all subjects, courses, modules, and lessons.
              Safe to run at any time; existing data is updated in place.
            </p>
            <div className="flex justify-center gap-6 text-xs text-[#484f58] mb-6">
              <span>4 subjects</span>
              <span>·</span>
              <span>12 courses</span>
              <span>·</span>
              <span>53 lessons</span>
            </div>
            {seedMsg && (
              <div className={`mb-5 p-3 rounded-lg text-sm ${seedStatus === "error" ? "bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149]" : "bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950]"}`}>
                {seedMsg}
              </div>
            )}
            <button
              onClick={runSeed}
              disabled={seedStatus === "running"}
              className="btn-primary disabled:opacity-60"
            >
              {seedStatus === "running" ? seedMsg || "Seeding…" : "Run Seed"}
            </button>
            {seedStatus === "done" && (
              <p className="mt-3 text-xs text-[#484f58]">Done. Refresh the Subjects / Courses / Lessons tabs to verify.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
