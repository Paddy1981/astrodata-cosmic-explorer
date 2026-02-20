"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 310;
// Timeline panel (right)
const TL_X = 390, TL_Y = 20, TL_W = W - TL_X - 20, TL_H = H - 40;

// Cosmic epochs
const EPOCHS = [
  { name: "Big Bang",         t: 0,    color: "#ffffff", temp: "10³² K" },
  { name: "Inflation",        t: 0.04, color: "#ff8800", temp: "10²⁷ K" },
  { name: "Radiation Era",    t: 0.18, color: "#ffdd44", temp: "3000 K"  },
  { name: "Recombination",    t: 0.35, color: "#88aaff", temp: "3000 K"  },
  { name: "Dark Ages",        t: 0.45, color: "#223366", temp: "300 K"  },
  { name: "First Stars",      t: 0.55, color: "#aabbff", temp: "—"      },
  { name: "Dark Energy",      t: 0.72, color: "#bc8cff", temp: "—"      },
  { name: "Today",            t: 1.0,  color: "#3fb950", temp: "2.7 K"  },
];

// Initial galaxy positions (unit square, relative)
const N_GALAXIES = 28;
const INITIAL_POSITIONS = Array.from({ length: N_GALAXIES }, (_, i) => ({
  x: 0.12 + (((i * 137 + 53) % 100) / 100) * 0.76,
  y: 0.12 + (((i * 73 + 17) % 100) / 100) * 0.76,
}));

// Scale factor a(t) — matter + dark energy (ΛCDM simplified)
function scaleFactorAt(t: number): number {
  // t=0: a=0.05 (not exactly 0 for display), t=1: a=1
  // Deceleration then acceleration
  if (t < 0.4) return 0.05 + (t / 0.4) * 0.45;
  const tau = (t - 0.4) / 0.6;
  return 0.5 + tau * tau * 0.5; // accelerating expansion
}

export default function CosmicExpansionAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(0);
  const lastT = useRef<number | null>(null);
  const PERIOD = 10;

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        tRef.current = Math.min(1, (tRef.current + (now - lastT.current) / 1000 / PERIOD * speed));
        if (tRef.current >= 1) tRef.current = 0;
        setT(tRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  const a = scaleFactorAt(t);
  const epochIdx = EPOCHS.findIndex((e, i) => t < (EPOCHS[i + 1]?.t ?? 1.01)) || 0;
  const epoch = EPOCHS[Math.max(0, epochIdx)];

  // Galaxy panel dimensions
  const GW = TL_X - 20, GH = H - 20;
  const GCX = GW / 2, GCY = GH / 2;

  // Universe color based on epoch
  const bgColor = t < 0.04 ? "#fffaf0" : t < 0.35 ? "#1a0a00" : t < 0.55 ? "#060608" : "#090d14";

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🌌 Interactive · Cosmic Expansion
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Expanding Universe — From Big Bang to Today</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Watch the universe expand from the Big Bang. Every galaxy moves apart — not through space, but with expanding space. The recession velocity follows Hubble's Law: v = H₀d."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Galaxy panel background */}
        <rect x={0} y={0} width={TL_X - 10} height={H} fill={bgColor} />
        <text x={12} y={14} fill="#30363d" fontSize="8.5" fontFamily="monospace">OBSERVABLE UNIVERSE (2D slice)</text>

        {/* Galaxies */}
        {INITIAL_POSITIONS.map((pos, i) => {
          const gx = GCX + (pos.x - 0.5) * GW * a * 0.9;
          const gy = GCY + (pos.y - 0.5) * GH * a * 0.9;
          if (gx < 2 || gx > TL_X - 12 || gy < 2 || gy > H - 2) return null;
          const sz = 2.5 + (i % 3) * 1;
          return (
            <g key={i}>
              <circle cx={gx} cy={gy} r={sz * 1.8} fill="#f7cc4a" fillOpacity={0.06 + (i % 4) * 0.03} />
              <circle cx={gx} cy={gy} r={sz} fill="#f7cc4a" fillOpacity={t < 0.04 ? 0 : 0.8} />
            </g>
          );
        })}

        {/* Hubble flow arrows (from centre galaxy) */}
        {t > 0.1 && INITIAL_POSITIONS.slice(0, 6).map((pos, i) => {
          const gx = GCX + (pos.x - 0.5) * GW * a * 0.9;
          const gy = GCY + (pos.y - 0.5) * GH * a * 0.9;
          const dx = gx - GCX, dy = gy - GCY;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r < 5) return null;
          const vLen = Math.min(25, r * 0.3 * a);
          return (
            <line key={i} x1={gx} y1={gy} x2={gx + (dx / r) * vLen} y2={gy + (dy / r) * vLen}
              stroke="#3fb950" strokeWidth="0.8" strokeOpacity="0.55" />
          );
        })}

        {/* Scale factor display */}
        <rect x={8} y={H - 44} width={120} height={36} rx={4} fill="#0b1018" fillOpacity="0.85" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={H - 30} fill="#8b949e" fontSize="8" fontFamily="monospace">Scale factor a(t)</text>
        <text x={16} y={H - 16} fill="#f7cc4a" fontSize="14" fontFamily="monospace" fontWeight="bold">{a.toFixed(3)}</text>

        {/* Timeline panel */}
        <line x1={TL_X} y1={TL_Y} x2={TL_X} y2={TL_Y + TL_H} stroke="#30363d" strokeWidth="1" />
        <text x={TL_X + TL_W / 2} y={TL_Y - 6} textAnchor="middle" fill="#30363d" fontSize="8.5" fontFamily="monospace">COSMIC TIMELINE</text>
        {EPOCHS.map((e, i) => {
          const y = TL_Y + e.t * TL_H;
          const isActive = epochIdx === i;
          return (
            <g key={e.name}>
              <line x1={TL_X - 4} y1={y} x2={TL_X + TL_W} y2={y}
                stroke={e.color} strokeWidth={isActive ? 1.2 : 0.5} strokeOpacity={isActive ? 0.8 : 0.3} />
              <text x={TL_X + 8} y={y - 2} fill={isActive ? e.color : "#484f58"} fontSize={isActive ? 9 : 7.5} fontFamily="monospace" fontWeight={isActive ? "bold" : "normal"}>
                {e.name}
              </text>
              {e.temp !== "—" && (
                <text x={TL_X + 8} y={y + 9} fill="#30363d" fontSize="6.5" fontFamily="monospace">{e.temp}</text>
              )}
            </g>
          );
        })}
        {/* Current time marker */}
        <circle cx={TL_X} cy={TL_Y + t * TL_H} r={5} fill={epoch.color} stroke="#090d14" strokeWidth="1.5" />
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button onClick={() => { tRef.current = 0; setT(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">↺ Reset</button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? "bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/30" : "bg-[#21262d] text-[#484f58]"}`}>{s}×</button>
        ))}
        <span className="ml-auto text-[10px]" style={{ color: epoch.color }}>{epoch.name} · a = {a.toFixed(3)}</span>
      </div>
    </div>
  );
}
