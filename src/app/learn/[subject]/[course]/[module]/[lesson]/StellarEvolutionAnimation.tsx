"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 310;
const CX = W / 2, CY = H / 2 - 10;

const STAGES = [
  {
    name: "Main Sequence",
    subtext: "Hydrogen fusion — hydrostatic equilibrium",
    r: 28,
    color: "#ffdd44",
    coreColor: "#ffffff",
    glowColor: "#ffaa00",
    duration: 3,
    hasDisk: false,
    hasRing: false,
    hasEjecta: false,
  },
  {
    name: "Red Giant",
    subtext: "Core He fusion begins; H shell burning expands envelope",
    r: 70,
    color: "#ff4400",
    coreColor: "#ff8800",
    glowColor: "#ff2200",
    duration: 3,
    hasDisk: false,
    hasRing: false,
    hasEjecta: false,
  },
  {
    name: "Supernova Explosion",
    subtext: "Core collapses → neutronisation → shockwave",
    r: 110,
    color: "#ffffff",
    coreColor: "#88ccff",
    glowColor: "#ffffff",
    duration: 2,
    hasDisk: false,
    hasRing: false,
    hasEjecta: true,
  },
  {
    name: "Remnant: Neutron Star / Black Hole",
    subtext: "Compact remnant surrounded by supernova nebula",
    r: 8,
    color: "#88ccff",
    coreColor: "#ccddff",
    glowColor: "#4488ff",
    duration: 3,
    hasDisk: false,
    hasRing: true,
    hasEjecta: false,
  },
];

const TOTAL_DUR = STAGES.reduce((s, st) => s + st.duration, 0);

export default function StellarEvolutionAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(0);
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        tRef.current = (tRef.current + dt * speed) % TOTAL_DUR;
        setT(tRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  let stageIdx = 0, accumulated = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (t < accumulated + STAGES[i].duration) { stageIdx = i; break; }
    accumulated += STAGES[i].duration;
  }
  const stageProgress = (t - accumulated) / STAGES[stageIdx].duration;
  const stage = STAGES[stageIdx];
  const nextStage = STAGES[Math.min(stageIdx + 1, STAGES.length - 1)];

  // Interpolate radius and color
  const r = stage.r + (nextStage.r - stage.r) * stageProgress;

  // Ejecta particles (supernova)
  const ejectaParticles = 16;
  const ejectaExpand = stage.hasEjecta ? stageProgress * 120 : 0;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Stellar Evolution
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Main Sequence → Red Giant → Supernova → Remnant</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Watch a massive star evolve through its complete lifecycle. Use the stage buttons to jump directly to any phase of stellar evolution."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="se-star" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={stage.coreColor} />
            <stop offset="35%" stopColor={stage.color} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="se-glow" cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor={stage.glowColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={stage.glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background ejecta nebula (after SN) */}
        {stageIdx === 3 && (
          <>
            {Array.from({ length: 32 }, (_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const dist = 60 + (i % 3) * 22;
              return (
                <circle key={i}
                  cx={CX + Math.cos(angle) * dist}
                  cy={CY + Math.sin(angle) * dist * 0.65}
                  r={4 + (i % 4)}
                  fill="#cc4400" fillOpacity={0.12 + (i % 3) * 0.06} />
              );
            })}
          </>
        )}

        {/* Supernova ejecta */}
        {stage.hasEjecta && (
          <>
            {Array.from({ length: ejectaParticles }, (_, i) => {
              const angle = (i / ejectaParticles) * Math.PI * 2;
              const dist = ejectaExpand;
              return (
                <circle key={i}
                  cx={CX + Math.cos(angle) * dist}
                  cy={CY + Math.sin(angle) * dist * 0.7}
                  r={6 - stageProgress * 4}
                  fill="#ffdd44" fillOpacity={1 - stageProgress * 0.8} />
              );
            })}
          </>
        )}

        {/* Ring nebula (remnant phase) */}
        {stage.hasRing && (
          <ellipse cx={CX} cy={CY} rx={55 + stageProgress * 15} ry={35 + stageProgress * 10}
            fill="none" stroke="#4488ff" strokeWidth="3" strokeOpacity={0.35 - stageProgress * 0.1} />
        )}

        {/* Star glow */}
        <circle cx={CX} cy={CY} r={r * 2.8} fill="url(#se-glow)" />

        {/* Star */}
        <circle cx={CX} cy={CY} r={Math.max(r, 2)} fill="url(#se-star)" />

        {/* Progress bar */}
        <rect x={40} y={H - 28} width={W - 80} height={6} rx={3} fill="#1d2230" />
        <rect x={40} y={H - 28} width={(W - 80) * (t / TOTAL_DUR)} height={6} rx={3} fill={stage.color} fillOpacity="0.85" />
        {STAGES.map((_, i) => {
          let acc = 0;
          for (let j = 0; j < i; j++) acc += STAGES[j].duration;
          const mx = 40 + (W - 80) * (acc / TOTAL_DUR);
          return <line key={i} x1={mx} y1={H - 32} x2={mx} y2={H - 18} stroke="#30363d" strokeWidth="1" />;
        })}

        {/* Stage badge */}
        <rect x={CX - 150} y={12} width={300} height={44} rx={6} fill="#0b1018" stroke={stage.color} strokeWidth="0.75" strokeOpacity="0.6" />
        <text x={CX} y={28} textAnchor="middle" fill={stage.color} fontSize="11" fontFamily="monospace" fontWeight="bold">{stage.name}</text>
        <text x={CX} y={43} textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">{stage.subtext}</text>

        {/* Radius readout */}
        <text x={W - 14} y={H - 14} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
          R ≈ {r.toFixed(0)} px (scaled)
        </text>
      </svg>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { tRef.current = 0; setT(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          ↺ Reset
        </button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${speed === s
              ? "bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {STAGES.map((st, i) => (
            <button key={i} onClick={() => {
              let acc = 0;
              for (let j = 0; j < i; j++) acc += STAGES[j].duration;
              tRef.current = acc + 0.05;
              setT(acc + 0.05);
              setPlaying(false);
            }}
              className={`px-2 py-1 rounded text-[9px] font-mono transition-colors`}
              style={stageIdx === i
                ? { background: st.color + "33", color: st.color, border: `1px solid ${st.color}44` }
                : { background: "#21262d", color: "#484f58" }}>
              {i + 1}. {st.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
