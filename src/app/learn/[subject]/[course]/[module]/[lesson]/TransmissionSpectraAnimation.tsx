"use client";
import { useState } from "react";

const W = 620, H = 320;
const SPEC_Y = 160, SPEC_H = 120;
const PL = 52, PR = 16, PT = 14, PB = 28;
const CW = W - PL - PR, CH = SPEC_H - PT - PB;

// Wavelength range 0.5–5 µm (JWST NIRSpec + MIRI)
const WL_MIN = 0.5, WL_MAX = 5.0;
const wl2x = (wl: number) => PL + ((wl - WL_MIN) / (WL_MAX - WL_MIN)) * CW;

// Molecule absorption features: [wl_center, width, depth, color]
type Feature = { wl: number; w: number; d: number; color: string };
const MOLECULES: Record<string, { color: string; features: Feature[]; label: string }> = {
  H2O:  { color: "#4488ff", label: "H₂O (Water vapour)", features: [
    { wl: 0.94, w: 0.06, d: 0.55, color: "#4488ff" }, { wl: 1.14, w: 0.08, d: 0.70, color: "#4488ff" },
    { wl: 1.38, w: 0.10, d: 0.90, color: "#4488ff" }, { wl: 1.87, w: 0.14, d: 0.85, color: "#4488ff" },
    { wl: 2.70, w: 0.20, d: 0.95, color: "#4488ff" },
  ]},
  CO2:  { color: "#f0883e", label: "CO₂ (Carbon dioxide)", features: [
    { wl: 1.60, w: 0.08, d: 0.50, color: "#f0883e" }, { wl: 2.01, w: 0.10, d: 0.60, color: "#f0883e" },
    { wl: 4.26, w: 0.30, d: 0.98, color: "#f0883e" },
  ]},
  CH4:  { color: "#3fb950", label: "CH₄ (Methane — biosig!)", features: [
    { wl: 1.67, w: 0.10, d: 0.45, color: "#3fb950" }, { wl: 2.30, w: 0.15, d: 0.65, color: "#3fb950" },
    { wl: 3.30, w: 0.25, d: 0.80, color: "#3fb950" },
  ]},
  O3:   { color: "#bc8cff", label: "O₃ (Ozone — biosig!)", features: [
    { wl: 0.60, w: 0.08, d: 0.30, color: "#bc8cff" }, { wl: 3.30, w: 0.20, d: 0.40, color: "#bc8cff" },
    { wl: 4.70, w: 0.20, d: 0.50, color: "#bc8cff" },
  ]},
  CO:   { color: "#f7cc4a", label: "CO (Carbon monoxide)", features: [
    { wl: 2.35, w: 0.12, d: 0.55, color: "#f7cc4a" }, { wl: 4.67, w: 0.25, d: 0.70, color: "#f7cc4a" },
  ]},
};

function buildSpectrum(active: Set<string>, n = 300) {
  return Array.from({ length: n }, (_, i) => {
    const wl = WL_MIN + (WL_MAX - WL_MIN) * (i / (n - 1));
    let depth = 0;
    for (const mol of active) {
      const m = MOLECULES[mol];
      for (const f of m.features) {
        const dx = (wl - f.wl) / f.w;
        depth += f.d * Math.exp(-dx * dx * 2.5);
      }
    }
    depth = Math.min(depth, 1);
    return { wl, x: wl2x(wl), y: SPEC_Y + PT + CH * (1 - depth * 0.85) };
  });
}

const WL_TICKS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

// Star + planet transit preview
const STAR_R = 46, PLAN_R = 14, SCX = W / 2, SCY = 76;

export default function TransmissionSpectraAnimation({ description }: { description?: string }) {
  const [active, setActive] = useState<Set<string>>(new Set(["H2O", "CO2"]));

  function toggle(mol: string) {
    setActive(prev => {
      const next = new Set(prev);
      next.has(mol) ? next.delete(mol) : next.add(mol);
      return next;
    });
  }

  const pts = buildSpectrum(active);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillD = pathD + ` L${PL + CW},${SPEC_Y + PT + CH} L${PL},${SPEC_Y + PT + CH} Z`;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-widest block mb-1">
          🪐 Interactive · Transmission Spectroscopy
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Reading a Planet&apos;s Atmosphere</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Toggle molecules on/off to build an atmospheric spectrum. During transit, each molecule absorbs light at specific infrared wavelengths — JWST detects these dips with unprecedented precision."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="ts-star" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff7d0" /><stop offset="50%" stopColor="#ffb030" /><stop offset="100%" stopColor="#e05000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="ts-planet" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#2244aa" stopOpacity="0.9" /><stop offset="100%" stopColor="#07090e" />
          </radialGradient>
          <radialGradient id="ts-atm" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#4488ff" stopOpacity="0" /><stop offset="100%" stopColor="#4488ff" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Transit view */}
        <text x={12} y={14} fill="#30363d" fontSize="8.5" fontFamily="monospace">TRANSIT VIEW — starlight filtered through atmosphere</text>
        <circle cx={SCX} cy={SCY} r={STAR_R} fill="url(#ts-star)" />
        <circle cx={SCX} cy={SCY} r={PLAN_R * 1.7} fill="url(#ts-atm)" />
        <circle cx={SCX} cy={SCY} r={PLAN_R} fill="url(#ts-planet)" />
        {/* Light rays through atmosphere */}
        {[-1, 1].map(s => (
          <g key={s}>
            <line x1={10} y1={SCY + s * (PLAN_R + 4)} x2={SCX - STAR_R - 6} y2={SCY + s * (PLAN_R + 4)}
              stroke="#ffdd88" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4,3" />
            <line x1={SCX + STAR_R + 6} y1={SCY + s * (PLAN_R + 4)} x2={W - 10} y2={SCY + s * (PLAN_R + 4)}
              stroke="#4488ff" strokeWidth="1.2" strokeOpacity="0.6" strokeDasharray="4,3" />
          </g>
        ))}
        <text x={W / 2} y={SCY + STAR_R + 18} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
          Filtered light → JWST NIRSpec / MIRI
        </text>

        {/* Spectrum panel */}
        <rect x={0} y={SPEC_Y - 4} width={W} height={SPEC_H + 10} fill="#0b1018" />
        <line x1={0} y1={SPEC_Y - 4} x2={W} y2={SPEC_Y - 4} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={SPEC_Y + 10} fill="#30363d" fontSize="8.5" fontFamily="monospace">TRANSMISSION SPECTRUM · absorption depth vs wavelength</text>

        {/* Grid */}
        {[0, 0.5, 1.0].map(f => {
          const y = SPEC_Y + PT + CH * (1 - f * 0.85);
          return (
            <g key={f}>
              <line x1={PL} y1={y} x2={PL + CW} y2={y} stroke="#1d2230" strokeWidth="0.75" />
              <text x={PL - 4} y={y + 3.5} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">
                {(f * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        {WL_TICKS.map(wl => (
          <g key={wl}>
            <line x1={wl2x(wl)} y1={SPEC_Y + PT} x2={wl2x(wl)} y2={SPEC_Y + PT + CH} stroke="#1d2230" strokeWidth="0.75" />
            <text x={wl2x(wl)} y={SPEC_Y + PT + CH + 13} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{wl}</text>
          </g>
        ))}
        <text x={PL + CW / 2} y={H - 5} textAnchor="middle" fill="#8b949e" fontSize="9">Wavelength (µm) — JWST range</text>
        <text x={12} y={SPEC_Y + PT + CH / 2} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90, 12, ${SPEC_Y + PT + CH / 2})`}>Absorption</text>

        {/* Spectrum fill + line */}
        {active.size > 0 && <path d={fillD} fill="#4488ff" fillOpacity="0.10" />}
        <path d={pathD} fill="none" stroke="#58a6ff" strokeWidth="2" strokeOpacity="0.9" />

        {/* Molecule feature annotations */}
        {Array.from(active).map(mol =>
          MOLECULES[mol].features.map((f, j) => {
            if (f.wl < WL_MIN || f.wl > WL_MAX) return null;
            const x = wl2x(f.wl);
            return (
              <text key={`${mol}-${j}`} x={x} y={SPEC_Y + PT + 9} textAnchor="middle"
                fill={f.color} fontSize="7" fontFamily="monospace" fillOpacity="0.7">
                {mol}
              </text>
            );
          })
        )}
      </svg>

      <div className="px-5 py-3 bg-[#161b22] border-t border-[#30363d]">
        <p className="text-[10px] text-[#484f58] font-mono mb-2">Toggle molecules — ★ = biosignature (indicator of possible life):</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(MOLECULES).map(([mol, data]) => (
            <button key={mol} onClick={() => toggle(mol)}
              className={`px-3 py-1 rounded text-[10px] font-mono transition-colors border ${active.has(mol)
                ? "text-[#0d1117] font-bold border-transparent"
                : "bg-[#21262d] border-[#30363d] text-[#484f58]"}`}
              style={active.has(mol) ? { background: data.color } : {}}>
              {mol}{(mol === "CH4" || mol === "O3") ? " ★" : ""}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#484f58] font-mono mt-2">{Array.from(active).map(m => MOLECULES[m].label).join(" · ") || "No molecules selected"}</p>
      </div>
    </div>
  );
}
