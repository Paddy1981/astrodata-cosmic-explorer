"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// ── Existing components ────────────────────────────────────────────────────────
const LightCurveAnalyzer      = dynamic(() => import("./LightCurveAnalyzer"),      { ssr: false });
const StarFieldHunter          = dynamic(() => import("./StarFieldHunter"),          { ssr: false });
const TransitMethodAnimation   = dynamic(() => import("./TransitMethodAnimation"),   { ssr: false });
const RadialVelocityAnimation  = dynamic(() => import("./RadialVelocityAnimation"),  { ssr: false });
const DirectImagingAnimation   = dynamic(() => import("./DirectImagingAnimation"),   { ssr: false });
const MicrolensAnimation       = dynamic(() => import("./MicrolensAnimation"),       { ssr: false });

// ── New animation components ───────────────────────────────────────────────────
const PlanetSizeSlider              = dynamic(() => import("./PlanetSizeSlider"),              { ssr: false });
const OrbitalMechanicsAnimation     = dynamic(() => import("./OrbitalMechanicsAnimation"),     { ssr: false });
const HabitableZoneAnimation        = dynamic(() => import("./HabitableZoneAnimation"),        { ssr: false });
const PlanetTypeComparison          = dynamic(() => import("./PlanetTypeComparison"),          { ssr: false });
const StarFormationAnimation        = dynamic(() => import("./StarFormationAnimation"),        { ssr: false });
const HRDiagramInteractive          = dynamic(() => import("./HRDiagramInteractive"),          { ssr: false });
const StellarSpectraAnimation       = dynamic(() => import("./StellarSpectraAnimation"),       { ssr: false });
const StellarEvolutionAnimation     = dynamic(() => import("./StellarEvolutionAnimation"),     { ssr: false });
const SolarSystemOrrery             = dynamic(() => import("./SolarSystemOrrery"),             { ssr: false });
const BlackHoleLensing              = dynamic(() => import("./BlackHoleLensing"),              { ssr: false });
const AccretionDiskAnimation        = dynamic(() => import("./AccretionDiskAnimation"),        { ssr: false });
const GravWaveAnimation             = dynamic(() => import("./GravWaveAnimation"),             { ssr: false });

// ── Expansion animation components ────────────────────────────────────────────
const TransmissionSpectraAnimation  = dynamic(() => import("./TransmissionSpectraAnimation"),  { ssr: false });
const BiosignatureSpectraAnimation  = dynamic(() => import("./BiosignatureSpectraAnimation"),  { ssr: false });
const CepheidAnimation              = dynamic(() => import("./CepheidAnimation"),              { ssr: false });
const EclipsingBinaryAnimation      = dynamic(() => import("./EclipsingBinaryAnimation"),      { ssr: false });
const TidalHeatingAnimation         = dynamic(() => import("./TidalHeatingAnimation"),         { ssr: false });
const TimeDilationAnimation         = dynamic(() => import("./TimeDilationAnimation"),         { ssr: false });
const SpacetimeCurvatureAnimation   = dynamic(() => import("./SpacetimeCurvatureAnimation"),   { ssr: false });
const CosmicExpansionAnimation      = dynamic(() => import("./CosmicExpansionAnimation"),      { ssr: false });
const CMBAnimation                  = dynamic(() => import("./CMBAnimation"),                  { ssr: false });
const DarkEnergyAnimation           = dynamic(() => import("./DarkEnergyAnimation"),           { ssr: false });
const GalaxyMorphologyAnimation     = dynamic(() => import("./GalaxyMorphologyAnimation"),     { ssr: false });
const GalaxyRotationCurveAnimation  = dynamic(() => import("./GalaxyRotationCurveAnimation"),  { ssr: false });
const EMSpectrumAnimation           = dynamic(() => import("./EMSpectrumAnimation"),           { ssr: false });
const TelescopeOpticsAnimation      = dynamic(() => import("./TelescopeOpticsAnimation"),      { ssr: false });
const DrakeEquationInteractive      = dynamic(() => import("./DrakeEquationInteractive"),      { ssr: false });

export type Segment =
  | { type: "html"; htmlContent: string }
  | { type: "callout"; calloutType: string; htmlContent: string }
  | { type: "quiz"; question: string; options: string[]; correct: number; explanation: string }
  | { type: "interactive"; interactiveType: string; config: Record<string, string> };

interface Props {
  segments: Segment[];
  lessonId: string;
  xpReward: number;
  isCompleted: boolean;
  nextHref: string;
  isLastLesson: boolean;
  color: string;
}

const CALLOUT_META: Record<string, { icon: string; bg: string; border: string; label: string; lc: string }> = {
  note:     { icon: "💡", bg: "bg-[#0d1f33]", border: "border-[#58a6ff]/30", label: "Note",        lc: "text-[#58a6ff]" },
  key:      { icon: "🔑", bg: "bg-[#1f1200]", border: "border-[#f0883e]/30", label: "Key Insight", lc: "text-[#f0883e]" },
  formula:  { icon: "∑",  bg: "bg-[#150d2a]", border: "border-[#bc8cff]/30", label: "Formula",     lc: "text-[#bc8cff]" },
  exercise: { icon: "🎯", bg: "bg-[#071a07]", border: "border-[#3fb950]/30", label: "Try It",      lc: "text-[#3fb950]" },
};

export default function LessonContent({
  segments, lessonId, xpReward, isCompleted: initiallyDone,
  nextHref, isLastLesson, color,
}: Props) {
  const quizCount = segments.filter(s => s.type === "quiz").length;
  const [answers, setAnswers] = useState<(number | null)[]>(Array(quizCount).fill(null));
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(initiallyDone);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpBurst, setShowXpBurst] = useState(false);

  async function handleComplete() {
    if (completing || completed) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/learn/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleted(true);
        if (!data.alreadyDone) {
          setXpEarned(data.xpEarned ?? xpReward);
          setShowXpBurst(true);
          setTimeout(() => setShowXpBurst(false), 3500);
        }
      }
    } catch {
      // ignore network errors — UI stays idle
    } finally {
      setCompleting(false);
    }
  }

  let quizIdx = 0;

  return (
    <div>
      {segments.map((seg, i) => {
        // ── HTML segment ───────────────────────────────────────────
        if (seg.type === "html") {
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: seg.htmlContent }}
            />
          );
        }

        // ── Callout segment ────────────────────────────────────────
        if (seg.type === "callout") {
          const meta = CALLOUT_META[seg.calloutType] ?? CALLOUT_META.note;
          return (
            <div key={i} className={`my-6 rounded-xl border ${meta.border} ${meta.bg} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg leading-none">{meta.icon}</span>
                <span className={`text-xs font-bold ${meta.lc} uppercase tracking-widest`}>{meta.label}</span>
              </div>
              <div
                className="text-[#c9d1d9] text-sm leading-relaxed space-y-1"
                dangerouslySetInnerHTML={{ __html: seg.htmlContent }}
              />
            </div>
          );
        }

        // ── Quiz segment ───────────────────────────────────────────
        if (seg.type === "quiz") {
          const qi = quizIdx++;
          const selected = answers[qi];
          const answered = selected !== null;
          const isCorrect = selected === seg.correct;

          const setAnswer = (oi: number) => {
            if (answered) return;
            const next = [...answers];
            next[qi] = oi;
            setAnswers(next);
          };

          return (
            <div key={i} className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-lg">
              {/* Header */}
              <div className="bg-[#161b22] px-5 py-3 border-b border-[#30363d] flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">
                  ✦ Check your understanding
                </span>
              </div>

              <div className="p-5 bg-[#0d1117]">
                <p className="text-[#e6edf3] font-medium mb-5 leading-relaxed text-[15px]">
                  {seg.question}
                </p>

                <div className="space-y-2.5">
                  {seg.options.map((opt, oi) => {
                    const isSelected = selected === oi;
                    const isRight = oi === seg.correct;
                    let cls =
                      "w-full text-left px-4 py-3.5 rounded-lg border text-sm transition-all duration-200 ";
                    if (!answered) {
                      cls += "border-[#30363d] text-[#c9d1d9] hover:border-[#58a6ff]/60 hover:bg-[#0d1f33] cursor-pointer";
                    } else if (isRight) {
                      cls += "border-green-500 bg-green-500/10 text-green-200 cursor-default";
                    } else if (isSelected) {
                      cls += "border-red-500/70 bg-red-500/10 text-red-300 cursor-default";
                    } else {
                      cls += "border-[#21262d] text-[#484f58] cursor-default opacity-50";
                    }

                    return (
                      <button key={oi} className={cls} disabled={answered} onClick={() => setAnswer(oi)}>
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold transition-all ${
                              answered && isRight
                                ? "border-green-500 text-green-400 bg-green-500/20"
                                : answered && isSelected
                                ? "border-red-500 text-red-400 bg-red-500/20"
                                : "border-[#30363d] text-[#8b949e]"
                            }`}
                          >
                            {answered && isRight ? "✓" : answered && isSelected ? "✗" : String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`mt-4 p-4 rounded-lg text-sm leading-relaxed border ${
                        isCorrect
                          ? "bg-green-500/8 border-green-500/25 text-green-300"
                          : "bg-orange-500/8 border-orange-500/25 text-orange-300"
                      }`}
                    >
                      <span className="font-semibold">{isCorrect ? "✓ Correct! " : "Not quite — "}</span>
                      {seg.explanation}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }

        // ── Interactive segment ────────────────────────────────────
        if (seg.type === "interactive") {
          // ── Existing types ──
          if (seg.interactiveType === "light-curve") {
            return <LightCurveAnalyzer key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "star-field") {
            return <StarFieldHunter key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "transit-method") {
            return <TransitMethodAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "radial-velocity") {
            return <RadialVelocityAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "direct-imaging") {
            return <DirectImagingAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "microlensing") {
            return <MicrolensAnimation key={i} description={seg.config.description} />;
          }

          // ── New types ──────────────────────────────────────────
          if (seg.interactiveType === "planet-size") {
            return <PlanetSizeSlider key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "orbital-mechanics") {
            return <OrbitalMechanicsAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "habitable-zone") {
            return <HabitableZoneAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "planet-types") {
            return <PlanetTypeComparison key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "star-formation") {
            return <StarFormationAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "hr-diagram") {
            return <HRDiagramInteractive key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "stellar-spectra") {
            return <StellarSpectraAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "stellar-evolution") {
            return <StellarEvolutionAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "solar-system") {
            return <SolarSystemOrrery key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "black-hole-lensing" || seg.interactiveType === "schwarzschild") {
            return <BlackHoleLensing key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "accretion-disk") {
            return <AccretionDiskAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "grav-waves") {
            return <GravWaveAnimation key={i} description={seg.config.description} />;
          }

          // ── Expansion types ────────────────────────────────────────
          if (seg.interactiveType === "transmission-spectra") {
            return <TransmissionSpectraAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "biosignature-spectra") {
            return <BiosignatureSpectraAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "cepheid") {
            return <CepheidAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "eclipsing-binary") {
            return <EclipsingBinaryAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "tidal-heating") {
            return <TidalHeatingAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "time-dilation") {
            return <TimeDilationAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "spacetime-curvature") {
            return <SpacetimeCurvatureAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "cosmic-expansion") {
            return <CosmicExpansionAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "cmb") {
            return <CMBAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "dark-energy") {
            return <DarkEnergyAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "galaxy-morphology") {
            return <GalaxyMorphologyAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "galaxy-rotation") {
            return <GalaxyRotationCurveAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "em-spectrum") {
            return <EMSpectrumAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "telescope-optics") {
            return <TelescopeOpticsAnimation key={i} description={seg.config.description} />;
          }
          if (seg.interactiveType === "drake-equation") {
            return <DrakeEquationInteractive key={i} description={seg.config.description} />;
          }
          return null;
        }

        return null;
      })}

      {/* ── Completion bar ─────────────────────────────────────── */}
      <div className="mt-12 pt-8 border-t border-[#30363d]">
        {quizCount > 0 && (
          <p className="text-xs text-[#8b949e] mb-4">
            {answers.filter(a => a !== null).length} / {quizCount} questions answered
          </p>
        )}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Complete button */}
          <div className="relative">
            <AnimatePresence>
              {showXpBurst && (
                <motion.div
                  key="xpburst"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -44 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-0 top-0 text-base font-bold text-yellow-400 whitespace-nowrap pointer-events-none"
                >
                  +{xpEarned} XP ✨
                </motion.div>
              )}
            </AnimatePresence>

            {completed ? (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-xs">✓</span>
                Lesson complete
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${color} 0%, #bc8cff 100%)` }}
              >
                {completing ? "Saving…" : `Mark Complete · +${xpReward} XP`}
              </button>
            )}
          </div>

          {/* Next / Complete module */}
          <a href={nextHref} className="btn-primary no-underline text-sm px-6 py-2.5">
            {isLastLesson ? "Complete Module →" : "Next Lesson →"}
          </a>
        </div>
      </div>
    </div>
  );
}
