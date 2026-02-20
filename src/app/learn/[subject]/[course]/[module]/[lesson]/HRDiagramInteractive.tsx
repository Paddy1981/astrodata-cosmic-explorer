"use client";
import { useState } from "react";

const W = 620, H = 340;
const PL = 58, PR = 20, PT = 24, PB = 44;
const CW = W - PL - PR, CH = H - PT - PB;

// Temperature axis: 40000 K (left) → 2500 K (right) — log scale
const T_MIN = 2500, T_MAX = 40000;
const L_MIN = -4, L_MAX = 6;   // log10(L/L☉)

function t2x(T: number) {
  return PL + CW * (1 - (Math.log10(T) - Math.log10(T_MIN)) / (Math.log10(T_MAX) - Math.log10(T_MIN)));
}
function l2y(logL: number) {
  return PT + CH * (1 - (logL - L_MIN) / (L_MAX - L_MIN));
}

// Spectral class colors
function tToColor(T: number): string {
  if (T > 30000) return "#9bb0ff";
  if (T > 10000) return "#aabfff";
  if (T > 7500)  return "#cad7ff";
  if (T > 6000)  return "#f8f7ff";
  if (T > 5200)  return "#fff4ea";
  if (T > 3700)  return "#ffd2a1";
  return "#ffad51";
}

// Main sequence stars
const MAIN_SEQ = [
  { name: "O5 star",      T: 42000, logL: 5.5,  R: 12, spectral: "O", desc: "Massive, very hot blue stars. Short-lived — only ~3 million years. Ionise surrounding nebulae." },
  { name: "B3 star",      T: 19000, logL: 4.0,  R: 6,  spectral: "B", desc: "Blue-white stars. Slightly less extreme than O type. Betelgeuse was once this type." },
  { name: "A1 (Sirius)",  T: 9940,  logL: 1.4,  R: 1.7,spectral: "A", desc: "White stars with strong hydrogen lines. Sirius is the brightest star in our night sky." },
  { name: "F5 star",      T: 6540,  logL: 0.6,  R: 1.3,spectral: "F", desc: "Yellow-white. Slightly hotter and more massive than our Sun." },
  { name: "G2 (Sun)",     T: 5778,  logL: 0.0,  R: 1.0,spectral: "G", desc: "Our Sun. Middle-aged G-type star. Will live ~10 billion years total." },
  { name: "K0 star",      T: 5270,  logL: -0.3, R: 0.85,spectral: "K",desc: "Orange dwarf. Cooler, dimmer, but very long-lived. Excellent for habitable planets." },
  { name: "M5 dwarf",     T: 3050,  logL: -2.5, R: 0.3, spectral: "M",desc: "Red dwarf — most common star in the galaxy. Lives trillions of years. Proxima Centauri is M5.5." },
];

const GIANTS = [
  { name: "Red Giant (1 M☉)", T: 3700, logL: 2.5, R: 40, spectral: "M", desc: "What our Sun will become in ~5 billion years. Outer layers expand as the core contracts." },
  { name: "Supergiant (Betelgeuse)", T: 3500, logL: 5.0, R: 900, spectral: "M", desc: "Betelgeuse: ~700 R☉. So large it would extend to Jupiter's orbit if placed at the Sun." },
];

const WHITE_DWARFS = [
  { name: "White Dwarf",  T: 25000, logL: -2.2, R: 0.012, spectral: "DA", desc: "Earth-sized stellar remnant. No longer fusing hydrogen — cooling slowly over billions of years." },
  { name: "Cool WD",      T: 8000,  logL: -3.5, R: 0.012, spectral: "DA", desc: "Old white dwarf — has been cooling for billions of years. Eventually becomes a cold 'black dwarf'." },
];

const ALL_STARS = [...MAIN_SEQ, ...GIANTS, ...WHITE_DWARFS];

export default function HRDiagramInteractive({ description }: { description?: string }) {
  const [selected, setSelected] = useState<number | null>(4); // Sun default

  const sel = selected !== null ? ALL_STARS[selected] : null;

  // T axis ticks
  const tTicks = [40000, 20000, 10000, 7000, 5000, 3500];
  const lTicks = [-4, -2, 0, 2, 4, 6];
  const spectralLabels = [
    { T: 35000, label: "O" },
    { T: 15000, label: "B" },
    { T: 9000,  label: "A" },
    { T: 6500,  label: "F" },
    { T: 5500,  label: "G" },
    { T: 4500,  label: "K" },
    { T: 3000,  label: "M" },
  ];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Hertzsprung-Russell Diagram
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The H-R Diagram — Luminosity vs Temperature</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Click any star to inspect its properties. The main sequence runs top-left to bottom-right. Giants and white dwarfs occupy distinct regions."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Grid lines */}
        {lTicks.map(l => (
          <g key={l}>
            <line x1={PL} y1={l2y(l)} x2={PL + CW} y2={l2y(l)} stroke="#1d2230" strokeWidth={l === 0 ? 1 : 0.75} />
            <text x={PL - 6} y={l2y(l) + 3.5} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
              10^{l}
            </text>
          </g>
        ))}
        {tTicks.map(T => (
          <g key={T}>
            <line x1={t2x(T)} y1={PT} x2={t2x(T)} y2={PT + CH} stroke="#1d2230" strokeWidth="0.75" />
            <text x={t2x(T)} y={H - PB + 13} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">
              {T >= 1000 ? `${T / 1000}k` : T}
            </text>
          </g>
        ))}

        {/* Spectral class labels */}
        {spectralLabels.map(sl => (
          <text key={sl.label} x={t2x(sl.T)} y={PT - 8} textAnchor="middle"
            fill="#58a6ff" fontSize="9" fontFamily="monospace" fontWeight="bold">{sl.label}</text>
        ))}

        {/* Axis labels */}
        <text x={PL + CW / 2} y={H - 4} textAnchor="middle" fill="#8b949e" fontSize="9">Temperature (K) →  hot</text>
        <text x={PL + CW - 2} y={H - 4} textAnchor="end" fill="#484f58" fontSize="8">cool →</text>
        <text x={12} y={PT + CH / 2} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90, 12, ${PT + CH / 2})`}>Luminosity (L☉)</text>

        {/* Region labels */}
        <text x={t2x(5000)} y={PT + 14} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace">RED GIANTS</text>
        <text x={t2x(20000)} y={l2y(-3)} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace">WHITE DWARFS</text>
        <text x={t2x(8000)} y={l2y(4.5)} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace">SUPERGIANTS</text>
        <text x={t2x(8000)} y={l2y(1)} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace" transform={`rotate(-35, ${t2x(8000)}, ${l2y(1)})`}>MAIN SEQUENCE</text>

        {/* Stars */}
        {ALL_STARS.map((star, i) => {
          const x = t2x(star.T);
          const y = l2y(star.logL);
          const r = Math.max(4, Math.min(14, 4 + Math.log10(star.R + 1) * 5));
          const isSel = selected === i;
          return (
            <g key={i} onClick={() => setSelected(i === selected ? null : i)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={r * 2.2} fill={tToColor(star.T)} fillOpacity={isSel ? 0.25 : 0.08}
                style={{ transition: "fill-opacity 0.2s" }} />
              <circle cx={x} cy={y} r={r} fill={tToColor(star.T)} fillOpacity={isSel ? 1 : 0.7}
                stroke={isSel ? "#ffffff" : "none"} strokeWidth="1.5"
                style={{ transition: "fill-opacity 0.2s" }} />
            </g>
          );
        })}

        {/* Info panel */}
        {sel !== null && (
          <g>
            <rect x={PL + 6} y={PT + 8} width={200} height={110} rx={6}
              fill="#0b1018" stroke={tToColor(sel.T)} strokeWidth="0.75" strokeOpacity="0.7" />
            <text x={PL + 16} y={PT + 26} fill={tToColor(sel.T)} fontSize="11" fontFamily="monospace" fontWeight="bold">{sel.name}</text>
            <text x={PL + 16} y={PT + 40} fill="#8b949e" fontSize="8" fontFamily="monospace">T_eff  = {sel.T.toLocaleString()} K</text>
            <text x={PL + 16} y={PT + 53} fill="#8b949e" fontSize="8" fontFamily="monospace">log L  = {sel.logL >= 0 ? "+" : ""}{sel.logL}</text>
            <text x={PL + 16} y={PT + 66} fill="#8b949e" fontSize="8" fontFamily="monospace">R      ≈ {sel.R} R☉</text>
            <text x={PL + 16} y={PT + 79} fill="#8b949e" fontSize="8" fontFamily="monospace">Class  : {sel.spectral}</text>
            <foreignObject x={PL + 10} y={PT + 86} width={190} height={36}>
              <div style={{ color: "#484f58", fontSize: 7.5, fontFamily: "monospace", lineHeight: 1.4 }}>{sel.desc}</div>
            </foreignObject>
          </g>
        )}
      </svg>

      <div className="px-5 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <p className="text-[10px] text-[#484f58] font-mono">
          Click any star to inspect · Point size ∝ stellar radius · Temperature axis runs hot→cool (reversed from convention)
        </p>
      </div>
    </div>
  );
}
