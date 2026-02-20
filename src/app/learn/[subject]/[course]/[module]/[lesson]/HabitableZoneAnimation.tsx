"use client";
import { useState } from "react";

const W = 620, H = 300;
const SX = 80, SY = H / 2;

// Star types with luminosity (relative to Sun) and temperature
const STAR_TYPES = [
  { name: "M dwarf",   lum: 0.008, temp: 3200, color: "#ff4400", textColor: "#ff6644" },
  { name: "K dwarf",   lum: 0.18,  temp: 4500, color: "#ff8800", textColor: "#ffa044" },
  { name: "G (Sun)",   lum: 1.0,   temp: 5778, color: "#ffdd44", textColor: "#ffe066" },
  { name: "F dwarf",   lum: 3.2,   temp: 6800, color: "#ffffcc", textColor: "#ffffd0" },
  { name: "A star",    lum: 20,    temp: 9500, color: "#ccddff", textColor: "#ddeeff" },
];

// Habitable zone boundaries (in AU) based on Kopparapu+2013
// inner (runaway greenhouse), outer (maximum greenhouse)
function hzBounds(lum: number) {
  const inner = Math.sqrt(lum / 1.107);  // simplified
  const outer = Math.sqrt(lum / 0.356);
  return { inner, outer };
}

// Convert AU to SVG x
const MAX_AU = 12;
const SCALE_X = (W - SX - 30) / MAX_AU;
const au2x = (au: number) => SX + Math.sqrt(Math.max(au, 0)) * SCALE_X * 1.6;

// Planet temperature (equilibrium, no albedo)
function planetTemp(lum: number, au: number): number {
  const flux = lum / (au * au);
  return Math.round(278 * Math.pow(flux, 0.25));
}

const ZONE_COLORS = [
  { id: "hz-hot",   label: "Too Hot",    fill: "#ff4400", opacity: 0.18 },
  { id: "hz-warm",  label: "Habitable",  fill: "#3fb950", opacity: 0.22 },
  { id: "hz-cold",  label: "Too Cold",   fill: "#4488ff", opacity: 0.14 },
];

const AU_TICKS = [0.1, 0.3, 1, 3, 10];

export default function HabitableZoneAnimation({ description }: { description?: string }) {
  const [starIdx, setStarIdx] = useState(2); // Sun default
  const [planetAU, setPlanetAU] = useState(1.0);

  const star = STAR_TYPES[starIdx];
  const { inner, outer } = hzBounds(star.lum);
  const pTemp = planetTemp(star.lum, planetAU);
  const inHZ = planetAU >= inner && planetAU <= outer;
  const tooHot = planetAU < inner;
  const starR = Math.max(10, Math.min(32, 8 + Math.log10(star.lum + 0.01) * 12));

  const innerX = au2x(inner);
  const outerX = au2x(outer);
  const planetX = au2x(planetAU);

  // Zone fills
  const hotStart = SX + 2;
  const coldEnd = W - 20;
  const statusColor = inHZ ? "#3fb950" : tooHot ? "#ff4400" : "#4488ff";
  const statusLabel = inHZ ? "HABITABLE ZONE" : tooHot ? "TOO HOT — Runaway Greenhouse" : "TOO COLD — Frozen";

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          🌍 Interactive · The Habitable Zone
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Where Could Liquid Water Exist?</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Select a star type and drag the planet to see its equilibrium temperature. The green band is the classical habitable zone (0°C – 100°C liquid water). Physics: F ∝ L/d²."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="hz-starglow" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={star.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={star.color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hz-star" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={star.color} />
            <stop offset="100%" stopColor={star.color} stopOpacity="0.7" />
          </radialGradient>
          <radialGradient id="hz-planet" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={statusColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor="#07090e" />
          </radialGradient>
        </defs>

        {/* Background zones */}
        <rect x={hotStart} y={SY - 44} width={Math.max(0, innerX - hotStart)} height={88}
          fill="#ff4400" fillOpacity="0.10" />
        <rect x={innerX} y={SY - 44} width={Math.max(0, outerX - innerX)} height={88}
          fill="#3fb950" fillOpacity="0.15" />
        <rect x={outerX} y={SY - 44} width={Math.max(0, coldEnd - outerX)} height={88}
          fill="#4488ff" fillOpacity="0.10" />

        {/* Zone boundary lines */}
        <line x1={innerX} y1={SY - 52} x2={innerX} y2={SY + 52} stroke="#3fb950" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.6" />
        <line x1={outerX} y1={SY - 52} x2={outerX} y2={SY + 52} stroke="#4488ff" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.6" />
        <text x={innerX + 4} y={SY - 54} fill="#3fb950" fontSize="8" fontFamily="monospace">{inner.toFixed(2)} AU</text>
        <text x={outerX + 4} y={SY - 54} fill="#4488ff" fontSize="8" fontFamily="monospace">{outer.toFixed(2)} AU</text>

        {/* AU tick marks */}
        {AU_TICKS.map(au => {
          const x = au2x(au);
          if (x > W - 20) return null;
          return (
            <g key={au}>
              <line x1={x} y1={SY + 52} x2={x} y2={SY + 58} stroke="#30363d" />
              <text x={x} y={SY + 68} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">{au} AU</text>
            </g>
          );
        })}
        <text x={SX + (W - SX - 20) / 2} y={SY + 80} textAnchor="middle" fill="#8b949e" fontSize="9">Distance from Star (AU)</text>

        {/* Star glow + disk */}
        <circle cx={SX} cy={SY} r={starR * 3.8} fill="url(#hz-starglow)" />
        <circle cx={SX} cy={SY} r={starR} fill="url(#hz-star)" />

        {/* Planet */}
        <circle cx={planetX} cy={SY} r={10} fill="url(#hz-planet)" stroke={statusColor} strokeWidth="0.8" strokeOpacity="0.5" />

        {/* Orbit line */}
        <line x1={SX + starR} y1={SY} x2={planetX - 11} y2={SY}
          stroke="#30363d" strokeWidth="1" strokeDasharray="4,3" />

        {/* Temperature readout */}
        <rect x={planetX - 30} y={SY - 78} width={80} height={22} rx={4} fill="#0b1018" stroke={statusColor} strokeWidth="0.75" strokeOpacity="0.5" />
        <text x={planetX + 10} y={SY - 62} textAnchor="middle" fill={statusColor} fontSize="11" fontFamily="monospace" fontWeight="bold">
          {pTemp} K
        </text>

        {/* Status badge */}
        <rect x={W / 2 - 120} y={8} width={240} height={24} rx={5} fill="#0b1018" stroke={statusColor} strokeWidth="0.75" strokeOpacity="0.6" />
        <text x={W / 2} y={23} textAnchor="middle" fill={statusColor} fontSize="9" fontFamily="monospace" fontWeight="bold">
          {statusLabel}
        </text>

        {/* Zone labels */}
        <text x={(hotStart + innerX) / 2} y={SY + 40} textAnchor="middle" fill="#ff6644" fontSize="8" fontFamily="monospace">Too Hot</text>
        <text x={(innerX + outerX) / 2} y={SY + 40} textAnchor="middle" fill="#3fb950" fontSize="8" fontFamily="monospace">Habitable</text>
        <text x={(outerX + Math.min(coldEnd, W - 30)) / 2} y={SY + 40} textAnchor="middle" fill="#6699ff" fontSize="8" fontFamily="monospace">Too Cold</text>

        {/* Star stats */}
        <text x={SX} y={SY - starR - 16} textAnchor="middle" fill={star.textColor} fontSize="9" fontFamily="monospace" fontWeight="bold">{star.name}</text>
        <text x={SX} y={SY - starR - 6} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{star.temp} K</text>
        <text x={SX} y={SY + starR + 14} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">L = {star.lum} L☉</text>
      </svg>

      <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d] space-y-2">
        <div className="flex gap-2 flex-wrap">
          {STAR_TYPES.map((s, i) => (
            <button key={s.name} onClick={() => setStarIdx(i)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${i === starIdx
                ? "text-[#0d1117] font-bold"
                : "bg-[#21262d] text-[#8b949e] hover:bg-[#30363d]"}`}
              style={i === starIdx ? { background: s.color } : {}}>
              {s.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">Planet distance:</span>
          <input type="range" min={0.05} max={8} step={0.05} value={planetAU}
            onChange={e => setPlanetAU(parseFloat(e.target.value))}
            className="flex-1 h-1.5" style={{ accentColor: statusColor }} />
          <span className="text-[10px] font-mono w-16 text-right" style={{ color: statusColor }}>{planetAU.toFixed(2)} AU</span>
        </div>
        <p className="text-[10px] text-[#484f58] font-mono">
          Flux = L/d² = {star.lum}/{planetAU.toFixed(2)}² = {(star.lum / (planetAU * planetAU)).toFixed(3)} S☉ · T_eq = {pTemp} K
        </p>
      </div>
    </div>
  );
}
