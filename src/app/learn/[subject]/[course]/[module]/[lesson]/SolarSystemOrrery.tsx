"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 340;
const CX = W / 2, CY = H / 2 + 10;
const SUN_R = 14;

// Real orbital periods in years
const PLANETS = [
  { name: "Mercury", a: 38,  period: 0.241,  r: 3.5,  color: "#aaaaaa", info: { dist: "0.39 AU", year: "88 days",  moons: 0,  type: "Rocky" } },
  { name: "Venus",   a: 56,  period: 0.615,  r: 5.5,  color: "#f5c842", info: { dist: "0.72 AU", year: "225 days", moons: 0,  type: "Rocky" } },
  { name: "Earth",   a: 76,  period: 1.0,    r: 5.8,  color: "#4488ff", info: { dist: "1.00 AU", year: "365 days", moons: 1,  type: "Rocky" } },
  { name: "Mars",    a: 97,  period: 1.881,  r: 4.2,  color: "#cc4422", info: { dist: "1.52 AU", year: "687 days", moons: 2,  type: "Rocky" } },
  { name: "Jupiter", a: 138, period: 11.86,  r: 12.0, color: "#e07040", info: { dist: "5.20 AU", year: "11.9 yr",  moons: 95, type: "Gas giant" } },
  { name: "Saturn",  a: 172, period: 29.46,  r: 10.5, color: "#d4a060", info: { dist: "9.58 AU", year: "29.5 yr",  moons: 146,type: "Gas giant" } },
  { name: "Uranus",  a: 206, period: 84.0,   r: 7.5,  color: "#88ddee", info: { dist: "19.2 AU", year: "84 yr",   moons: 27, type: "Ice giant" } },
  { name: "Neptune", a: 237, period: 164.8,  r: 7.0,  color: "#2255cc", info: { dist: "30.1 AU", year: "165 yr",  moons: 16, type: "Ice giant" } },
];

export default function SolarSystemOrrery({ description }: { description?: string }) {
  const [angles, setAngles] = useState(() => PLANETS.map(() => Math.random() * Math.PI * 2));
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hovered, setHovered] = useState<number | null>(null);
  const anglesRef = useRef(angles.slice());
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        // Speed: normalise so Earth takes ~20s at speed 1
        const earthOmega = (2 * Math.PI) / 20;
        PLANETS.forEach((p, i) => {
          const omega = earthOmega * (1 / p.period) * speed;
          anglesRef.current[i] = (anglesRef.current[i] + dt * omega) % (2 * Math.PI);
        });
        setAngles([...anglesRef.current]);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  const hov = hovered !== null ? PLANETS[hovered] : null;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f7cc4a] uppercase tracking-widest block mb-1">
          ☀️ Interactive · Solar System Orrery
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Eight Planets — Real Orbital Period Ratios</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Hover any planet for data. Orbital speeds are proportional to real values — outer planets move much more slowly. Use speed controls to see the difference clearly."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="or-sun" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7d0" />
            <stop offset="45%" stopColor="#ffb030" />
            <stop offset="100%" stopColor="#e05000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="or-sunglow" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#ff9900" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbits */}
        {PLANETS.map((p, i) => (
          <circle key={i} cx={CX} cy={CY} r={p.a}
            fill="none" stroke="#1d2230" strokeWidth={hovered === i ? 1 : 0.75}
            strokeDasharray={hovered === i ? "none" : "5,4"} strokeOpacity={hovered === i ? 0.6 : 0.4} />
        ))}

        {/* Sun glow + disk */}
        <circle cx={CX} cy={CY} r={SUN_R * 4} fill="url(#or-sunglow)" />
        <circle cx={CX} cy={CY} r={SUN_R} fill="url(#or-sun)" />

        {/* Saturn rings */}
        {(() => {
          const p = PLANETS[5];
          const px = CX + Math.cos(angles[5]) * p.a;
          const py = CY + Math.sin(angles[5]) * p.a * 0.95;
          return (
            <ellipse cx={px} cy={py} rx={p.r * 1.8} ry={p.r * 0.5}
              fill="none" stroke="#d4a060" strokeWidth="2.5" strokeOpacity="0.5" />
          );
        })()}

        {/* Planets */}
        {PLANETS.map((p, i) => {
          const px = CX + Math.cos(angles[i]) * p.a;
          const py = CY + Math.sin(angles[i]) * p.a * 0.95; // slight tilt for 3D feel
          const isHov = hovered === i;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}>
              {/* Planet glow */}
              <circle cx={px} cy={py} r={p.r * (isHov ? 2.5 : 1.8)}
                fill={p.color} fillOpacity={isHov ? 0.3 : 0.1}
                style={{ transition: "r 0.15s, fill-opacity 0.15s" }} />
              {/* Planet */}
              <circle cx={px} cy={py} r={p.r}
                fill={p.color} fillOpacity={0.9}
                stroke={isHov ? "#ffffff" : p.color} strokeWidth={isHov ? 1.5 : 0.5} strokeOpacity={isHov ? 0.9 : 0.3} />
              {/* Label for hovered */}
              {isHov && (
                <text x={px} y={py - p.r - 7} textAnchor="middle" fill={p.color} fontSize="9" fontFamily="monospace" fontWeight="bold">
                  {p.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Info panel */}
        {hov !== null && hovered !== null && (
          <g>
            <rect x={8} y={8} width={170} height={96} rx={6} fill="#0b1018" stroke={hov.color} strokeWidth="0.75" strokeOpacity="0.7" />
            <text x={18} y={26} fill={hov.color} fontSize="13" fontFamily="monospace" fontWeight="bold">{hov.name}</text>
            <text x={18} y={41} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Distance: {hov.info.dist}</text>
            <text x={18} y={54} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Year:     {hov.info.year}</text>
            <text x={18} y={67} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Moons:    {hov.info.moons}</text>
            <text x={18} y={80} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Type:     {hov.info.type}</text>
            <text x={18} y={93} fill="#484f58" fontSize="7.5" fontFamily="monospace">P = {hov.period} yr</text>
          </g>
        )}

        {/* Sun label */}
        <text x={CX} y={CY + SUN_R + 12} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">Sun</text>
      </svg>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 5, 10].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${speed === s
              ? "bg-[#f7cc4a]/20 text-[#f7cc4a] border border-[#f7cc4a]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Hover planets for data · Kepler P² ∝ a³</span>
      </div>
    </div>
  );
}
