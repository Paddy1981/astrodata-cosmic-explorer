"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 340;
const CX = W / 2, CY = H / 2;
const BH_R = 26;          // Schwarzschild radius (display)
const PHOTON_RING_R = BH_R * 1.5; // Photon sphere ≈ 1.5 Rs

// Photon arcs (pre-computed approximate lensed paths)
const NUM_ARCS = 24;
function lensedArcPath(arcIdx: number, totalArcs: number): string {
  // Arcs come from the left, bend around BH
  const yOffset = ((arcIdx / (totalArcs - 1)) - 0.5) * (H - 60);
  const impactParam = Math.abs(yOffset);

  // Deflection angle (simplified): δ ≈ 4GM/bc² → larger for smaller impact param
  const deflection = impactParam > PHOTON_RING_R * 2.5
    ? (BH_R * BH_R * 30) / (impactParam * impactParam)
    : Math.PI * 0.85;

  const startX = 10;
  const startY = CY + yOffset;

  // For close approaches, draw a strong arc; for distant ones, gentle curve
  if (impactParam < PHOTON_RING_R * 2.5) {
    // Captured or photon-ringed: arc around BH
    const midAngle = yOffset < 0 ? -Math.PI / 2 : Math.PI / 2;
    const mx = CX + Math.cos(midAngle) * (PHOTON_RING_R + 10);
    const my = CY + Math.sin(midAngle) * (PHOTON_RING_R + 10);
    return `M ${startX} ${startY} Q ${CX - 80} ${CY + yOffset * 0.3} ${mx} ${my}`;
  }

  // Lensed but escaping: curve toward BH then away
  const exitY = CY + yOffset + (yOffset > 0 ? -deflection * 12 : deflection * 12);
  const ctrl1X = CX - 120, ctrl1Y = CY + yOffset * 0.7;
  const ctrl2X = CX + 80, ctrl2Y = CY + (startY + exitY) / 2 - CY;
  return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y} ${ctrl2X} ${ctrl2Y} ${W - 10} ${exitY}`;
}

export default function BlackHoleLensing({ description }: { description?: string }) {
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
        tRef.current = (tRef.current + dt * speed * 0.3) % 1;
        setT(tRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  // Animated accretion disk glow rotation
  const diskAngle = t * 2 * Math.PI;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🕳️ Interactive · Black Hole Gravitational Lensing
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Spacetime Curvature — Photon Ring &amp; Lensed Arcs</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Light from a background source bends around the black hole. Rays near the photon sphere orbit multiple times; distant rays show lensed arcs. r_s = 2GM/c²."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#050608", display: "block" }}>
        <defs>
          <radialGradient id="bh-disk" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8800" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#ff4400" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#cc2200" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#880000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bh-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#000000" stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="bh-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background star field (subtle) */}
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i}
            cx={14 + ((i * 97 + 13) % (W - 28))}
            cy={14 + ((i * 43 + 7) % (H - 28))}
            r={0.8 + (i % 3) * 0.4}
            fill="#ffffff" fillOpacity={0.1 + (i % 5) * 0.05} />
        ))}

        {/* Lensed photon paths */}
        {Array.from({ length: NUM_ARCS }, (_, i) => {
          const d = lensedArcPath(i, NUM_ARCS);
          const distFromCenter = Math.abs((i / (NUM_ARCS - 1) - 0.5) * (H - 60));
          const isClose = distFromCenter < PHOTON_RING_R * 2.5;
          const opacity = isClose ? 0.5 : 0.35;
          const strokeColor = isClose ? "#ff8800" : "#4488ff";
          // Animate phase along path
          const phase = (t + i / NUM_ARCS) % 1;
          return (
            <path key={i} d={d} fill="none"
              stroke={strokeColor} strokeWidth={isClose ? 0.8 : 0.6}
              strokeOpacity={opacity}
              strokeDasharray="8,16"
              strokeDashoffset={-phase * 24} />
          );
        })}

        {/* Accretion disk (outer glow) */}
        <ellipse cx={CX} cy={CY} rx={BH_R * 3.5} ry={BH_R * 0.7}
          fill="url(#bh-disk)" opacity={0.7} />

        {/* Rotating hot spot */}
        <circle
          cx={CX + Math.cos(diskAngle) * BH_R * 2.5}
          cy={CY + Math.sin(diskAngle) * BH_R * 0.5}
          r={5}
          fill="#ffaa00" fillOpacity="0.85" filter="url(#bh-glow)" />

        {/* Photon ring (sphere) */}
        <circle cx={CX} cy={CY} r={PHOTON_RING_R}
          fill="none" stroke="#ff6600" strokeWidth="1.5" strokeOpacity="0.6"
          strokeDasharray="3,4" />
        <text x={CX + PHOTON_RING_R + 6} y={CY - 6} fill="#ff6600" fontSize="8" fontFamily="monospace" fillOpacity="0.7">
          Photon sphere
        </text>
        <text x={CX + PHOTON_RING_R + 6} y={CY + 6} fill="#ff6600" fontSize="8" fontFamily="monospace" fillOpacity="0.7">
          r = 1.5 r_s
        </text>

        {/* Schwarzschild radius circle */}
        <circle cx={CX} cy={CY} r={BH_R}
          fill="none" stroke="#bc8cff" strokeWidth="0.75" strokeOpacity="0.5"
          strokeDasharray="4,3" />
        <text x={CX - BH_R - 6} y={CY} textAnchor="end" fill="#bc8cff" fontSize="8" fontFamily="monospace" fillOpacity="0.6">
          r_s
        </text>

        {/* Event horizon (black disk) */}
        <circle cx={CX} cy={CY} r={BH_R} fill="url(#bh-shadow)" />
        <circle cx={CX} cy={CY} r={BH_R * 0.85} fill="#000000" />

        {/* Labels */}
        <rect x={8} y={8} width={160} height={58} rx={5} fill="#050608" stroke="#30363d" strokeWidth="0.75" />
        <text x={18} y={23} fill="#bc8cff" fontSize="9" fontFamily="monospace" fontWeight="bold">Black Hole</text>
        <text x={18} y={35} fill="#484f58" fontSize="7.5" fontFamily="monospace">r_s = 2GM/c²</text>
        <text x={18} y={47} fill="#484f58" fontSize="7.5" fontFamily="monospace">Blue = lensed starlight</text>
        <text x={18} y={58} fill="#484f58" fontSize="7.5" fontFamily="monospace">Orange = accretion disk</text>

        {/* Shadow label */}
        <text x={CX} y={CY + 4} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace">SHADOW</text>
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
              ? "bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Null geodesics · EHT image style</span>
      </div>
    </div>
  );
}
