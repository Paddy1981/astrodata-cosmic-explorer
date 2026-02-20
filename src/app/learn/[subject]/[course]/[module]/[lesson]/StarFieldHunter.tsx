"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Deterministic RNG ──────────────────────────────────────────────────────
function makeRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

// ── Light curve generation ─────────────────────────────────────────────────
interface StarConfig {
  id: number;
  kicId: string;
  hasTransit: boolean;
  period: number;
  depth: number;
  color: string;
  magnitude: number; // visual magnitude (affects star size/brightness)
}

const STAR_CONFIGS: StarConfig[] = [
  { id: 0, kicId: "KIC-757450", hasTransit: false, period: 2.1,   depth: 0,      color: "#fff5e0", magnitude: 11.3 },
  { id: 1, kicId: "KIC-892772", hasTransit: true,  period: 1.486, depth: 0.0142, color: "#ffe4b5", magnitude: 12.1 }, // KOI-17b
  { id: 2, kicId: "KIC-904843", hasTransit: false, period: 3.3,   depth: 0,      color: "#c8eeff", magnitude: 10.8 },
  { id: 3, kicId: "KIC-110029", hasTransit: false, period: 1.9,   depth: 0,      color: "#e8f4ff", magnitude: 13.2 },
  { id: 4, kicId: "KIC-138194", hasTransit: true,  period: 2.204, depth: 0.0089, color: "#ffd080", magnitude: 11.7 }, // TOI-style
  { id: 5, kicId: "KIC-219134", hasTransit: false, period: 2.8,   depth: 0,      color: "#f0f8ff", magnitude: 12.5 },
];

const TRANSIT_IDS = new Set(STAR_CONFIGS.filter(s => s.hasTransit).map(s => s.id));

// Pre-compute light curve data for all stars at module load
function generateLC(cfg: StarConfig, nPoints = 220): number[] {
  const rng = makeRNG(cfg.id * 0xDEAD + 0xBEEF);
  const TMAX = 5.0;
  const t0 = 0.4 + rng() * 0.8; // random first transit offset

  return Array.from({ length: nPoints }, (_, i) => {
    const t = (i / (nPoints - 1)) * TMAX;
    const noise = (rng() - 0.5) * 0.0022;
    if (!cfg.hasTransit) return 1 + noise;

    let flux = 1 + noise;
    let k = 0;
    while (t0 + k * cfg.period < TMAX + 0.5) {
      const tc = t0 + k * cfg.period;
      const dt = Math.abs(t - tc);
      const halfDur = cfg.period * 0.04;
      const ingress = halfDur * 0.25;
      if (dt < halfDur) {
        if (dt < halfDur - ingress) {
          flux = 1 - cfg.depth + noise;
        } else {
          const blend = (halfDur - dt) / ingress;
          flux = 1 - cfg.depth * Math.max(0, Math.min(1, blend)) + noise;
        }
        break;
      }
      k++;
    }
    return flux;
  });
}

// Background star field positions (deterministic)
const BG_STARS = (() => {
  const rng = makeRNG(0x5EED);
  return Array.from({ length: 55 }, () => ({
    cx: rng() * 100,
    cy: rng() * 100,
    r: rng() * 0.8 + 0.2,
    opacity: rng() * 0.45 + 0.15,
  }));
})();

const ALL_LC_DATA = STAR_CONFIGS.map(cfg => generateLC(cfg));

// ── Mini light curve SVG component ────────────────────────────────────────
function MiniLC({ fluxes, color, selected }: { fluxes: number[]; color: string; selected: boolean }) {
  const W = 130, H = 48;
  const minF = Math.min(...fluxes);
  const maxF = Math.max(...fluxes);
  const range = Math.max(maxF - minF, 0.004);
  const pad = 4;

  const pts = fluxes
    .map((f, i) => {
      const x = pad + (i / (fluxes.length - 1)) * (W - pad * 2);
      const y = H - pad - ((f - minF) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const baselineY = H - pad - ((1 - minF) / range) * (H - pad * 2);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Background */}
      <rect width={W} height={H} fill="#070b10" rx="6" />

      {/* Baseline */}
      <line x1={pad} y1={baselineY} x2={W - pad} y2={baselineY}
        stroke="#1a2030" strokeWidth="0.8" strokeDasharray="3,3" />

      {/* Curve */}
      <polyline points={pts} fill="none"
        stroke={selected ? "#58a6ff" : color}
        strokeWidth="1.4" strokeOpacity={selected ? 1 : 0.75}
      />
    </svg>
  );
}

// ── Star visual SVG ────────────────────────────────────────────────────────
function StarVisual({ cfg, discovered }: { cfg: StarConfig; discovered: boolean }) {
  const size = 14 + (14 - cfg.magnitude) * 1.4; // brighter = bigger
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
      <defs>
        <radialGradient id={`sg-${cfg.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={cfg.color} stopOpacity="1" />
          <stop offset="35%" stopColor={cfg.color} stopOpacity="0.55" />
          <stop offset="70%" stopColor={cfg.color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow halo */}
      <circle cx="40" cy="40" r={Math.min(34, size * 2.2)} fill={`url(#sg-${cfg.id})`} />
      {/* Star core */}
      <circle cx="40" cy="40" r={Math.max(3, size * 0.55)} fill={cfg.color} />
      {/* Diffraction spikes (for brighter stars) */}
      {cfg.magnitude < 12 && (
        <g stroke={cfg.color} strokeWidth="0.6" strokeOpacity="0.35">
          <line x1="40" y1={40 - size * 2} x2="40" y2={40 + size * 2} />
          <line x1={40 - size * 2} y1="40" x2={40 + size * 2} y2="40" />
        </g>
      )}
      {/* Planet ring — appears after discovery */}
      {discovered && (
        <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
          <circle cx="40" cy="40" r={size * 1.8} fill="none"
            stroke="#58a6ff" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4,3" />
          <text x="40" y="40" textAnchor="middle" dominantBaseline="middle"
            fontSize="16" style={{ userSelect: "none" }}>
            🪐
          </text>
        </motion.g>
      )}
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function StarFieldHunter({ description }: { description?: string }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(1); // start with first transit star focused

  function toggle(id: number) {
    if (submitted) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setActiveId(id);
  }

  const correctCount = useMemo(() => {
    let n = 0;
    for (const id of selected) if (TRANSIT_IDS.has(id)) n++;
    return n;
  }, [selected]);

  const falsePositives = useMemo(() => {
    let n = 0;
    for (const id of selected) if (!TRANSIT_IDS.has(id)) n++;
    return n;
  }, [selected]);

  const allCorrect = correctCount === TRANSIT_IDS.size && falsePositives === 0;

  const activeStar = STAR_CONFIGS.find(s => s.id === activeId);
  const activeLC = activeId !== null ? ALL_LC_DATA[activeId] : null;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1.5">
          🌌 Interactive · Planet Hunter
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Find the Exoplanets</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ??
            "Six stars from the Kepler field are shown below. Two of them have planets orbiting in front of them, causing periodic brightness dips. Study each star's light curve and flag the ones you think are exoplanet hosts."}
        </p>
      </div>

      <div className="p-4 sm:p-6 bg-[#090d14]">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-5">
          {/* ── Star field grid ─────────────────────────────────── */}
          <div>
            {/* Telescope FOV header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-[#484f58]">
                Kepler Field · Q4 · 5-day observation window
              </span>
              <span className="text-[10px] font-mono text-[#484f58]">
                {selected.size} / 2 flagged
              </span>
            </div>

            {/* Star cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STAR_CONFIGS.map(cfg => {
                const isSelected = selected.has(cfg.id);
                const isActive = activeId === cfg.id;
                const isTransit = TRANSIT_IDS.has(cfg.id);
                const discovered = submitted && isTransit;

                let borderStyle = "border-[#21262d]";
                if (submitted) {
                  if (isTransit && isSelected) borderStyle = "border-green-500";
                  else if (isTransit && !isSelected) borderStyle = "border-yellow-500/70";
                  else if (!isTransit && isSelected) borderStyle = "border-red-500/70";
                } else if (isSelected) {
                  borderStyle = "border-[#58a6ff]";
                } else if (isActive) {
                  borderStyle = "border-[#30363d]";
                }

                return (
                  <motion.button
                    key={cfg.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggle(cfg.id)}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 overflow-hidden ${borderStyle} ${
                      !submitted && isSelected
                        ? "bg-[#0d1f33]"
                        : isActive && !submitted
                        ? "bg-[#10151e]"
                        : "bg-[#0b0f17]"
                    } ${submitted ? "cursor-default" : "cursor-pointer hover:bg-[#10151e]"}`}
                  >
                    {/* Selection badge */}
                    {!submitted && isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#58a6ff] flex items-center justify-center text-[9px] text-white font-bold z-10"
                      >
                        ✓
                      </motion.div>
                    )}

                    {/* Result badge */}
                    {submitted && (
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold z-10 ${
                        isTransit && isSelected ? "bg-green-500 text-white" :
                        isTransit ? "bg-yellow-500 text-black" :
                        isSelected ? "bg-red-500 text-white" :
                        "bg-[#161b22] text-[#484f58]"
                      }`}>
                        {isTransit ? (isSelected ? "✓" : "!") : isSelected ? "✗" : "−"}
                      </div>
                    )}

                    {/* Starfield background */}
                    <div className="relative mb-2 overflow-hidden rounded-lg" style={{ background: "#02050a" }}>
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full"
                        style={{ height: 80 }}
                      >
                        {/* Background stars */}
                        {BG_STARS.slice(cfg.id * 8, cfg.id * 8 + 16).map((s, i) => (
                          <circle key={i}
                            cx={`${s.cx}%`} cy={`${s.cy}%`} r={s.r}
                            fill="white" fillOpacity={s.opacity}
                          />
                        ))}
                        {/* More random background stars */}
                        {BG_STARS.slice(20, 40).map((s, i) => (
                          <circle key={i + 20}
                            cx={`${(s.cx + cfg.id * 17) % 100}%`}
                            cy={`${(s.cy + cfg.id * 23) % 100}%`}
                            r={s.r * 0.7}
                            fill="white" fillOpacity={s.opacity * 0.6}
                          />
                        ))}
                        {/* Target star */}
                        <foreignObject x="25" y="10" width="50" height="80">
                          <div className="flex items-center justify-center h-full">
                            <StarVisual cfg={cfg} discovered={discovered} />
                          </div>
                        </foreignObject>
                      </svg>
                    </div>

                    {/* Mini light curve */}
                    <div className="mb-1.5" onClick={e => { e.stopPropagation(); setActiveId(cfg.id); }}>
                      <MiniLC
                        fluxes={ALL_LC_DATA[cfg.id]}
                        color={cfg.color}
                        selected={isSelected}
                      />
                    </div>

                    {/* Star info */}
                    <div className="mt-1.5">
                      <p className="text-[10px] font-mono text-[#8b949e] leading-tight">{cfg.kicId}</p>
                      <p className="text-[9px] text-[#484f58]">
                        {submitted && isTransit
                          ? `P = ${cfg.period}d · ΔF = ${(cfg.depth * 100).toFixed(2)}%`
                          : `Mag ${cfg.magnitude}`}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ── Detail panel ──────────────────────────────────── */}
          <div className="mt-5 lg:mt-0">
            <div className="sticky top-4">
              <div className="rounded-xl border border-[#30363d] overflow-hidden bg-[#0b0f17]">
                <div className="px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
                  <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-0.5">
                    Selected star
                  </p>
                  {activeStar ? (
                    <p className="text-sm font-mono text-[#e6edf3]">{activeStar.kicId}</p>
                  ) : (
                    <p className="text-sm text-[#484f58]">Click a star to inspect</p>
                  )}
                </div>

                {activeStar && activeLC ? (
                  <div className="p-4">
                    {/* Large LC for selected star */}
                    <LargeLC
                      fluxes={activeLC}
                      color={activeStar.color}
                      hasTransit={activeStar.hasTransit && submitted}
                    />
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#8b949e]">
                        <span>Magnitude</span>
                        <span className="font-mono text-[#c9d1d9]">{activeStar.magnitude}</span>
                      </div>
                      <div className="flex justify-between text-[#8b949e]">
                        <span>Observation</span>
                        <span className="font-mono text-[#c9d1d9]">5.0 days</span>
                      </div>
                      {submitted && activeStar.hasTransit && (
                        <>
                          <div className="flex justify-between text-[#8b949e]">
                            <span>Period</span>
                            <span className="font-mono text-green-400">{activeStar.period} days</span>
                          </div>
                          <div className="flex justify-between text-[#8b949e]">
                            <span>Depth</span>
                            <span className="font-mono text-green-400">{(activeStar.depth * 100).toFixed(2)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#484f58] text-xs">
                    Click a star card to inspect its light curve
                  </div>
                )}
              </div>

              {/* Hint */}
              {!submitted && (
                <p className="mt-3 text-[10px] text-[#484f58] text-center leading-relaxed px-2">
                  Tip: Transit dips are periodic (repeat at regular intervals) and have a characteristic flat bottom. Random noise is irregular.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Submit / Result ──────────────────────────────────── */}
        <div className="mt-6 pt-4 border-t border-[#21262d]">
          {!submitted ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-[#8b949e]">
                {selected.size === 0
                  ? "Flag stars that show periodic transit dips"
                  : `${selected.size} star${selected.size !== 1 ? "s" : ""} flagged as planet candidate${selected.size !== 1 ? "s" : ""}`}
              </p>
              <button
                onClick={() => setSubmitted(true)}
                disabled={selected.size === 0}
                className="btn-primary text-sm px-5 py-2 disabled:opacity-40"
              >
                Submit Findings →
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-xl border text-sm leading-relaxed ${
                  allCorrect
                    ? "bg-[#071a07] border-green-500/30 text-green-300"
                    : "bg-[#1f1200] border-[#f0883e]/30 text-[#c9d1d9]"
                }`}
              >
                {allCorrect ? (
                  <>
                    <p className="font-bold text-base text-green-300 mb-2">
                      🎉 Outstanding! Both exoplanet hosts identified.
                    </p>
                    <p className="text-[#8b949e] text-xs">
                      <strong className="text-[#c9d1d9]">KIC-892772</strong> hosts a hot Jupiter (P = 1.486d, ΔF = 1.42%) —
                      identical to the KOI-17b data you analyzed in the previous exercise.{" "}
                      <strong className="text-[#c9d1d9]">KIC-138194</strong> hosts a smaller planet (P = 2.204d, ΔF = 0.89%),
                      implying a radius of ~0.94 R♃. This is exactly how Kepler citizen scientists classify
                      candidates on Planet Hunters before professional follow-up.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[#f0883e] mb-2">
                      {correctCount === 0
                        ? "No transit hosts identified yet."
                        : `${correctCount} of 2 transit hosts found.${falsePositives > 0 ? ` (${falsePositives} false positive${falsePositives > 1 ? "s" : ""})` : ""}`}
                    </p>
                    <p className="text-[#8b949e] text-xs">
                      Look for light curves with <strong className="text-[#c9d1d9]">regular, repeating dips</strong> that
                      dip below the noise floor to a flat bottom — that U-shape is the planet's silhouette.
                      Stars without planets show only random noise around flux = 1.000.
                      The two transit hosts both show dips deeper than 0.8%.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Larger light curve for the detail panel ────────────────────────────────
function LargeLC({
  fluxes,
  color,
  hasTransit,
}: {
  fluxes: number[];
  color: string;
  hasTransit: boolean;
}) {
  const W = 220, H = 90;
  const pad = 5;
  const minF = Math.min(...fluxes);
  const maxF = Math.max(...fluxes);
  const range = Math.max(maxF - minF, hasTransit ? 0.006 : 0.003);

  const pts = fluxes
    .map((f, i) => {
      const x = pad + (i / (fluxes.length - 1)) * (W - pad * 2);
      const y = H - pad - ((f - minF) / range) * (H - pad * 2 - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const baselineY = H - pad - ((1 - minF) / range) * (H - pad * 2 - 12);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg">
      <rect width={W} height={H} fill="#070b10" rx="8" />
      <line x1={pad} y1={baselineY} x2={W - pad} y2={baselineY}
        stroke="#1a2030" strokeWidth="0.8" strokeDasharray="4,4" />
      <polyline points={pts} fill="none"
        stroke={hasTransit ? "#3fb950" : color}
        strokeWidth="1.5"
      />
      {/* Flux=1 label */}
      <text x={W - pad - 2} y={baselineY - 3} textAnchor="end"
        fill="#30363d" fontSize="8" fontFamily="monospace">
        1.000
      </text>
      {/* Min flux label when transit present */}
      {hasTransit && (
        <text x={W - pad - 2} y={H - pad - 2} textAnchor="end"
          fill="#3fb950" fontSize="8" fontFamily="monospace" fillOpacity="0.7">
          {minF.toFixed(4)}
        </text>
      )}
    </svg>
  );
}
