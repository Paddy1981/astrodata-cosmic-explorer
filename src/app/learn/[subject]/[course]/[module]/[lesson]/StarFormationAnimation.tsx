"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 300;
const CX = W / 2, CY = H / 2;
const PL = 40;

// Stages of star formation
const STAGES = [
  {
    name: "Molecular Cloud",
    duration: 3,  // relative seconds at speed 1
    desc: "Cold gas and dust — Jeans instability triggers collapse",
    color: "#334466",
  },
  {
    name: "Protostellar Core",
    duration: 3,
    desc: "Core heats up: Kelvin-Helmholtz contraction",
    color: "#664400",
  },
  {
    name: "T Tauri Star",
    duration: 3,
    desc: "Bipolar jets clear surrounding disk; no fusion yet",
    color: "#cc5500",
  },
  {
    name: "Main Sequence",
    duration: 4,
    desc: "Hydrogen fusion ignites — hydrostatic equilibrium reached",
    color: "#ffdd44",
  },
];
const TOTAL_DUR = STAGES.reduce((s, st) => s + st.duration, 0);

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number; opacity: number;
}

function initParticles(n = 80): Particle[] {
  return Array.from({ length: n }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 75;
    return {
      x: CX + Math.cos(angle) * dist,
      y: CY + Math.sin(angle) * dist,
      vx: 0, vy: 0,
      r: 1.2 + Math.random() * 2.2,
      opacity: 0.3 + Math.random() * 0.4,
    };
  });
}

export default function StarFormationAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(0);          // 0..TOTAL_DUR
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(0);
  const lastT = useRef<number | null>(null);
  const [particles] = useState(initParticles);

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

  // Which stage?
  let stageIdx = 0, accumulated = 0;
  for (let i = 0; i < STAGES.length; i++) {
    if (t < accumulated + STAGES[i].duration) { stageIdx = i; break; }
    accumulated += STAGES[i].duration;
  }
  const stageProgress = (t - accumulated) / STAGES[stageIdx].duration; // 0..1
  const stage = STAGES[stageIdx];

  // Core radius grows with stage
  const coreRadii = [0, 8, 18, 38];
  const coreR = coreRadii[stageIdx] + (coreRadii[Math.min(stageIdx + 1, 3)] - coreRadii[stageIdx]) * stageProgress;

  // Nebula radius shrinks with stage
  const nebRadii = [110, 80, 55, 0];
  const nebR = nebRadii[stageIdx] + (nebRadii[Math.min(stageIdx + 1, 3)] - nebRadii[stageIdx]) * stageProgress;

  // Particle infall progress
  const collapse = Math.min(1, (stageIdx * 0.33 + stageProgress * 0.33));

  // Jet visible in T Tauri stage
  const showJets = stageIdx === 2;
  const jetLen = showJets ? 60 * stageProgress : 0;

  // Disk visible in T Tauri and beyond
  const showDisk = stageIdx >= 2;
  const diskRx = showDisk ? 44 + (stageIdx === 3 ? 10 : 0) : 0;

  // Core color transitions
  const coreColors = ["#334466", "#663300", "#cc5500", "#ffdd44"];
  const coreColor = coreColors[stageIdx];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Star Formation
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">From Nebula to Main Sequence Star</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Watch a molecular cloud collapse into a main sequence star. Press play and adjust the speed to move through the formation stages — from Jeans instability to hydrogen fusion."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="sf-nebula" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#334466" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#223355" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#112244" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sf-core" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor={coreColor} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="sf-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Nebula cloud */}
        {nebR > 5 && (
          <circle cx={CX} cy={CY} r={nebR * 1.4} fill="url(#sf-nebula)" />
        )}

        {/* Infalling dust particles */}
        {particles.map((p, i) => {
          const px = CX + (p.x - CX) * (1 - collapse * 0.85);
          const py = CY + (p.y - CY) * (1 - collapse * 0.85);
          const pr = p.r * (1 - collapse * 0.7);
          if (pr < 0.2) return null;
          return (
            <circle key={i} cx={px} cy={py} r={pr}
              fill="#88aacc" fillOpacity={p.opacity * (1 - collapse * 0.7)} />
          );
        })}

        {/* Protoplanetary disk */}
        {showDisk && diskRx > 0 && (
          <ellipse cx={CX} cy={CY} rx={diskRx} ry={4}
            fill="none" stroke="#cc8833" strokeWidth="3" strokeOpacity="0.35" />
        )}

        {/* Bipolar jets */}
        {showJets && jetLen > 0 && (
          <>
            <line x1={CX} y1={CY - coreR} x2={CX} y2={CY - coreR - jetLen}
              stroke="#88ccff" strokeWidth="2.5" strokeOpacity="0.7" />
            <line x1={CX} y1={CY + coreR} x2={CX} y2={CY + coreR + jetLen}
              stroke="#88ccff" strokeWidth="2.5" strokeOpacity="0.7" />
            <circle cx={CX} cy={CY - coreR - jetLen} r={4} fill="#88ccff" fillOpacity="0.4" />
            <circle cx={CX} cy={CY + coreR + jetLen} r={4} fill="#88ccff" fillOpacity="0.4" />
          </>
        )}

        {/* Core glow */}
        {coreR > 2 && (
          <circle cx={CX} cy={CY} r={coreR * 3} fill="url(#sf-glow)" />
        )}

        {/* Protostellar core / star */}
        {coreR > 0 && (
          <circle cx={CX} cy={CY} r={coreR} fill="url(#sf-core)" />
        )}

        {/* Stage progress bar */}
        <rect x={PL} y={H - 28} width={W - 80} height={6} rx={3} fill="#1d2230" />
        <rect x={40} y={H - 28} width={(W - 80) * (t / TOTAL_DUR)} height={6} rx={3} fill={stage.color} fillOpacity="0.85" />

        {/* Stage markers */}
        {STAGES.map((st, i) => {
          let acc = 0;
          for (let j = 0; j < i; j++) acc += STAGES[j].duration;
          const mx = 40 + (W - 80) * (acc / TOTAL_DUR);
          return (
            <line key={i} x1={mx} y1={H - 32} x2={mx} y2={H - 18} stroke="#30363d" strokeWidth="1" />
          );
        })}

        {/* Stage label */}
        <rect x={CX - 140} y={12} width={280} height={44} rx={6} fill="#0b1018" stroke={stage.color} strokeWidth="0.75" strokeOpacity="0.6" />
        <text x={CX} y={27} textAnchor="middle" fill={stage.color} fontSize="11" fontFamily="monospace" fontWeight="bold">{stage.name}</text>
        <text x={CX} y={42} textAnchor="middle" fill="#8b949e" fontSize="8.5" fontFamily="monospace">{stage.desc}</text>

        {/* Time readout */}
        <text x={W - 12} y={H - 14} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
          t = {t.toFixed(1)}s (scaled)
        </text>
      </svg>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
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
              tRef.current = acc + 0.1;
              setT(acc + 0.1);
              setPlaying(false);
            }}
              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors ${stageIdx === i
                ? "font-bold"
                : "bg-[#21262d] text-[#484f58]"}`}
              style={stageIdx === i ? { background: st.color + "33", color: st.color, border: `1px solid ${st.color}44` } : {}}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

