"use client";
import { useState } from "react";

const W = 620, H = 310;

const PARAMS = [
  {
    key: "R", symbol: "R★", name: "Star formation rate", unit: "stars/yr",
    min: 0.1, max: 10, step: 0.1, optimistic: 7, pessimistic: 1, current: 3,
    description: "Rate of star formation in the Milky Way (~3/yr observed)"
  },
  {
    key: "fp", symbol: "fₚ", name: "Fraction with planets", unit: "",
    min: 0.01, max: 1, step: 0.01, optimistic: 0.95, pessimistic: 0.1, current: 0.9,
    description: "~90% of Sun-like stars have planets (Kepler data)"
  },
  {
    key: "ne", symbol: "nₑ", name: "Habitable planets/star", unit: "planets",
    min: 0.01, max: 5, step: 0.01, optimistic: 2, pessimistic: 0.1, current: 0.5,
    description: "Average planets in habitable zone per planetary system"
  },
  {
    key: "fl", symbol: "fₗ", name: "Fraction life arises", unit: "",
    min: 0.0001, max: 1, step: 0.0001, optimistic: 0.99, pessimistic: 0.001, current: 0.5,
    description: "Fraction of habitable planets where life actually develops"
  },
  {
    key: "fi", symbol: "fᵢ", name: "Fraction intelligent", unit: "",
    min: 0.0001, max: 1, step: 0.0001, optimistic: 0.5, pessimistic: 0.001, current: 0.1,
    description: "Fraction of life-bearing planets with intelligent life"
  },
  {
    key: "fc", symbol: "fᵪ", name: "Fraction communicating", unit: "",
    min: 0.0001, max: 1, step: 0.0001, optimistic: 0.5, pessimistic: 0.01, current: 0.1,
    description: "Fraction of intelligent civilisations that communicate"
  },
  {
    key: "L", symbol: "L", name: "Civilisation lifespan", unit: "yr",
    min: 10, max: 1e9, step: 10, optimistic: 1e7, pessimistic: 100, current: 10000,
    description: "Average lifetime of a detectable civilisation (years)"
  },
];

function formatN(n: number): string {
  if (n < 0.001) return n.toExponential(1);
  if (n < 1) return n.toFixed(3);
  if (n < 1000) return n.toFixed(1);
  if (n < 1e6) return (n / 1e3).toFixed(1) + "k";
  if (n < 1e9) return (n / 1e6).toFixed(1) + "M";
  return (n / 1e9).toFixed(1) + "B";
}

function calcN(vals: number[]) {
  return vals.reduce((a, b) => a * b, 1);
}

const logScale = (v: number, p: typeof PARAMS[0]) => {
  // For L which spans many orders of magnitude, use log slider
  return p.key === "L" || p.key === "fl" || p.key === "fi" || p.key === "fc";
};

export default function DrakeEquationInteractive({ description }: { description?: string }) {
  const [values, setValues] = useState(() => PARAMS.map(p => p.current));
  const [hovered, setHovered] = useState<number | null>(null);

  const N = calcN(values);
  const N_opt = calcN(PARAMS.map(p => p.optimistic));
  const N_pess = calcN(PARAMS.map(p => p.pessimistic));

  const setVal = (i: number, v: number) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
  };

  // Bar chart positions
  const BAR_X = 340, BAR_Y = 20, BAR_W = 260, BAR_H = H - 60;

  // Log scale for the bar (N from 0.001 to 1e10)
  const logMin = -3, logMax = 10;
  const nToBarX = (n: number) => BAR_X + ((Math.log10(Math.max(1e-4, n)) - logMin) / (logMax - logMin)) * BAR_W;

  const nX = nToBarX(N);
  const nXOpt = nToBarX(N_opt);
  const nXPess = nToBarX(N_pess);
  const nXDrake = nToBarX(1000); // Drake's estimate ~1000

  // Table rows
  const rowH = (H - 50) / (PARAMS.length + 0.5);

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          👽 Interactive · The Drake Equation
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">N = R★ · fₚ · nₑ · fₗ · fᵢ · fᵪ · L</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Frank Drake's 1961 equation estimates communicating civilisations in our galaxy. Despite decades of SETI, N = 1 so far — us. Adjust each parameter to explore the Fermi Paradox: if N is large, where is everyone?"}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Parameter rows */}
        {PARAMS.map((p, i) => {
          const y = 18 + i * rowH;
          const isHov = hovered === i;
          const val = values[i];
          const isLog = logScale(val, p);
          // Slider fill fraction
          const frac = isLog
            ? (Math.log10(Math.max(p.min, val)) - Math.log10(p.min)) / (Math.log10(p.max) - Math.log10(p.min))
            : (val - p.min) / (p.max - p.min);

          return (
            <g key={p.key} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              {isHov && <rect x={2} y={y - 2} width={BAR_X - 10} height={rowH - 2} rx={3} fill="#1d2230" />}
              <text x={8} y={y + 11} fill="#3fb950" fontSize="10" fontFamily="monospace" fontWeight="bold">{p.symbol}</text>
              <text x={38} y={y + 11} fill={isHov ? "#e6edf3" : "#8b949e"} fontSize="8" fontFamily="monospace">{p.name}</text>
              {/* Mini slider track */}
              <rect x={8} y={y + 16} width={BAR_X - 20} height={4} rx={2} fill="#21262d" />
              <rect x={8} y={y + 16} width={(BAR_X - 20) * frac} height={4} rx={2} fill="#3fb950" />
              <text x={BAR_X - 14} y={y + 22} textAnchor="end" fill="#3fb950" fontSize="8.5" fontFamily="monospace">
                {p.key === "L" ? formatN(val) : val >= 1 ? val.toFixed(1) : val.toFixed(val < 0.01 ? 4 : 2)}
              </text>
            </g>
          );
        })}

        {/* Hover description */}
        {hovered !== null && (
          <rect x={2} y={H - 26} width={BAR_X - 10} height={22} rx={3} fill="#0b1018" stroke="#30363d" strokeWidth="0.6" />
        )}
        {hovered !== null && (
          <text x={8} y={H - 12} fill="#484f58" fontSize="7.5" fontFamily="monospace">{PARAMS[hovered].description}</text>
        )}

        {/* Vertical divider */}
        <line x1={BAR_X - 5} y1={10} x2={BAR_X - 5} y2={H - 10} stroke="#30363d" strokeWidth="0.8" />

        {/* N result panel */}
        <rect x={BAR_X} y={10} width={BAR_W} height={80} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={BAR_X + BAR_W / 2} y={30} textAnchor="middle" fill="#484f58" fontSize="9" fontFamily="monospace">Detectable Civilisations N =</text>
        <text x={BAR_X + BAR_W / 2} y={60} textAnchor="middle" fill="#3fb950" fontSize="28" fontFamily="monospace" fontWeight="bold">{formatN(N)}</text>
        <text x={BAR_X + BAR_W / 2} y={80} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
          Range: {formatN(N_pess)} (pess.) – {formatN(N_opt)} (opt.)
        </text>

        {/* Log scale bar */}
        <text x={BAR_X} y={106} fill="#30363d" fontSize="7.5" fontFamily="monospace">log scale →</text>
        <rect x={BAR_X} y={110} width={BAR_W} height={18} rx={3} fill="#0b1018" stroke="#30363d" strokeWidth="0.6" />
        {/* Gradient fill */}
        <defs>
          <linearGradient id="dk-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ff4444" /><stop offset="50%" stopColor="#f7cc4a" /><stop offset="100%" stopColor="#3fb950" />
          </linearGradient>
        </defs>
        <rect x={BAR_X} y={110} width={BAR_W} height={18} rx={3} fill="url(#dk-grad)" fillOpacity="0.3" />
        {/* Tick marks */}
        {[-2, 0, 2, 4, 6, 8].map(exp => {
          const x = nToBarX(Math.pow(10, exp));
          return (
            <g key={exp}>
              <line x1={x} y1={128} x2={x} y2={135} stroke="#484f58" strokeWidth="0.7" />
              <text x={x} y={144} textAnchor="middle" fill="#484f58" fontSize="6.5" fontFamily="monospace">10{exp < 0 ? "⁻" + Math.abs(exp) : exp}</text>
            </g>
          );
        })}
        {/* Markers */}
        <line x1={nXPess} y1={108} x2={nXPess} y2={130} stroke="#ff4444" strokeWidth="1.5" />
        <line x1={nXOpt} y1={108} x2={nXOpt} y2={130} stroke="#3fb950" strokeWidth="1.5" />
        <line x1={nXDrake} y1={106} x2={nXDrake} y2={132} stroke="#f7cc4a" strokeWidth="1" strokeDasharray="3,2" />
        <text x={nXDrake} y={104} textAnchor="middle" fill="#f7cc4a" fontSize="7" fontFamily="monospace">Drake</text>
        {nX > BAR_X && nX < BAR_X + BAR_W && (
          <circle cx={nX} cy={119} r={5} fill="#3fb950" stroke="#090d14" strokeWidth="1" />
        )}

        {/* Fermi paradox note */}
        <rect x={BAR_X} y={150} width={BAR_W} height={H - 160} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={BAR_X + 10} y={168} fill="#f7cc4a" fontSize="9" fontFamily="monospace" fontWeight="bold">Fermi Paradox</text>
        <text x={BAR_X + 10} y={183} fill="#484f58" fontSize="7.5" fontFamily="monospace">If N is large → where is</text>
        <text x={BAR_X + 10} y={196} fill="#484f58" fontSize="7.5" fontFamily="monospace">everyone? (Fermi, 1950)</text>
        <text x={BAR_X + 10} y={215} fill="#484f58" fontSize="7.5" fontFamily="monospace">• Great Filter hypothesis</text>
        <text x={BAR_X + 10} y={228} fill="#484f58" fontSize="7.5" fontFamily="monospace">• Zoo / Dark Forest theory</text>
        <text x={BAR_X + 10} y={241} fill="#484f58" fontSize="7.5" fontFamily="monospace">• L is very short (self-destruct)</text>
        <text x={BAR_X + 10} y={258} fill="#8b949e" fontSize="7.5" fontFamily="monospace">SETI: 60+ yrs, N_detected = 0</text>
      </svg>
      <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        {PARAMS.map((p, i) => (
          <div key={p.key} className="flex items-center gap-1">
            <span className="text-[10px] text-[#3fb950] font-mono">{p.symbol}:</span>
            <input type="range"
              min={logScale(values[i], p) ? Math.log10(p.min) : p.min}
              max={logScale(values[i], p) ? Math.log10(p.max) : p.max}
              step={logScale(values[i], p) ? 0.1 : p.step}
              value={logScale(values[i], p) ? Math.log10(Math.max(p.min, values[i])) : values[i]}
              onChange={e => {
                const v = parseFloat(e.target.value);
                setVal(i, logScale(values[i], p) ? Math.pow(10, v) : v);
              }}
              className="w-14 h-1" style={{ accentColor: "#3fb950" }} />
          </div>
        ))}
        <button onClick={() => setValues(PARAMS.map(p => p.current))}
          className="ml-auto px-2 py-1 rounded bg-[#21262d] text-[#8b949e] text-[10px] font-mono">↺ Reset</button>
      </div>
    </div>
  );
}
