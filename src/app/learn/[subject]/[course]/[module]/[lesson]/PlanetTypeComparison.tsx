"use client";
import { useState } from "react";

const W = 620, H = 280;

const PLANET_TYPES = [
  {
    name: "Earth-like",
    radius: 1.0,    // R⊕
    mass: 1.0,      // M⊕
    density: 5.51,  // g/cm³
    color: "#4488ff",
    glow: "#2266cc",
    atmosphere: "N₂/O₂",
    example: "Earth",
    desc: "Rocky, iron core, liquid water possible. Radius 0.8–1.5 R⊕.",
  },
  {
    name: "Super-Earth",
    radius: 1.8,
    mass: 6,
    density: 6.0,
    color: "#44cc88",
    glow: "#228844",
    atmosphere: "CO₂ or thick N₂",
    example: "55 Cnc e",
    desc: "Larger rocky world. May be water-rich or magma ocean. 1.5–2 R⊕.",
  },
  {
    name: "Mini-Neptune",
    radius: 2.7,
    mass: 10,
    density: 2.5,
    color: "#88bbff",
    glow: "#4477cc",
    atmosphere: "H₂/He envelope",
    example: "Kepler-11c",
    desc: "Most common planet type. Thick gas envelope over rocky core. 2–4 R⊕.",
  },
  {
    name: "Neptune",
    radius: 3.9,
    mass: 17,
    density: 1.64,
    color: "#2255cc",
    glow: "#112288",
    atmosphere: "H₂/He/CH₄",
    example: "Neptune",
    desc: "Ice giant. Water, ammonia, methane ices beneath H₂/He atmosphere.",
  },
  {
    name: "Saturn",
    radius: 9.4,
    mass: 95,
    density: 0.69,
    color: "#d4a060",
    glow: "#9e6830",
    atmosphere: "H₂/He",
    example: "Saturn",
    desc: "Gas giant — less dense than water! Prominent ring system.",
  },
  {
    name: "Jupiter",
    radius: 11.2,
    mass: 318,
    density: 1.33,
    color: "#e07040",
    glow: "#883020",
    atmosphere: "H₂/He",
    example: "Jupiter",
    desc: "Largest planet class. Metallic hydrogen interior. Storms last centuries.",
  },
];

const BASE_R = 12; // px per Earth radius
const BASELINE_Y = H - 50;

export default function PlanetTypeComparison({ description }: { description?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const totalWidth = PLANET_TYPES.reduce((sum, p) => sum + p.radius * BASE_R * 2 + 28, 0);
  const startX = (W - totalWidth) / 2 + 14;

  let curX = startX;
  const positions = PLANET_TYPES.map(p => {
    const r = p.radius * BASE_R;
    const cx = curX + r;
    curX += r * 2 + 28;
    return { cx, r };
  });

  const hov = hovered !== null ? PLANET_TYPES[hovered] : null;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🌌 Interactive · Planet Type Comparison
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Six Major Planet Classes — To Scale</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Hover any planet to see its physical properties. All sizes shown to the same scale (Earth = 1 R⊕). The radius gap between ~1.5–2 R⊕ is the 'Fulton gap' — where sub-Neptunes are rare."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          {PLANET_TYPES.map((p, i) => (
            <radialGradient key={i} id={`pt-p${i}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#07090e" />
            </radialGradient>
          ))}
        </defs>

        {/* Earth 1 R⊕ scale bar */}
        <line x1={startX - 4} y1={BASELINE_Y + 20} x2={startX - 4 + BASE_R * 2} y2={BASELINE_Y + 20}
          stroke="#484f58" strokeWidth="0.75" />
        <text x={startX - 4 + BASE_R} y={BASELINE_Y + 30} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">
          1 R⊕
        </text>

        {PLANET_TYPES.map((p, i) => {
          const { cx, r } = positions[i];
          const isHov = hovered === i;
          const cy = BASELINE_Y - r;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}>
              {/* Glow */}
              <circle cx={cx} cy={cy} r={r * 1.8} fill={p.glow} fillOpacity={isHov ? 0.3 : 0.12}
                style={{ transition: "fill-opacity 0.2s" }} />
              {/* Planet */}
              <circle cx={cx} cy={cy} r={r} fill={`url(#pt-p${i})`}
                stroke={p.color} strokeWidth={isHov ? 1.5 : 0.5} strokeOpacity={isHov ? 0.8 : 0.3} />
              {/* Name */}
              <text x={cx} y={BASELINE_Y + 14} textAnchor="middle" fill={isHov ? p.color : "#8b949e"} fontSize="8" fontFamily="monospace"
                style={{ transition: "fill 0.2s" }}>
                {p.name}
              </text>
              <text x={cx} y={BASELINE_Y + 24} textAnchor="middle" fill="#484f58" fontSize="7" fontFamily="monospace">
                {p.radius} R⊕
              </text>
            </g>
          );
        })}

        {/* Hover info panel */}
        {hov !== null && hovered !== null && (
          <g>
            <rect x={8} y={8} width={210} height={120} rx={7} fill="#0b1018"
              stroke={hov.color} strokeWidth="1" strokeOpacity="0.6" />
            <text x={18} y={26} fill={hov.color} fontSize="13" fontFamily="monospace" fontWeight="bold">{hov.name}</text>
            <text x={18} y={40} fill="#8b949e" fontSize="8" fontFamily="monospace">Example: {hov.example}</text>
            <text x={18} y={55} fill="#8b949e" fontSize="8" fontFamily="monospace">Radius:   {hov.radius} R⊕</text>
            <text x={18} y={68} fill="#8b949e" fontSize="8" fontFamily="monospace">Mass:     ~{hov.mass} M⊕</text>
            <text x={18} y={81} fill="#8b949e" fontSize="8" fontFamily="monospace">Density:  {hov.density} g/cm³</text>
            <text x={18} y={94} fill="#8b949e" fontSize="8" fontFamily="monospace">Atm:      {hov.atmosphere}</text>
            {/* Wrap desc text */}
            <foreignObject x={12} y={100} width={200} height={32}>
              <div style={{ color: "#484f58", fontSize: 8, fontFamily: "monospace", lineHeight: 1.4 }}>
                {hov.desc}
              </div>
            </foreignObject>
          </g>
        )}

        {/* Fulton gap annotation */}
        <rect x={startX + BASE_R * 2 * 1 + 28 + BASE_R * 1.8 * 2 - 4} y={BASELINE_Y - 20} width={44} height={18} rx={3}
          fill="#bc8cff" fillOpacity="0.08" stroke="#bc8cff" strokeWidth="0.5" strokeOpacity="0.4" />
        <text x={startX + BASE_R * 2 * 1 + 28 + BASE_R * 1.8 * 2 + 18} y={BASELINE_Y - 8} textAnchor="middle"
          fill="#bc8cff" fontSize="7" fontFamily="monospace" fillOpacity="0.7">gap</text>
      </svg>

      <div className="px-5 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <p className="text-[10px] text-[#484f58] font-mono">
          Hover each planet for detailed stats · All radii to scale · The &quot;Fulton gap&quot; (~1.5–2 R⊕) shows where photoevaporation strips mini-Neptune atmospheres
        </p>
      </div>
    </div>
  );
}
