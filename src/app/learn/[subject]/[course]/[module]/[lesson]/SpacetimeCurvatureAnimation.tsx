"use client";
import { useState } from "react";

const W = 620, H = 300;
const CX = W / 2, CY = H / 2 + 10;
const COLS = 18, ROWS = 12;
const CELL_W = (W - 40) / COLS;
const CELL_H = (H - 40) / ROWS;

const MASS_PRESETS = [
  { name: "Planet",       mass: 0.15, color: "#3fb950", rs: "~9 mm",  example: "Earth" },
  { name: "Neutron Star", mass: 0.55, color: "#f0883e", rs: "~10 km", example: "PSR J0030" },
  { name: "Black Hole",   mass: 0.95, color: "#bc8cff", rs: "~3 km/M☉", example: "Stellar BH" },
];

function warpedPt(col: number, row: number, mass: number): { x: number; y: number } {
  const baseX = 20 + col * CELL_W;
  const baseY = 20 + row * CELL_H;
  const dx = baseX - CX, dy = baseY - CY;
  const r2 = dx * dx + dy * dy;
  const r = Math.sqrt(r2);
  const minR = 18;
  if (r < minR) return { x: CX + (dx / r) * minR, y: CY + (dy / r) * minR };
  // Gravitational well deflection: warp ∝ mass/r²
  const warpStrength = mass * 3200;
  const factor = 1 - warpStrength / (r2 + warpStrength * 0.6);
  return { x: CX + dx * factor, y: CY + dy * factor };
}

function lightPath(impactParam: number, mass: number, n = 100): Array<{ x: number; y: number }> {
  // Simplified GR lensing: ray starts from left, deflected near center
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * 2 - 1; // -1 to 1
    const x0 = CX + t * (W * 0.46);
    const y0 = CY - impactParam;
    const dx = x0 - CX, dy = y0 - CY;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < 5) return { x: x0, y: CY };
    const deflection = mass * 8000 / r2;
    const yDef = y0 + deflection * (1 - Math.abs(t)) * Math.sign(-dy + 0.001) * -1;
    return { x: x0, y: yDef };
  });
}

export default function SpacetimeCurvatureAnimation({ description }: { description?: string }) {
  const [massIdx, setMassIdx] = useState(2);
  const [showLight, setShowLight] = useState(true);
  const preset = MASS_PRESETS[massIdx];
  const { mass, color } = preset;

  const centralR = 8 + mass * 28;

  // Grid lines
  const vLines = Array.from({ length: COLS + 1 }, (_, c) => {
    const pts = Array.from({ length: ROWS + 1 }, (_, r) => warpedPt(c, r, mass));
    return pts;
  });
  const hLines = Array.from({ length: ROWS + 1 }, (_, r) => {
    const pts = Array.from({ length: COLS + 1 }, (_, c) => warpedPt(c, r, mass));
    return pts;
  });

  // Light paths
  const lightPaths = showLight
    ? [-55, -30, 30, 55].map(ip => lightPath(ip, mass))
    : [];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🕳️ Interactive · Spacetime Curvature
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">General Relativity — Mass Warps Space &amp; Time</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "A massive object curves the spacetime grid — the more massive, the deeper the well. Light (yellow dashed rays) follows curved geodesics through this warped geometry."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="sc-obj" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.95" />
          </radialGradient>
          <radialGradient id="sc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor={color} stopOpacity={0.15 + mass * 0.25} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Warped grid — vertical lines */}
        {vLines.map((pts, c) => (
          <polyline key={c} points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none" stroke="#58a6ff" strokeWidth="0.55" strokeOpacity="0.35" />
        ))}
        {/* Warped grid — horizontal lines */}
        {hLines.map((pts, r) => (
          <polyline key={r} points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none" stroke="#58a6ff" strokeWidth="0.55" strokeOpacity="0.35" />
        ))}

        {/* Light ray paths */}
        {lightPaths.map((pts, i) => (
          <polyline key={i} points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
            fill="none" stroke="#f7cc4a" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="6,4" />
        ))}

        {/* Central object glow + disk */}
        <circle cx={CX} cy={CY} r={centralR * 4} fill="url(#sc-glow)" />
        <circle cx={CX} cy={CY} r={centralR} fill="url(#sc-obj)" />
        {massIdx === 2 && (
          <circle cx={CX} cy={CY} r={centralR * 0.85} fill="#000" />
        )}

        {/* Schwarzschild radius label */}
        <text x={CX} y={CY + centralR + 16} textAnchor="middle" fill={color} fontSize="8.5" fontFamily="monospace">{preset.name}</text>
        <text x={CX} y={CY + centralR + 26} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">r_s = {preset.rs} · ({preset.example})</text>

        {/* Info box */}
        <rect x={8} y={8} width={170} height={44} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={22} fill="#8b949e" fontSize="8" fontFamily="monospace">Grid = spacetime geometry</text>
        <text x={16} y={34} fill="#f7cc4a" fontSize="8" fontFamily="monospace">Dashed = null geodesics (light)</text>
        <text x={16} y={44} fill="#484f58" fontSize="7.5" fontFamily="monospace">g_μν curved by stress-energy</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        {MASS_PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => setMassIdx(i)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${massIdx === i ? "text-[#0d1117] font-bold" : "bg-[#21262d] text-[#8b949e]"}`}
            style={massIdx === i ? { background: p.color } : {}}>
            {p.name}
          </button>
        ))}
        <button onClick={() => setShowLight(s => !s)}
          className={`px-3 py-1 rounded text-xs font-mono ml-2 ${showLight ? "bg-[#f7cc4a]/20 text-[#f7cc4a] border border-[#f7cc4a]/30" : "bg-[#21262d] text-[#484f58]"}`}>
          {showLight ? "Hide" : "Show"} light rays
        </button>
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Einstein field equations G_μν = 8πT_μν</span>
      </div>
    </div>
  );
}
