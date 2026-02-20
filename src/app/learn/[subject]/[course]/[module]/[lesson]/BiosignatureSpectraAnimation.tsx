"use client";
import { useState } from "react";

const W = 620, H = 300;
const PL = 52, PR = 16, PT = 20, PB = 32;
const CW = W - PL - PR, CH = H - PT - PB - 60;

const WL_MIN = 0.4, WL_MAX = 20;
const wl2x = (wl: number) => PL + (Math.log10(wl / WL_MIN) / Math.log10(WL_MAX / WL_MIN)) * CW;

type AtmProfile = {
  name: string; label: string; color: string; desc: string;
  features: Array<{ wl: number; w: number; d: number; mol: string }>;
};

const PROFILES: AtmProfile[] = [
  {
    name: "bare", label: "Rocky / No Atmosphere", color: "#484f58", desc: "No absorption features — barren world like the Moon",
    features: [],
  },
  {
    name: "venus", label: "Venus-like", color: "#f0883e", desc: "Dense CO₂ atmosphere, extreme greenhouse — hostile to life",
    features: [
      { wl: 4.3, w: 0.5, d: 0.98, mol: "CO₂" }, { wl: 15, w: 3, d: 0.95, mol: "CO₂" },
      { wl: 2.7, w: 0.4, d: 0.90, mol: "CO₂" },
    ],
  },
  {
    name: "early", label: "Early Earth (3.5 Gya)", color: "#f7cc4a", desc: "CH₄ + CO₂ greenhouse — life present but no free O₂ yet",
    features: [
      { wl: 4.3, w: 0.4, d: 0.70, mol: "CO₂" }, { wl: 3.3, w: 0.35, d: 0.75, mol: "CH₄" },
      { wl: 7.7, w: 1.0, d: 0.65, mol: "CH₄" }, { wl: 2.7, w: 0.3, d: 0.55, mol: "H₂O" },
      { wl: 6.3, w: 0.8, d: 0.60, mol: "H₂O" },
    ],
  },
  {
    name: "modern", label: "Modern Earth ★ Life!", color: "#3fb950", desc: "O₂ + O₃ + H₂O + CH₄ disequilibrium — unmistakable biosignature",
    features: [
      { wl: 0.76, w: 0.03, d: 0.85, mol: "O₂" }, { wl: 9.6, w: 1.2, d: 0.88, mol: "O₃" },
      { wl: 4.3, w: 0.4, d: 0.60, mol: "CO₂" }, { wl: 6.3, w: 0.8, d: 0.75, mol: "H₂O" },
      { wl: 2.7, w: 0.3, d: 0.65, mol: "H₂O" }, { wl: 7.7, w: 0.8, d: 0.45, mol: "CH₄" },
      { wl: 17,  w: 2.5, d: 0.65, mol: "N₂O" },
    ],
  },
  {
    name: "mars", label: "Mars-like", color: "#cc4422", desc: "Thin CO₂ — no liquid water, no detectable life",
    features: [
      { wl: 4.3, w: 0.5, d: 0.55, mol: "CO₂" }, { wl: 15,  w: 2.5, d: 0.50, mol: "CO₂" },
    ],
  },
];

function buildCurve(profile: AtmProfile, n = 300) {
  return Array.from({ length: n }, (_, i) => {
    const frac = i / (n - 1);
    const wl = WL_MIN * Math.pow(WL_MAX / WL_MIN, frac);
    let depth = 0;
    for (const f of profile.features) {
      const logDist = (Math.log10(wl) - Math.log10(f.wl)) / (f.w / f.wl);
      depth += f.d * Math.exp(-logDist * logDist * 3);
    }
    return { wl, x: wl2x(wl), y: PT + CH * (1 - Math.min(depth, 1) * 0.9) };
  });
}

const WL_TICKS = [0.5, 1, 2, 5, 10, 20];
const KEY_FEATURES = [
  { wl: 0.76, label: "O₂", color: "#3fb950" }, { wl: 2.7, label: "H₂O", color: "#4488ff" },
  { wl: 4.3, label: "CO₂", color: "#f0883e"  }, { wl: 7.7, label: "CH₄", color: "#3fb950" },
  { wl: 9.6, label: "O₃",  color: "#bc8cff"  }, { wl: 15,  label: "CO₂", color: "#f0883e" },
];

export default function BiosignatureSpectraAnimation({ description }: { description?: string }) {
  const [idx, setIdx] = useState(3); // default: modern Earth
  const profile = PROFILES[idx];
  const pts = buildCurve(profile);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillD = pathD + ` L${PL + CW},${PT + CH} L${PL},${PT + CH} Z`;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          🧬 Interactive · Biosignature Detection
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Atmospheric Spectra of Different Planet Types</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Compare atmospheric spectra of different planet types. Modern Earth's spectrum is unique — simultaneous O₂ + CH₄ cannot coexist without life continuously replenishing them."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <text x={12} y={13} fill="#30363d" fontSize="8.5" fontFamily="monospace">MID-INFRARED SPECTRUM · log wavelength scale (0.4–20 µm)</text>
        {[0, 0.5, 1].map(f => {
          const y = PT + CH * (1 - f * 0.9);
          return (
            <g key={f}>
              <line x1={PL} y1={y} x2={PL + CW} y2={y} stroke="#1d2230" strokeWidth="0.75" />
              <text x={PL - 4} y={y + 3.5} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">{(f * 100).toFixed(0)}%</text>
            </g>
          );
        })}
        {WL_TICKS.map(wl => (
          <g key={wl}>
            <line x1={wl2x(wl)} y1={PT} x2={wl2x(wl)} y2={PT + CH} stroke="#1d2230" strokeWidth="0.75" />
            <text x={wl2x(wl)} y={PT + CH + 13} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{wl}</text>
          </g>
        ))}
        {KEY_FEATURES.map(kf => {
          const x = wl2x(kf.wl);
          if (x < PL || x > PL + CW) return null;
          return (
            <g key={kf.label + kf.wl}>
              <line x1={x} y1={PT} x2={x} y2={PT + CH} stroke={kf.color} strokeWidth="0.6" strokeOpacity="0.35" strokeDasharray="3,3" />
              <text x={x} y={PT - 4} textAnchor="middle" fill={kf.color} fontSize="7" fontFamily="monospace" fillOpacity="0.75">{kf.label}</text>
            </g>
          );
        })}
        <path d={fillD} fill={profile.color} fillOpacity="0.10" />
        <path d={pathD} fill="none" stroke={profile.color} strokeWidth="2.2" strokeOpacity="0.95" />
        <text x={PL + CW / 2} y={H - 48} textAnchor="middle" fill="#8b949e" fontSize="9">Wavelength (µm)</text>
        <text x={12} y={PT + CH / 2} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90, 12, ${PT + CH / 2})`}>Absorption</text>
        {/* Info box */}
        <rect x={PL + 6} y={PT + 8} width={210} height={40} rx={5} fill="#0b1018" stroke={profile.color} strokeWidth="0.75" strokeOpacity="0.6" />
        <text x={PL + 16} y={PT + 21} fill={profile.color} fontSize="10" fontFamily="monospace" fontWeight="bold">{profile.label}</text>
        <text x={PL + 16} y={PT + 34} fill="#8b949e" fontSize="7.5" fontFamily="monospace">{profile.desc}</text>
      </svg>
      <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d]">
        <div className="flex gap-2 flex-wrap">
          {PROFILES.map((p, i) => (
            <button key={p.name} onClick={() => setIdx(i)}
              className={`px-3 py-1 rounded text-[10px] font-mono transition-colors border ${i === idx ? "text-[#0d1117] font-bold border-transparent" : "bg-[#21262d] border-[#30363d] text-[#484f58]"}`}
              style={i === idx ? { background: p.color } : {}}>
              {p.label}{p.name === "modern" ? " ★" : ""}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#484f58] font-mono mt-2">★ = detectable biosignature · JWST can observe wavelengths 0.6–28 µm</p>
      </div>
    </div>
  );
}
