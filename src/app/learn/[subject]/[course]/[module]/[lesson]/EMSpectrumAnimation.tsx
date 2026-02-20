"use client";
import { useState } from "react";

const W = 620, H = 310;

// EM spectrum bands (log scale: wavelength in metres)
const BANDS = [
  {
    id: "radio", name: "Radio", range: [1e-3, 1e1], color: "#884444",
    lambda: "1 mm – 10 m", freq: "30 MHz – 300 GHz", energy: "~μeV",
    astro: ["Pulsars", "CMB (Planck)", "21-cm HI line", "Synchrotron jets"],
    telescope: "Radio dishes (Parkes, VLA, ALMA)",
    icon: "📡",
  },
  {
    id: "microwave", name: "Microwave", range: [1e-3, 1e-1], color: "#cc6633",
    lambda: "1 mm – 10 cm", freq: "3–300 GHz", energy: "~meV",
    astro: ["CMB fluctuations", "Molecular clouds", "SZ effect"],
    telescope: "ALMA, Planck satellite",
    icon: "🌡️",
  },
  {
    id: "infrared", name: "Infrared", range: [7e-7, 1e-3], color: "#cc8800",
    lambda: "700 nm – 1 mm", freq: "0.3–430 THz", energy: "~0.01–1.7 eV",
    astro: ["Cool stars, dust", "Galaxy centres", "JWST deep fields", "Exoplanet atmospheres"],
    telescope: "JWST, Spitzer, Herschel",
    icon: "🔭",
  },
  {
    id: "optical", name: "Visible", range: [4e-7, 7e-7], color: "#44aa44",
    lambda: "400–700 nm", freq: "430–750 THz", energy: "1.8–3.1 eV",
    astro: ["Stars, galaxies", "Stellar spectra", "HII nebulae", "Supernovae"],
    telescope: "HST, VLT, ELT",
    icon: "👁️",
  },
  {
    id: "uv", name: "Ultraviolet", range: [1e-8, 4e-7], color: "#6644cc",
    lambda: "10–400 nm", freq: "0.75–30 PHz", energy: "3–120 eV",
    astro: ["Hot stars (O/B type)", "AGN accretion discs", "Stellar UV"],
    telescope: "HST/STIS, GALEX, XMM-OM",
    icon: "🔆",
  },
  {
    id: "xray", name: "X-ray", range: [1e-11, 1e-8], color: "#4488ff",
    lambda: "0.01–10 nm", freq: "30 PHz – 30 EHz", energy: "0.1–120 keV",
    astro: ["Black hole accretion", "Neutron stars", "Galaxy clusters", "Supernova remnants"],
    telescope: "Chandra, XMM-Newton, eROSITA",
    icon: "⚡",
  },
  {
    id: "gamma", name: "Gamma-ray", range: [1e-14, 1e-11], color: "#bc8cff",
    lambda: "< 0.01 nm", freq: "> 30 EHz", energy: "> 100 keV",
    astro: ["GRBs", "Pulsars", "Pair production", "Nuclear decay in SNe"],
    telescope: "Fermi-LAT, INTEGRAL, CTA",
    icon: "💫",
  },
];

const LOG_MIN = Math.log10(1e-14);
const LOG_MAX = Math.log10(10);
const LOG_RANGE = LOG_MAX - LOG_MIN;

function lambdaToX(lambda: number): number {
  return 20 + ((Math.log10(lambda) - LOG_MIN) / LOG_RANGE) * (W - 40);
}

// Visible spectrum colour at wavelength nm
function visColor(nm: number): string {
  if (nm < 380) return "#8800ff";
  if (nm < 450) return `rgb(${Math.round((450 - nm) / 70 * 138)},0,${Math.round(180 + (nm - 380) / 70 * 75)})`;
  if (nm < 495) return `rgb(0,0,255)`;
  if (nm < 560) return `rgb(0,${Math.round((nm - 495) / 65 * 255)},${Math.round(255 - (nm - 495) / 65 * 255)})`;
  if (nm < 590) return `rgb(${Math.round((nm - 560) / 30 * 255)},255,0)`;
  if (nm < 625) return `rgb(255,${Math.round(255 - (nm - 590) / 35 * 255)},0)`;
  return `rgb(255,0,0)`;
}

const BAR_Y = 90, BAR_H = 40;

export default function EMSpectrumAnimation({ description }: { description?: string }) {
  const [selected, setSelected] = useState(3); // optical

  const band = BANDS[selected];

  // Build rainbow visible gradient stops
  const visStops = Array.from({ length: 30 }, (_, i) => {
    const nm = 380 + i * (700 - 380) / 30;
    const x = lambdaToX(nm * 1e-9);
    return { x, col: visColor(nm) };
  });

  // Log tick marks
  const lambdaTicks = [-14, -12, -10, -8, -6, -4, -2, 0, 1];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-widest block mb-1">
          🔭 Interactive · Electromagnetic Spectrum
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Invisible Universe — All Wavelengths of Light</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Human eyes detect a tiny sliver of the EM spectrum. Modern telescopes observe from radio waves to gamma-rays, each revealing a different cosmic phenomenon. Click a band to explore what astronomers see."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>

        {/* Band rectangles */}
        {BANDS.map((b, i) => {
          const x1 = lambdaToX(b.range[0]);
          const x2 = lambdaToX(b.range[1]);
          const bw = Math.max(2, x2 - x1);
          return (
            <rect key={b.id} x={x1} y={BAR_Y} width={bw} height={BAR_H}
              fill={b.color} fillOpacity={selected === i ? 0.85 : 0.35}
              stroke={selected === i ? b.color : "none"} strokeWidth="1.5"
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(i)} />
          );
        })}

        {/* Visible rainbow overlay */}
        {visStops.map((s, i) => i < visStops.length - 1 && (
          <rect key={i} x={s.x} y={BAR_Y + 2} width={visStops[i + 1].x - s.x} height={BAR_H - 4}
            fill={s.col} fillOpacity="0.6" />
        ))}

        {/* Band labels */}
        {BANDS.map((b, i) => {
          const x1 = lambdaToX(b.range[0]);
          const x2 = lambdaToX(b.range[1]);
          const cx = (x1 + x2) / 2;
          return (
            <text key={b.id} x={cx} y={BAR_Y - 6} textAnchor="middle"
              fill={selected === i ? b.color : "#484f58"} fontSize={selected === i ? 9 : 7.5}
              fontFamily="monospace" fontWeight={selected === i ? "bold" : "normal"}
              style={{ cursor: "pointer" }} onClick={() => setSelected(i)}>
              {b.name}
            </text>
          );
        })}

        {/* Wavelength axis */}
        {lambdaTicks.map(exp => {
          const x = lambdaToX(Math.pow(10, exp));
          return (
            <g key={exp}>
              <line x1={x} y1={BAR_Y + BAR_H} x2={x} y2={BAR_Y + BAR_H + 5} stroke="#30363d" strokeWidth="0.8" />
              <text x={x} y={BAR_Y + BAR_H + 14} textAnchor="middle" fill="#484f58" fontSize="6.5" fontFamily="monospace">
                10{exp < 0 ? String(exp).replace("-", "⁻") : exp}m
              </text>
            </g>
          );
        })}
        <text x={W / 2} y={BAR_Y + BAR_H + 27} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">Wavelength →</text>
        <text x={20} y={BAR_Y + BAR_H + 27} fill="#484f58" fontSize="8" fontFamily="monospace">γ-ray</text>
        <text x={W - 20} y={BAR_Y + BAR_H + 27} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">Radio</text>

        {/* Info panel for selected band */}
        <rect x={20} y={BAR_Y + BAR_H + 38} width={W - 40} height={H - BAR_Y - BAR_H - 52} rx={4}
          fill="#0b1018" stroke={band.color} strokeWidth="0.8" strokeOpacity="0.5" />
        <text x={36} y={BAR_Y + BAR_H + 56} fill={band.color} fontSize="11" fontFamily="monospace" fontWeight="bold">
          {band.icon} {band.name}
        </text>
        <text x={200} y={BAR_Y + BAR_H + 56} fill="#484f58" fontSize="8" fontFamily="monospace">λ: {band.lambda}</text>
        <text x={360} y={BAR_Y + BAR_H + 56} fill="#484f58" fontSize="8" fontFamily="monospace">f: {band.freq}</text>
        <text x={510} y={BAR_Y + BAR_H + 56} fill="#484f58" fontSize="8" fontFamily="monospace">E: {band.energy}</text>
        <text x={36} y={BAR_Y + BAR_H + 70} fill="#8b949e" fontSize="8" fontFamily="monospace">
          🔭 {band.telescope}
        </text>
        <text x={36} y={BAR_Y + BAR_H + 84} fill="#484f58" fontSize="8" fontFamily="monospace">
          Sources: {band.astro.join(" · ")}
        </text>
      </svg>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        {BANDS.map((b, i) => (
          <button key={b.id} onClick={() => setSelected(i)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${selected === i ? "font-bold" : "bg-[#21262d] text-[#8b949e]"}`}
            style={selected === i ? { background: b.color, color: "#0d1117" } : {}}>
            {b.icon} {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}
