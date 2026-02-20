"use client";
import { useState } from "react";

const W = 620, H = 310;
const PL = 40; // padding left
const PR = 30; // padding right
const PT = 30; // padding top
const PB = 50; // padding bottom
const GW = W - PL - PR, GH = H - PT - PB;

// Type-Ia supernova data points (z, distance modulus mu)
// Observed: mu = 5 log10(dL/10pc)
// Flat ΛCDM: mu ≈ 5 log10(c/H0 * (1+z) * integral) + 25
function luminosityDistance(z: number, omegaL: number): number {
  // Comoving distance by numerical integration (Simpson, 100 steps)
  const omegaM = 1 - omegaL;
  const H0 = 70; // km/s/Mpc
  const c = 3e5; // km/s
  const n = 200;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const zi = (z / n) * i;
    const E2 = omegaM * Math.pow(1 + zi, 3) + omegaL;
    const E = Math.sqrt(Math.max(E2, 1e-10));
    const w = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
    sum += w / E;
  }
  const chi = (c / H0) * (z / n / 3) * sum; // Mpc
  return (1 + z) * chi; // luminosity distance in Mpc
}

function distanceModulus(z: number, omegaL: number): number {
  const dL = luminosityDistance(z, omegaL);
  return 5 * Math.log10(dL * 1e6 / 10); // mu = 5 log10(dL/10pc)
}

// Observed SNe Ia data (approximate from Perlmutter 1999 / Riess 1998)
const SN_DATA = [
  { z: 0.01, mu: 33.2 }, { z: 0.02, mu: 34.8 }, { z: 0.04, mu: 36.4 },
  { z: 0.08, mu: 37.8 }, { z: 0.12, mu: 38.9 }, { z: 0.18, mu: 39.8 },
  { z: 0.25, mu: 40.6 }, { z: 0.35, mu: 41.4 }, { z: 0.45, mu: 42.0 },
  { z: 0.55, mu: 42.5 }, { z: 0.65, mu: 43.0 }, { z: 0.75, mu: 43.4 },
  { z: 0.85, mu: 43.8 }, { z: 0.97, mu: 44.1 },
];

const Z_MAX = 1.0, MU_MIN = 32, MU_MAX = 45.5;

function zToX(z: number) { return PL + (z / Z_MAX) * GW; }
function muToY(mu: number) { return PT + GH - ((mu - MU_MIN) / (MU_MAX - MU_MIN)) * GH; }

export default function DarkEnergyAnimation({ description }: { description?: string }) {
  const [omegaL, setOmegaL] = useState(0.70);
  const showOmegaL0 = true;

  // Build model curves
  const nPts = 60;
  const modelCurve = Array.from({ length: nPts }, (_, i) => {
    const z = (i / (nPts - 1)) * Z_MAX;
    return { x: zToX(z), y: muToY(distanceModulus(z, omegaL)) };
  });
  const noLambdaCurve = Array.from({ length: nPts }, (_, i) => {
    const z = (i / (nPts - 1)) * Z_MAX;
    return { x: zToX(z), y: muToY(distanceModulus(z, 0)) };
  });

  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Y-axis ticks
  const muTicks = [33, 35, 37, 39, 41, 43, 45];
  const zTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🌌 Interactive · Dark Energy & Accelerating Expansion
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Type Ia Supernovae — The Discovery of Dark Energy</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "In 1998, distant Type Ia supernovae appeared fainter than expected — the universe's expansion is accelerating. A mysterious dark energy (Λ) counteracts gravity. Adjust Ω_Λ to match the observed data."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#30363d" strokeWidth="1" />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#30363d" strokeWidth="1" />

        {/* Grid + Y ticks */}
        {muTicks.map(mu => {
          const y = muToY(mu);
          return (
            <g key={mu}>
              <line x1={PL} y1={y} x2={PL + GW} y2={y} stroke="#1d2230" strokeWidth="0.6" />
              <text x={PL - 4} y={y + 3} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">{mu}</text>
            </g>
          );
        })}
        {zTicks.map(z => {
          const x = zToX(z);
          return (
            <g key={z}>
              <line x1={x} y1={PT} x2={x} y2={PT + GH} stroke="#1d2230" strokeWidth="0.6" />
              <text x={x} y={PT + GH + 12} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{z.toFixed(1)}</text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PL + GW / 2} y={H - 4} textAnchor="middle" fill="#484f58" fontSize="8.5" fontFamily="monospace">Redshift z</text>
        <text x={10} y={PT + GH / 2} textAnchor="middle" fill="#484f58" fontSize="8.5" fontFamily="monospace"
          transform={`rotate(-90, 10, ${PT + GH / 2})`}>Distance modulus μ</text>

        {/* No-Λ model (matter only) */}
        {showOmegaL0 && (
          <polyline points={toPolyline(noLambdaCurve)}
            fill="none" stroke="#3fb950" strokeWidth="1.2" strokeDasharray="5,3" strokeOpacity="0.55" />
        )}

        {/* Current model curve */}
        <polyline points={toPolyline(modelCurve)}
          fill="none" stroke="#bc8cff" strokeWidth="2" />

        {/* Observed data points */}
        {SN_DATA.map((d, i) => (
          <circle key={i} cx={zToX(d.z)} cy={muToY(d.mu)} r={3.5}
            fill="#f7cc4a" fillOpacity="0.85" stroke="#090d14" strokeWidth="0.7" />
        ))}

        {/* Legend */}
        <rect x={W - 195} y={PT + 4} width={185} height={58} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <circle cx={W - 183} cy={PT + 17} r={3.5} fill="#f7cc4a" fillOpacity="0.85" />
        <text x={W - 175} y={PT + 21} fill="#f7cc4a" fontSize="8" fontFamily="monospace">SNe Ia (observed)</text>
        <line x1={W - 187} y1={PT + 32} x2={W - 175} y2={PT + 32} stroke="#bc8cff" strokeWidth="2" />
        <text x={W - 171} y={PT + 36} fill="#bc8cff" fontSize="8" fontFamily="monospace">ΛCDM: Ω_Λ = {omegaL.toFixed(2)}</text>
        <line x1={W - 187} y1={PT + 48} x2={W - 175} y2={PT + 48} stroke="#3fb950" strokeWidth="1.2" strokeDasharray="5,3" />
        <text x={W - 171} y={PT + 52} fill="#3fb950" fontSize="8" fontFamily="monospace">Matter only (Ω_Λ = 0)</text>

        {/* Dark energy fraction display */}
        <rect x={PL + 8} y={PT + 8} width={145} height={48} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={PL + 16} y={PT + 23} fill="#8b949e" fontSize="8" fontFamily="monospace">Dark energy density</text>
        <text x={PL + 16} y={PT + 38} fill="#bc8cff" fontSize="15" fontFamily="monospace" fontWeight="bold">Ω_Λ = {omegaL.toFixed(2)}</text>
        <text x={PL + 16} y={PT + 50} fill="#484f58" fontSize="7.5" fontFamily="monospace">Ω_M = {(1 - omegaL).toFixed(2)}</text>

        {/* Annotation arrow at high z */}
        <text x={zToX(0.7) + 6} y={muToY(42.8) - 8} fill="#f0883e" fontSize="7.5" fontFamily="monospace">Fainter than</text>
        <text x={zToX(0.7) + 6} y={muToY(42.8) + 3} fill="#f0883e" fontSize="7.5" fontFamily="monospace">expected → Λ!</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">Ω_Λ:</span>
        <input type="range" min={0} max={0.99} step={0.01} value={omegaL}
          onChange={e => setOmegaL(parseFloat(e.target.value))}
          className="flex-1 h-1.5" style={{ accentColor: "#bc8cff" }} />
        <span className="text-[10px] font-mono text-[#bc8cff] w-8">{omegaL.toFixed(2)}</span>
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Observed: Ω_Λ ≈ 0.68 · Ω_M ≈ 0.32 (Planck 2018)</span>
      </div>
    </div>
  );
}
