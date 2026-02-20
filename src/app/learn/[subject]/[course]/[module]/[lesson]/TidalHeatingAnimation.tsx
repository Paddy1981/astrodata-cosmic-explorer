"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 300;
const JCX = 180, JCY = H / 2; // Jupiter center
const ORBIT_A = 180, ORBIT_B = 60; // orbit ellipse (slightly eccentric)
const MOON_R_BASE = 22;

// Cross-section panel
const CSX = 390, CSY = H / 2, CS_R = 80;
const LAYER_RADII = [0.25, 0.55, 0.78, 1.0]; // ice shell, ocean, mantle, core fractions

export default function TidalHeatingAnimation({ description }: { description?: string }) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const phaseRef = useRef(0);
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        phaseRef.current = (phaseRef.current + (now - lastT.current) / 1000 * 0.18 * speed) % (2 * Math.PI);
        setPhase(phaseRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  // Moon position on slightly elliptical orbit
  const ecc = 0.009; // Europa's real eccentricity
  const r = ORBIT_A * (1 - ecc * ecc) / (1 + ecc * Math.cos(phase));
  const mx = JCX + r * Math.cos(phase) * (ORBIT_B / ORBIT_A);
  const my = JCY + r * Math.sin(phase) * (ORBIT_B / ORBIT_A);

  // Tidal distortion: moon shape stretches toward Jupiter
  const dx = mx - JCX, dy = my - JCY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const tidalStrength = Math.min(0.35, 500 / (dist * dist));
  const moonRx = MOON_R_BASE * (1 + tidalStrength);
  const moonRy = MOON_R_BASE * (1 - tidalStrength * 0.5);
  const moonAngle = Math.atan2(dy, dx) * 180 / Math.PI;

  // Heat flux — inversely related to orbital distance
  const heatFlux = Math.min(1, 200 / (dist * dist) * 15);

  // Crack lines on ice surface (near pericenter)
  const cracks = heatFlux > 0.4;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f7cc4a] uppercase tracking-widest block mb-1">
          ☀️ Interactive · Tidal Heating of Icy Moons
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Europa — Tidal Flexing Powers a Subsurface Ocean</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Europa's slightly elliptical orbit causes it to flex as Jupiter's tidal pull changes. This mechanical deformation generates heat — enough to maintain a liquid water ocean beneath ~10 km of ice."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="th-jupiter" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ffe0b0" /><stop offset="40%" stopColor="#e07040" /><stop offset="100%" stopColor="#803010" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="th-glow" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor="#e07040" stopOpacity="0.25" /><stop offset="100%" stopColor="#e07040" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="th-moon" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8e8f0" /><stop offset="60%" stopColor="#aabbcc" /><stop offset="100%" stopColor="#445566" stopOpacity="0.9" />
          </radialGradient>
          {/* Cross-section layers */}
          <radialGradient id="th-ice" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#cce0ff" /><stop offset="100%" stopColor="#88aacc" /></radialGradient>
          <radialGradient id="th-ocean" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#1155aa" /><stop offset="100%" stopColor="#003388" /></radialGradient>
          <radialGradient id="th-mantle" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#886644" /><stop offset="100%" stopColor="#553322" /></radialGradient>
          <radialGradient id="th-core" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#cc6633" /><stop offset="100%" stopColor="#882211" /></radialGradient>
        </defs>

        {/* Orbit */}
        <ellipse cx={JCX} cy={JCY} rx={ORBIT_A * 0.9} ry={ORBIT_B * 0.9}
          fill="none" stroke="#1d2230" strokeWidth="1" strokeDasharray="5,4" />

        {/* Jupiter */}
        <circle cx={JCX} cy={JCY} r={58 * 2.2} fill="url(#th-glow)" />
        <circle cx={JCX} cy={JCY} r={58} fill="url(#th-jupiter)" />
        {/* Jupiter bands */}
        {[-18, -6, 6, 18].map(dy => (
          <line key={dy} x1={JCX - 56} y1={JCY + dy} x2={JCX + 56} y2={JCY + dy}
            stroke="#c05020" strokeWidth={Math.abs(dy) < 10 ? 3 : 1.5} strokeOpacity="0.35" />
        ))}
        <text x={JCX} y={JCY + 66} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">Jupiter</text>

        {/* Moon (tidal distortion) */}
        <g transform={`translate(${mx},${my}) rotate(${moonAngle})`}>
          <ellipse cx={0} cy={0} rx={moonRx} ry={moonRy} fill="url(#th-moon)" />
          {cracks && (
            <>
              <line x1={-moonRx * 0.5} y1={-moonRy * 0.8} x2={-moonRx * 0.2} y2={moonRy * 0.8}
                stroke="#88aaff" strokeWidth="0.8" strokeOpacity="0.6" />
              <line x1={moonRx * 0.3} y1={-moonRy * 0.9} x2={moonRx * 0.1} y2={moonRy * 0.7}
                stroke="#88aaff" strokeWidth="0.8" strokeOpacity="0.5" />
            </>
          )}
        </g>
        <text x={mx} y={my + MOON_R_BASE + 13} textAnchor="middle" fill="#aabbcc" fontSize="8" fontFamily="monospace">Europa</text>

        {/* Heat indicator */}
        <rect x={mx - 28} y={my - MOON_R_BASE - 26} width={56} height={14} rx={3} fill="#0b1018" stroke="#ff4400" strokeWidth={0.5} strokeOpacity={heatFlux} />
        <rect x={mx - 26} y={my - MOON_R_BASE - 24} width={52 * heatFlux} height={10} rx={2} fill="#ff4400" fillOpacity={0.7} />
        <text x={mx} y={my - MOON_R_BASE - 34} textAnchor="middle" fill="#ff6644" fontSize="7.5" fontFamily="monospace">Heat flux</text>

        {/* Cross-section */}
        <line x1={CSX - CS_R - 20} y1={10} x2={CSX - CS_R - 20} y2={H - 10} stroke="#1d2230" strokeWidth="1" />
        <text x={CSX} y={18} textAnchor="middle" fill="#30363d" fontSize="8.5" fontFamily="monospace">INTERIOR CROSS-SECTION</text>
        {[CS_R, CS_R * 0.78, CS_R * 0.55, CS_R * 0.25].map((r, i) => {
          const fills = ["url(#th-ice)", "url(#th-ocean)", "url(#th-mantle)", "url(#th-core)"];
          const labels = ["Ice shell (~10km)", "Liquid ocean (~100km)", "Rocky mantle", "Iron core"];
          const lColors = ["#cce0ff", "#4488ff", "#aa7755", "#cc6633"];
          return (
            <g key={i}>
              <circle cx={CSX} cy={CSY} r={r} fill={fills[i]} />
              <line x1={CSX + r + 4} y1={CSY} x2={CSX + CS_R + 30} y2={CSY - 30 + i * 20} stroke={lColors[i]} strokeWidth="0.75" strokeOpacity="0.5" />
              <text x={CSX + CS_R + 34} y={CSY - 26 + i * 20} fill={lColors[i]} fontSize="7.5" fontFamily="monospace">{labels[i]}</text>
            </g>
          );
        })}
        {/* Heat arrows in ocean layer */}
        {[0, 60, 120, 180, 240, 300].map(a => {
          const rad = (a * Math.PI) / 180;
          const r1 = CS_R * 0.58, r2 = CS_R * 0.73;
          return (
            <line key={a} x1={CSX + r1 * Math.cos(rad)} y1={CSY + r1 * Math.sin(rad)}
              x2={CSX + r2 * Math.cos(rad)} y2={CSY + r2 * Math.sin(rad)}
              stroke="#ff6644" strokeWidth="1.2" strokeOpacity={0.3 + heatFlux * 0.5} />
          );
        })}
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">{playing ? "⏸ Pause" : "▶ Play"}</button>
        <button onClick={() => { phaseRef.current = 0; setPhase(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">↺ Reset</button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? "bg-[#f7cc4a]/20 text-[#f7cc4a] border border-[#f7cc4a]/30" : "bg-[#21262d] text-[#484f58]"}`}>{s}×</button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Tidal distortion exaggerated · e = {ecc}</span>
      </div>
    </div>
  );
}
