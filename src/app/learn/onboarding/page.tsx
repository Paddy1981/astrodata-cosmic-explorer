"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const TIERS = [
  { id: "explorer",   label: "Explorer",   icon: "🌍", desc: "Just starting out — I want fun, bite-sized space facts." },
  { id: "navigator",  label: "Navigator",  icon: "🧭", desc: "I know some basics and want to go deeper." },
  { id: "researcher", label: "Researcher", icon: "🔭", desc: "I'm comfortable with science and want real data challenges." },
  { id: "curious",    label: "Curious",    icon: "✨", desc: "I'm not sure yet — just show me what's interesting!" },
];

const SUBJECTS = [
  { id: "exoplanets",         label: "Exoplanets",         icon: "🪐", desc: "Worlds orbiting other stars" },
  { id: "stars",              label: "Stars",              icon: "⭐", desc: "Stellar physics and evolution" },
  { id: "orbital-mechanics",  label: "Orbital Mechanics",  icon: "🌀", desc: "How things move through space" },
];

const DRAFT_KEY = "astrolearn_onboarding_draft";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Restore draft
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        setStep(draft.step ?? 1);
        setName(draft.name ?? "");
        setTier(draft.tier ?? "");
        setInterests(draft.interests ?? []);
      }
    } catch {}
  }, []);

  // Save draft
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step, name, tier, interests }));
    } catch {}
  }, [step, name, tier, interests]);

  function toggleInterest(id: string) {
    setInterests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function finish() {
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated."); setSaving(false); return; }

    const { error: err } = await supabase
      .from("profiles")
      .update({
        display_name:        name.trim() || undefined,
        tier_level:          tier,
        subject_interests:   interests,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      sessionStorage.removeItem(DRAFT_KEY);
      router.push("/learn");
      router.refresh();
    }
  }

  const progressPercent = ((step - 1) / 4) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#8b949e]">Step {step} of 4</span>
            <span className="text-xs text-[#8b949e]">{Math.round(progressPercent)}%</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="cosmic-card p-8 animate-fade-in">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">What should we call you?</h2>
            <p className="text-[#8b949e] mb-6">This is your explorer name — your real name or a callsign.</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] text-base focus:outline-none focus:border-[#58a6ff] transition-colors mb-6"
              placeholder="e.g. Galileo, StarHunter, Alex..."
              autoFocus
            />
            <button onClick={() => setStep(2)} disabled={!name.trim()} className="btn-primary w-full justify-center">
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Tier */}
        {step === 2 && (
          <div className="cosmic-card p-8 animate-fade-in">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">What describes you best?</h2>
            <p className="text-[#8b949e] mb-6">We'll tune the content difficulty to your level.</p>
            <div className="space-y-3 mb-6">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${tier === t.id ? "border-[#58a6ff] bg-[#58a6ff]/10" : "border-[#30363d] bg-[#1c2333] hover:border-[#8b949e]"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <div className="font-semibold text-[#e6edf3]">{t.label}</div>
                      <div className="text-xs text-[#8b949e] mt-0.5">{t.desc}</div>
                    </div>
                    {tier === t.id && <span className="ml-auto text-[#58a6ff]">✓</span>}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">← Back</button>
              <button onClick={() => setStep(3)} disabled={!tier} className="btn-primary flex-1 justify-center">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="cosmic-card p-8 animate-fade-in">
            <div className="text-4xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold text-[#e6edf3] mb-2">What interests you?</h2>
            <p className="text-[#8b949e] mb-6">Select topics to personalise your dashboard.</p>
            <div className="space-y-3 mb-6">
              {SUBJECTS.map(s => {
                const selected = interests.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleInterest(s.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selected ? "border-[#58a6ff] bg-[#58a6ff]/10" : "border-[#30363d] bg-[#1c2333] hover:border-[#8b949e]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="font-semibold text-[#e6edf3]">{s.label}</div>
                        <div className="text-xs text-[#8b949e] mt-0.5">{s.desc}</div>
                      </div>
                      {selected && <span className="ml-auto text-[#58a6ff]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center">← Back</button>
              <button onClick={() => setStep(4)} disabled={interests.length === 0} className="btn-primary flex-1 justify-center">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Launch */}
        {step === 4 && (
          <div className="cosmic-card p-8 text-center animate-fade-in">
            <div className="text-6xl mb-6 animate-float">🚀</div>
            <h2 className="text-2xl font-bold text-[#e6edf3] mb-3">You're all set, {name}!</h2>
            <p className="text-[#8b949e] mb-2">
              Level: <span className="text-[#e6edf3] font-medium capitalize">{TIERS.find(t => t.id === tier)?.label}</span>
            </p>
            <p className="text-[#8b949e] mb-8">
              Interests: <span className="text-[#e6edf3] font-medium">
                {interests.map(i => SUBJECTS.find(s => s.id === i)?.label).join(", ")}
              </span>
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-sm">{error}</div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1 justify-center">← Edit</button>
              <button onClick={finish} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? "Launching…" : "Launch! 🌌"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
