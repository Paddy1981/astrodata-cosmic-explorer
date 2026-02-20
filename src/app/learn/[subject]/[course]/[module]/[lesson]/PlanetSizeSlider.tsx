"use client";
import { useState } from "react";

const W = 620, H = 320;
const SR = 72;                 // star radius (SVG px)
const SCX = W / 2, SCY = 130;
const LC_Y = 190, LC_H = 100;
const PL = 52, LPR = 16, LPT = 14, LPB = 22;
const LCW = W - PL - LPR, LCH = LC_H - LPT - LPB;
const FMIN = 0.88, FMAX = 1.005;
const p2x = (p: number) => PL + p * LCW;
const f2y = (f: number) => LC_Y + LPT + LCH - ((f - FMIN) / (FMAX - FMIN)) * LCH;

function transitCurve(ratio: number, n = 200) {
  const r = ratio;
  return Array.from({ length: n }, (_, i) => {
    const phase = i / (n - 1);
    const th = 2 * Math.PI * phase;
    const dx = Math.cos(th);
    const dy = Math.sin(th) * 0.12;
    const OA = 2.8;
    const d = Math.sqrt(dx * dx + dy * dy) * OA;
    const inFront = Math.sin(th) > 0;
    if (!inFront || d >= 1 + r) return { phase, f: 1 };
    if (d <= Math.abs(1 - r)) return { phase, f: Math.max(0, 1 - r * r) };
    const k0 = Math.acos(Math.min(1, (d * d + r * r - 1) / (2 * d * r)));
    const k1 = Math.acos(Math.min(1, (d * d + 1 - r * r) / (2 * d)));
    const disc = Math.max(0, (1 + r + d) * (-1 + r + d) * (1 - r + d) * (1 + r - d));
    return { phase, f: 1 - (r * r * k0 + k1 - 0.5 * Math.sqrt(disc)) / Math.PI };
  });
}

const PLANET_COLORS = ["#4a9eff", "#f0883e", "#bc8cff", "#3fb950", "#f7cc4a"];
const PLANET_NAMES = ["Earth-size", "Super-Earth", "Mini-Neptune", "Neptune", "Jupiter"];

export default function PlanetSizeSlider({ description }: { description?: string }) {
  const [ratio, setRatio] = useState(0.15); // Rp/Rs
  const depth = ratio * ratio;
  const prPx = Math.round(ratio * SR);
  const colorIdx = ratio < 0.05 ? 0 : ratio < 0.12 ? 1 : ratio < 0.18 ? 2 : ratio < 0.28 ? 3 : 4;
  const planetColor = PLANET_COLORS[colorIdx];
  const planetName = PLANET_NAMES[colorIdx];

  const curve = transitCurve(ratio);
  const pathD = curve.map((d, i) => `${i === 0 ? "M" : "L"}${p2x(d.phase).toFixed(1)},${f2y(d.f).toFixed(1)}`).join(" ");

  const YTICKS = [0.90, 0.925, 0.95, 0.975, 1.000];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          🪐 Interactive · Planet Size &amp; Transit Depth
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">How Planet Size Affects the Transit Signal</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Drag the slider to change the planet-to-star radius ratio. Watch how the transit dip depth changes — a larger planet blocks more light."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="ps-star" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff7d0" />
            <stop offset="45%" stopColor="#ffb030" />
            <stop offset="100%" stopColor="#e05000" stopOpacity="0.92" />
          </radialGradient>
          <radialGradient id="ps-planet" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={planetColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#07090e" />
          </radialGradient>
          <radialGradient id="ps-glow" cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor="#ff9900" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Star panel */}
        <text x={12} y={14} fill="#30363d" fontSize="8.5" fontFamily="monospace">STELLAR DISK VIEW</text>
        <circle cx={SCX} cy={SCY} r={SR * 2.4} fill="url(#ps-glow)" />
        <circle cx={SCX} cy={SCY} r={SR} fill="url(#ps-star)" />
        <circle cx={SCX} cy={SCY} r={SR} fill="none" stroke="#80380040" strokeWidth="10" />

        {/* Planet (transiting — centered for display) */}
        <circle cx={SCX} cy={SCY} r={prPx} fill="url(#ps-planet)" />
        <circle cx={SCX} cy={SCY} r={prPx} fill="none" stroke={planetColor} strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Measurement arrows */}
        <line x1={SCX} y1={SCY - SR - 8} x2={SCX + prPx} y2={SCY - SR - 8} stroke={planetColor} strokeWidth="1" markerEnd="url(#arrow)" />
        <line x1={SCX} y1={SCY - SR - 18} x2={SCX + SR} y2={SCY - SR - 18} stroke="#58a6ff" strokeWidth="1" />
        <line x1={SCX - SR} y1={SCY - SR - 18} x2={SCX} y2={SCY - SR - 18} stroke="#58a6ff" strokeWidth="1" />
        <text x={SCX + SR + 6} y={SCY - SR - 14} fill="#58a6ff" fontSize="9" fontFamily="monospace">R★</text>
        <text x={SCX + prPx + 4} y={SCY - SR - 4} fill={planetColor} fontSize="9" fontFamily="monospace">Rₚ</text>

        {/* Stats badge */}
        <rect x={8} y={SCY - 46} width={156} height={88} rx={6} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={SCY - 29} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Rₚ / R★</text>
        <text x={16} y={SCY - 15} fill="#e6edf3" fontSize="16" fontFamily="monospace" fontWeight="bold">{ratio.toFixed(3)}</text>
        <text x={16} y={SCY + 1} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Transit depth ΔF</text>
        <text x={16} y={SCY + 17} fill={planetColor} fontSize="16" fontFamily="monospace" fontWeight="bold">{(depth * 100).toFixed(2)}%</text>
        <text x={16} y={SCY + 33} fill="#484f58" fontSize="8" fontFamily="monospace">{planetName}</text>

        {/* Light curve panel */}
        <rect x={0} y={LC_Y} width={W} height={LC_H} fill="#0b1018" />
        <line x1={0} y1={LC_Y} x2={W} y2={LC_Y} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={LC_Y + 11} fill="#30363d" fontSize="8.5" fontFamily="monospace">SYNTHETIC LIGHT CURVE · ΔF = (Rₚ/R★)²</text>

        {YTICKS.map(f => (
          <g key={f}>
            <line x1={PL} y1={f2y(f)} x2={PL + LCW} y2={f2y(f)}
              stroke={f === 1.0 ? "#30363d" : "#151c26"} strokeWidth={f === 1 ? 1 : 0.75} />
            <text x={PL - 4} y={f2y(f) + 3.5} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">
              {f.toFixed(3)}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={p2x(p)} y1={LC_Y + LPT + LCH} x2={p2x(p)} y2={LC_Y + LPT + LCH + 4} stroke="#30363d" />
            <text x={p2x(p)} y={LC_Y + LPT + LCH + 12} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">
              {p.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={PL + LCW / 2} y={H - 4} textAnchor="middle" fill="#8b949e" fontSize="8.5">Orbital Phase</text>

        <path d={pathD} fill="none" stroke={planetColor} strokeWidth="2" strokeOpacity="0.9" />

        {/* Depth annotation */}
        {depth > 0.001 && (
          <>
            <line x1={p2x(0.5) - 30} y1={f2y(1 - depth)} x2={p2x(0.5) + 30} y2={f2y(1 - depth)}
              stroke={planetColor} strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.7" />
            <text x={p2x(0.5) + 34} y={f2y(1 - depth) + 3.5} fill={planetColor} fontSize="7.5" fontFamily="monospace">
              {(depth * 100).toFixed(2)}%
            </text>
          </>
        )}
      </svg>

      {/* Slider */}
      <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d]">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">Rₚ / R★</span>
          <input
            type="range"
            min={0.01}
            max={0.45}
            step={0.005}
            value={ratio}
            onChange={e => setRatio(parseFloat(e.target.value))}
            className="flex-1 h-1.5 accent-current"
            style={{ accentColor: planetColor }}
          />
          <span className="text-[10px] font-mono text-[#8b949e] w-12 text-right">{ratio.toFixed(3)}</span>
        </div>
        <div className="flex justify-between mt-1.5 px-0">
          {PLANET_NAMES.map((n, i) => (
            <span key={n} className="text-[8.5px] font-mono" style={{ color: PLANET_COLORS[i] }}>{n}</span>
          ))}
        </div>
        <p className="text-[10px] text-[#484f58] font-mono mt-2">
          Physics: ΔF = (Rₚ/R★)² = ({ratio.toFixed(3)})² = {(depth * 100).toFixed(3)}%
        </p>
      </div>
    </div>
  );
}
