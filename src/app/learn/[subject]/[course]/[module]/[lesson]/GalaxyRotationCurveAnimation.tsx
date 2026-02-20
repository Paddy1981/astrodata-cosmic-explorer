"use client";
import { useState } from "react";

const W = 620, H = 310;
const PL = 55, PR = 20, PT = 35, PB = 50;
const GW = W - PL - PR - 220, GH = H - PT - PB;
const R_MAX = 30; // kpc
const V_MAX = 350; // km/s

function rToX(r: number) { return PL + (r / R_MAX) * GW; }
function vToY(v: number) { return PT + GH - (v / V_MAX) * GH; }

// Keplerian velocity: v_K(r) ∝ 1/√r (for r > core radius)
function keplerianV(r: number, mBulge: number) {
  if (r < 0.5) return 0;
  // Bulge contributes M ~ mBulge, disk falls off
  const G = 4.3e-3; // pc*Msun^-1*(km/s)^2
  const Mbulge = mBulge * 4e10; // solar masses
  const Mdisk_at_r = 1e10 * Math.min(1, r / 8); // simplified disk mass within r
  const M = Mbulge + Mdisk_at_r;
  const rKpc = r * 3.086e16; // kpc to... actually use simplified formula
  // v = sqrt(G*M/r) with G in appropriate units
  // Use: v (km/s) = 207 * sqrt(M/1e11 Msun / r_kpc)
  return 207 * Math.sqrt((M / 1e11) / r);
}

// NFW dark matter halo: v_DM(r) ∝ logarithmic rise → flat
function darkMatterV(r: number, dmFraction: number) {
  if (r < 0.1) return 0;
  // NFW profile: v² ∝ ln(1+r/rs)/r - 1/(1+r/rs), rs ~ 20 kpc
  const rs = 20;
  const rho0 = dmFraction * 0.3; // scaling
  const x = r / rs;
  const v2 = rho0 * (Math.log(1 + x) / x - 1 / (1 + x)) * 15000;
  return Math.sqrt(Math.max(0, v2));
}

// Total rotation velocity
function totalV(r: number, dmFraction: number, mBulge: number) {
  const vK = keplerianV(r, mBulge);
  const vDM = darkMatterV(r, dmFraction);
  return Math.sqrt(vK * vK + vDM * vDM);
}

// Observed "flat" rotation curve (approximate MW/typical spiral)
const OBSERVED = [
  { r: 1, v: 200 }, { r: 2, v: 230 }, { r: 4, v: 240 }, { r: 6, v: 235 },
  { r: 8, v: 230 }, { r: 10, v: 228 }, { r: 12, v: 225 }, { r: 15, v: 222 },
  { r: 18, v: 220 }, { r: 22, v: 218 }, { r: 26, v: 215 }, { r: 30, v: 212 },
];

const N_PTS = 80;

export default function GalaxyRotationCurveAnimation({ description }: { description?: string }) {
  const [dmFraction, setDmFraction] = useState(0.85);
  const [mBulge, setMBulge] = useState(0.5);

  const keplerPts = Array.from({ length: N_PTS }, (_, i) => {
    const r = 0.3 + (i / (N_PTS - 1)) * (R_MAX - 0.3);
    return { x: rToX(r), y: vToY(Math.min(V_MAX, keplerianV(r, mBulge))) };
  });
  const dmPts = Array.from({ length: N_PTS }, (_, i) => {
    const r = 0.3 + (i / (N_PTS - 1)) * (R_MAX - 0.3);
    return { x: rToX(r), y: vToY(Math.min(V_MAX, darkMatterV(r, dmFraction))) };
  });
  const totalPts = Array.from({ length: N_PTS }, (_, i) => {
    const r = 0.3 + (i / (N_PTS - 1)) * (R_MAX - 0.3);
    return { x: rToX(r), y: vToY(Math.min(V_MAX, totalV(r, dmFraction, mBulge))) };
  });

  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.filter(p => p.y >= PT && p.y <= PT + GH).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const rTicks = [0, 5, 10, 15, 20, 25, 30];
  const vTicks = [0, 100, 200, 300];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🌌 Interactive · Galaxy Rotation Curves
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Dark Matter — Why Galaxies Spin Too Fast</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Stars in the outer disc orbit faster than Newtonian gravity from visible matter alone can explain. An invisible dark matter halo extends far beyond the disc, keeping the rotation curve flat. Adjust the dark matter fraction to match observations."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#30363d" strokeWidth="1" />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#30363d" strokeWidth="1" />

        {/* Grid */}
        {vTicks.map(v => {
          const y = vToY(v);
          return (
            <g key={v}>
              <line x1={PL} y1={y} x2={PL + GW} y2={y} stroke="#1d2230" strokeWidth="0.6" />
              <text x={PL - 4} y={y + 3} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">{v}</text>
            </g>
          );
        })}
        {rTicks.map(r => {
          const x = rToX(r);
          return (
            <g key={r}>
              <line x1={x} y1={PT} x2={x} y2={PT + GH} stroke="#1d2230" strokeWidth="0.6" />
              <text x={x} y={PT + GH + 12} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{r}</text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={PL + GW / 2} y={H - 4} textAnchor="middle" fill="#484f58" fontSize="8.5" fontFamily="monospace">Radius (kpc)</text>
        <text x={10} y={PT + GH / 2} textAnchor="middle" fill="#484f58" fontSize="8.5" fontFamily="monospace"
          transform={`rotate(-90, 10, ${PT + GH / 2})`}>Velocity (km/s)</text>

        {/* Keplerian (baryonic only) */}
        <polyline points={toPolyline(keplerPts)} fill="none" stroke="#f0883e" strokeWidth="1.5" strokeDasharray="5,3" />
        {/* Dark matter halo contribution */}
        <polyline points={toPolyline(dmPts)} fill="none" stroke="#bc8cff" strokeWidth="1.2" strokeDasharray="3,2" />
        {/* Total */}
        <polyline points={toPolyline(totalPts)} fill="none" stroke="#58a6ff" strokeWidth="2.2" />
        {/* Observed */}
        {OBSERVED.map((d, i) => (
          <circle key={i} cx={rToX(d.r)} cy={vToY(d.v)} r={3.5}
            fill="#f7cc4a" fillOpacity="0.85" stroke="#090d14" strokeWidth="0.7" />
        ))}

        {/* "Expected" label at end of Keplerian curve */}
        <text x={rToX(28)} y={vToY(keplerianV(28, mBulge)) - 6} fill="#f0883e" fontSize="7.5" fontFamily="monospace">Expected</text>

        {/* Legend panel */}
        <rect x={PL + GW + 15} y={PT} width={200} height={GH} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={PL + GW + 25} y={PT + 16} fill="#484f58" fontSize="8" fontFamily="monospace">Legend:</text>
        <line x1={PL + GW + 25} y1={PT + 30} x2={PL + GW + 45} y2={PT + 30} stroke="#f7cc4a" strokeWidth="1.5" />
        <circle cx={PL + GW + 35} cy={PT + 30} r={3} fill="#f7cc4a" />
        <text x={PL + GW + 50} y={PT + 34} fill="#f7cc4a" fontSize="7.5" fontFamily="monospace">Observed</text>
        <line x1={PL + GW + 25} y1={PT + 46} x2={PL + GW + 45} y2={PT + 46} stroke="#f0883e" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x={PL + GW + 50} y={PT + 50} fill="#f0883e" fontSize="7.5" fontFamily="monospace">Baryonic only</text>
        <line x1={PL + GW + 25} y1={PT + 62} x2={PL + GW + 45} y2={PT + 62} stroke="#bc8cff" strokeWidth="1.2" strokeDasharray="3,2" />
        <text x={PL + GW + 50} y={PT + 66} fill="#bc8cff" fontSize="7.5" fontFamily="monospace">Dark matter</text>
        <line x1={PL + GW + 25} y1={PT + 78} x2={PL + GW + 45} y2={PT + 78} stroke="#58a6ff" strokeWidth="2" />
        <text x={PL + GW + 50} y={PT + 82} fill="#58a6ff" fontSize="7.5" fontFamily="monospace">Total (DM + baryons)</text>

        <line x1={PL + GW + 20} y1={PT + 96} x2={PL + GW + 205} y2={PT + 96} stroke="#30363d" strokeWidth="0.6" />
        <text x={PL + GW + 25} y={PT + 110} fill="#8b949e" fontSize="8" fontFamily="monospace">DM fraction:</text>
        <text x={PL + GW + 25} y={PT + 124} fill="#bc8cff" fontSize="14" fontFamily="monospace" fontWeight="bold">{(dmFraction * 100).toFixed(0)}%</text>
        <text x={PL + GW + 25} y={PT + 140} fill="#8b949e" fontSize="8" fontFamily="monospace">Bulge mass:</text>
        <text x={PL + GW + 25} y={PT + 154} fill="#f0883e" fontSize="14" fontFamily="monospace" fontWeight="bold">{(mBulge * 1e10).toExponential(0)} M☉</text>

        <text x={PL + GW + 25} y={PT + 175} fill="#484f58" fontSize="7" fontFamily="monospace">DM makes up ~27% of</text>
        <text x={PL + GW + 25} y={PT + 187} fill="#484f58" fontSize="7" fontFamily="monospace">cosmic energy budget.</text>
        <text x={PL + GW + 25} y={PT + 199} fill="#484f58" fontSize="7" fontFamily="monospace">Detected only by gravity.</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">DM fraction:</span>
        <input type="range" min={0} max={1} step={0.01} value={dmFraction}
          onChange={e => setDmFraction(parseFloat(e.target.value))}
          className="w-28 h-1.5" style={{ accentColor: "#bc8cff" }} />
        <span className="text-[10px] font-mono text-[#bc8cff] w-8">{(dmFraction * 100).toFixed(0)}%</span>
        <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">Bulge:</span>
        <input type="range" min={0.1} max={2} step={0.1} value={mBulge}
          onChange={e => setMBulge(parseFloat(e.target.value))}
          className="w-24 h-1.5" style={{ accentColor: "#f0883e" }} />
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Vera Rubin (1970) confirmed flat curves ≡ dark matter</span>
      </div>
    </div>
  );
}
