"use client";
import { useState, useEffect, useRef } from "react";

const W = 620, H = 290;
const MAP_W = 400, MAP_H = 200;
const MAP_X = (W - MAP_W) / 2, MAP_Y = 20;

// Seeded pseudo-random for consistent CMB map
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// Simulate CMB temperature fluctuations (ΔT/T ~ 10⁻⁵)
// Using sum of modes at different angular scales (l = multipole)
function buildCMBMap(nx: number, ny: number) {
  const rng = seededRng(42);
  const map = new Float32Array(nx * ny);
  // Add contributions from different l modes
  const modes = [
    { l: 2, amp: 0.8 }, { l: 3, amp: 0.5 }, { l: 4, amp: 0.7 },
    { l: 6, amp: 0.9 }, { l: 10, amp: 1.0 }, { l: 20, amp: 0.8 },
    { l: 40, amp: 0.6 }, { l: 80, amp: 0.4 },
  ];
  for (const mode of modes) {
    const phase = rng() * Math.PI * 2;
    const phasex = rng() * Math.PI * 2;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const fx = (x / nx) * mode.l * Math.PI * 2 + phasex;
        const fy = (y / ny) * mode.l * Math.PI * 2 + phase;
        map[y * nx + x] += mode.amp * Math.sin(fx) * Math.cos(fy);
      }
    }
  }
  // Normalize to -1..1
  let mn = Infinity, mx = -Infinity;
  for (const v of map) { if (v < mn) mn = v; if (v > mx) mx = v; }
  for (let i = 0; i < map.length; i++) map[i] = (map[i] - mn) / (mx - mn) * 2 - 1;
  return map;
}

// Temperature → colour (blue = cold, red = hot, yellow = hottest)
function tempToColor(t: number): string {
  // t in -1..1
  if (t < -0.4) return `rgb(0,50,${Math.round(150 + (-t - 0.4) / 0.6 * 100)})`;
  if (t < 0)    { const f = (t + 0.4) / 0.4; return `rgb(${Math.round(f * 80)},${Math.round(f * 80)},255)`; }
  if (t < 0.4)  { const f = t / 0.4; return `rgb(${Math.round(f * 255)},${Math.round(f * 100)},${Math.round(255 - f * 200)})`; }
  const f = (t - 0.4) / 0.6;
  return `rgb(255,${Math.round(100 + f * 155)},0)`;
}

const NX = 80, NY = 40;
const CMB_MAP = buildCMBMap(NX, NY);

const CELL_W = MAP_W / NX, CELL_H = MAP_H / NY;

const FEATURES = [
  { x: 0.22, y: 0.35, label: "Acoustic peak (l~200)", color: "#f0883e" },
  { x: 0.58, y: 0.55, label: "Cold spot", color: "#4488ff" },
  { x: 0.72, y: 0.3,  label: "Hot region", color: "#ff4400" },
];

export default function CMBAnimation({ description }: { description?: string }) {
  const [showFeatures, setShowFeatures] = useState(true);
  const [hovered, setHovered] = useState<{ x: number; y: number; t: number } | null>(null);
  const canvasRef = useRef<SVGGElement>(null);

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🌌 Interactive · Cosmic Microwave Background
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Oldest Light in the Universe — CMB Temperature Map</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "The CMB is a snapshot of the universe at 380,000 years after the Big Bang — the moment hydrogen formed and the universe became transparent. Temperature fluctuations (ΔT ≈ 0.0003 K) seeded all cosmic structure."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
          const svgX = (e.clientX - rect.left) / rect.width * W;
          const svgY = (e.clientY - rect.top) / rect.height * H;
          const mx = svgX - MAP_X, my = svgY - MAP_Y;
          if (mx >= 0 && mx < MAP_W && my >= 0 && my < MAP_H) {
            const ix = Math.floor(mx / CELL_W), iy = Math.floor(my / CELL_H);
            const t = CMB_MAP[iy * NX + ix] ?? 0;
            setHovered({ x: svgX, y: svgY, t });
          } else setHovered(null);
        }}
        onMouseLeave={() => setHovered(null)}>

        <text x={W / 2} y={MAP_Y - 6} textAnchor="middle" fill="#30363d" fontSize="8.5" fontFamily="monospace">
          PLANCK SATELLITE CMB MAP (simulated · Mollweide projection)
        </text>

        {/* CMB map cells */}
        <g ref={canvasRef}>
          {Array.from({ length: NY }, (_, y) =>
            Array.from({ length: NX }, (_, x) => {
              const t = CMB_MAP[y * NX + x];
              return (
                <rect key={`${x}-${y}`}
                  x={MAP_X + x * CELL_W} y={MAP_Y + y * CELL_H}
                  width={CELL_W + 0.5} height={CELL_H + 0.5}
                  fill={tempToColor(t)} />
              );
            })
          )}
        </g>

        {/* Elliptical border mask */}
        <ellipse cx={MAP_X + MAP_W / 2} cy={MAP_Y + MAP_H / 2} rx={MAP_W / 2 + 2} ry={MAP_H / 2 + 2}
          fill="none" stroke="#30363d" strokeWidth="1.5" />

        {/* Feature annotations */}
        {showFeatures && FEATURES.map(f => {
          const fx = MAP_X + f.x * MAP_W, fy = MAP_Y + f.y * MAP_H;
          return (
            <g key={f.label}>
              <circle cx={fx} cy={fy} r={10} fill="none" stroke={f.color} strokeWidth="1.2" strokeOpacity="0.8" strokeDasharray="4,3" />
              <text x={fx + 14} y={fy + 3} fill={f.color} fontSize="7.5" fontFamily="monospace" fillOpacity="0.85">{f.label}</text>
            </g>
          );
        })}

        {/* Hover readout */}
        {hovered && (
          <g>
            <rect x={hovered.x + 8} y={hovered.y - 20} width={110} height={20} rx={3} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
            <text x={hovered.x + 14} y={hovered.y - 7} fill="#e6edf3" fontSize="8" fontFamily="monospace">
              ΔT = {(hovered.t * 0.0003).toFixed(5)} K
            </text>
          </g>
        )}

        {/* Colour scale */}
        <text x={MAP_X} y={MAP_Y + MAP_H + 18} fill="#4488ff" fontSize="8" fontFamily="monospace">Cold (−0.0003 K)</text>
        <text x={MAP_X + MAP_W / 2} y={MAP_Y + MAP_H + 18} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">T̄ = 2.725 K</text>
        <text x={MAP_X + MAP_W} y={MAP_Y + MAP_H + 18} textAnchor="end" fill="#ff8800" fontSize="8" fontFamily="monospace">Hot (+0.0003 K)</text>

        {/* Stats */}
        <rect x={8} y={MAP_Y + MAP_H + 30} width={250} height={20} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={MAP_Y + MAP_H + 43} fill="#8b949e" fontSize="8" fontFamily="monospace">
          Age at emission: 380,000 yr · z = 1100 · T = 3000 K then
        </text>
      </svg>
      <div className="px-5 py-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center gap-3">
        <button onClick={() => setShowFeatures(s => !s)}
          className={`px-3 py-1 rounded text-xs font-mono ${showFeatures ? "bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/30" : "bg-[#21262d] text-[#484f58]"}`}>
          {showFeatures ? "Hide" : "Show"} features
        </button>
        <p className="text-[10px] text-[#484f58] font-mono">Hover map for temperature · Fluctuations ΔT/T ~ 10⁻⁵ grew into all galaxies and clusters</p>
      </div>
    </div>
  );
}
