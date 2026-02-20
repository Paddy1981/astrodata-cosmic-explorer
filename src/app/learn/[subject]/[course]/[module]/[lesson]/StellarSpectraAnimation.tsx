"use client";
import { useState } from "react";

const W = 620, H = 280;
const PL = 52, PR = 16, PT = 58, PB = 44;
const CW = W - PL - PR, CH = H - PT - PB;

// Wavelength range 380-750 nm
const WL_MIN = 380, WL_MAX = 750;

function wl2x(wl: number) {
  return PL + ((wl - WL_MIN) / (WL_MAX - WL_MIN)) * CW;
}

// Blackbody spectral radiance (Wien approx, normalised)
function planck(wl_nm: number, T: number): number {
  const wl_m = wl_nm * 1e-9;
  const h = 6.626e-34, c = 3e8, k = 1.38e-23;
  const x = (h * c) / (wl_m * k * T);
  return (1 / (wl_m ** 5)) * (1 / (Math.exp(Math.min(x, 700)) - 1));
}

function buildCurve(T: number): Array<{ x: number; y: number; wl: number }> {
  const N = 120;
  const pts = Array.from({ length: N }, (_, i) => {
    const wl = WL_MIN + (WL_MAX - WL_MIN) * (i / (N - 1));
    return { wl, B: planck(wl, T) };
  });
  const maxB = Math.max(...pts.map(p => p.B));
  return pts.map(p => ({
    wl: p.wl,
    x: wl2x(p.wl),
    y: PT + CH * (1 - p.B / maxB) * 0.92 + CH * 0.04,
  }));
}

// Wien peak wavelength
function wienPeak(T: number): number {
  return 2.898e6 / T; // nm
}

// Wavelength to approximate RGB color
function wl2rgb(wl: number): string {
  let r = 0, g = 0, b = 0;
  if      (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; b = 1; }
  else if (wl >= 440 && wl < 490) { g = (wl - 440) / 50; b = 1; }
  else if (wl >= 490 && wl < 510) { g = 1; b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70; g = 1; }
  else if (wl >= 580 && wl < 645) { r = 1; g = -(wl - 645) / 65; }
  else if (wl >= 645 && wl < 750) { r = 1; }
  const factor = wl >= 380 && wl < 420 ? 0.3 + (wl - 380) / 40 * 0.7
    : wl >= 700 && wl < 750 ? 0.3 + (750 - wl) / 50 * 0.7 : 1;
  return `rgb(${Math.round(r * 255 * factor)},${Math.round(g * 255 * factor)},${Math.round(b * 255 * factor)})`;
}

// Star type presets
const STAR_PRESETS = [
  { name: "M (3000K)",  T: 3000,  color: "#ffad51" },
  { name: "K (4500K)",  T: 4500,  color: "#ffd2a1" },
  { name: "G/Sun (5778K)", T: 5778, color: "#fff4ea" },
  { name: "F (7000K)",  T: 7000,  color: "#cad7ff" },
  { name: "A (10000K)", T: 10000, color: "#aabfff" },
  { name: "B (25000K)", T: 25000, color: "#9bb0ff" },
];

// Spectral absorption lines (simplified)
const ABS_LINES: Array<{ wl: number; label: string; element: string }> = [
  { wl: 393, label: "K", element: "Ca II" },
  { wl: 397, label: "H", element: "Ca II" },
  { wl: 434, label: "Hγ", element: "H" },
  { wl: 486, label: "Hβ", element: "H" },
  { wl: 589, label: "Na D", element: "Na" },
  { wl: 656, label: "Hα", element: "H" },
];

export default function StellarSpectraAnimation({ description }: { description?: string }) {
  const [temp, setTemp] = useState(5778);
  const [showLines, setShowLines] = useState(true);

  const curve = buildCurve(temp);
  const peakWl = wienPeak(temp);
  const peakX = Math.max(PL, Math.min(PL + CW, wl2x(peakWl)));

  const pathD = curve.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillD = pathD + ` L${PL + CW},${PT + CH} L${PL},${PT + CH} Z`;

  // Star color from T
  const starColor = temp < 3500 ? "#ffad51" : temp < 5000 ? "#ffd2a1" : temp < 6500 ? "#fff4ea" : temp < 8000 ? "#cad7ff" : "#9bb0ff";

  const wlTicks = [400, 450, 500, 550, 600, 650, 700];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Stellar Blackbody Spectra
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Wien&apos;s Law — How Temperature Shifts the Spectrum</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Drag the temperature slider to see how the blackbody spectrum shifts. Hotter stars peak in the blue/UV; cooler stars peak in the red/infrared. Wien's Law: λ_max = 2.898 mm·K / T."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <linearGradient id="ss-rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            {Array.from({ length: 37 }, (_, i) => {
              const wl = WL_MIN + i * 10;
              return <stop key={wl} offset={`${(i / 36) * 100}%`} stopColor={wl2rgb(wl)} stopOpacity="0.85" />;
            })}
          </linearGradient>
        </defs>

        {/* Rainbow spectrum bar */}
        <rect x={PL} y={PT - 22} width={CW} height={14} fill="url(#ss-rainbow)" rx={2} />

        {/* Grid */}
        {[0.25, 0.5, 0.75, 1.0].map(f => {
          const y = PT + CH * (1 - f * 0.92 + 0.04);
          return (
            <g key={f}>
              <line x1={PL} y1={y} x2={PL + CW} y2={y} stroke="#1d2230" strokeWidth="0.75" />
              <text x={PL - 6} y={y + 3.5} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">
                {(f * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {wlTicks.map(wl => (
          <g key={wl}>
            <line x1={wl2x(wl)} y1={PT} x2={wl2x(wl)} y2={PT + CH} stroke="#1d2230" strokeWidth="0.75" />
            <text x={wl2x(wl)} y={H - PB + 13} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">
              {wl}
            </text>
          </g>
        ))}
        <text x={PL + CW / 2} y={H - 8} textAnchor="middle" fill="#8b949e" fontSize="9">Wavelength (nm)</text>
        <text x={12} y={PT + CH / 2} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90, 12, ${PT + CH / 2})`}>Relative Intensity</text>

        {/* Filled curve */}
        <path d={fillD} fill={starColor} fillOpacity="0.12" />
        <path d={pathD} fill="none" stroke={starColor} strokeWidth="2.5" strokeOpacity="0.95" />

        {/* Peak wavelength marker */}
        {peakWl >= WL_MIN && peakWl <= WL_MAX && (
          <>
            <line x1={peakX} y1={PT} x2={peakX} y2={PT + CH}
              stroke={starColor} strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.7" />
            <rect x={peakX - 28} y={PT + 4} width={60} height={16} rx={3} fill="#0b1018" stroke={starColor} strokeWidth="0.5" strokeOpacity="0.5" />
            <text x={peakX + 2} y={PT + 15} textAnchor="middle" fill={starColor} fontSize="8" fontFamily="monospace">
              λ_max = {Math.round(peakWl)} nm
            </text>
          </>
        )}

        {/* Absorption lines */}
        {showLines && ABS_LINES.map(l => {
          if (l.wl < WL_MIN || l.wl > WL_MAX) return null;
          const x = wl2x(l.wl);
          return (
            <g key={l.label}>
              <line x1={x} y1={PT} x2={x} y2={PT + CH} stroke="#000" strokeWidth="2" strokeOpacity="0.7" />
              <text x={x} y={PT - 10} textAnchor="middle" fill="#8b949e" fontSize="7" fontFamily="monospace">{l.label}</text>
            </g>
          );
        })}

        {/* Star T readout */}
        <rect x={W - 130} y={8} width={122} height={34} rx={5} fill="#0b1018" stroke={starColor} strokeWidth="0.75" strokeOpacity="0.5" />
        <text x={W - 69} y={22} textAnchor="middle" fill={starColor} fontSize="13" fontFamily="monospace" fontWeight="bold">
          {temp.toLocaleString()} K
        </text>
        <text x={W - 69} y={34} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">
          λ_max = {Math.round(peakWl)} nm
        </text>
      </svg>

      <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d] space-y-2">
        <div className="flex gap-2 flex-wrap">
          {STAR_PRESETS.map(p => (
            <button key={p.name} onClick={() => setTemp(p.T)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${temp === p.T
                ? "text-[#0d1117] font-bold"
                : "bg-[#21262d] text-[#8b949e]"}`}
              style={temp === p.T ? { background: p.color } : {}}>
              {p.name}
            </button>
          ))}
          <button onClick={() => setShowLines(s => !s)}
            className={`px-2 py-1 rounded text-[10px] font-mono ml-auto transition-colors ${showLines
              ? "bg-[#21262d] text-[#58a6ff]" : "bg-[#21262d] text-[#484f58]"}`}>
            {showLines ? "Hide" : "Show"} lines
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">T (K):</span>
          <input type="range" min={2500} max={40000} step={100} value={temp}
            onChange={e => setTemp(parseInt(e.target.value))}
            className="flex-1 h-1.5" style={{ accentColor: starColor }} />
          <span className="text-[10px] font-mono w-20 text-right" style={{ color: starColor }}>{temp.toLocaleString()} K</span>
        </div>
        <p className="text-[10px] text-[#484f58] font-mono">
          Wien: λ_max = 2898000 / {temp} = {Math.round(peakWl)} nm
        </p>
      </div>
    </div>
  );
}
