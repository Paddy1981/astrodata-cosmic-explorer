"use client";
import { useState, useEffect, useRef } from "react";

// ── Layout ───────────────────────────────────────────────────────────────────
const W = 620, IMG_H = 230, CC_H = 140, TOTAL_H = IMG_H + CC_H;

// Telescope image panel
const ICX = W / 2, ICY = IMG_H / 2 + 5;
const FIELD_R = 95; // half-width of circular field of view

// Planet orbit params
const ORBIT_A = 58, ORBIT_B = 22; // ellipse semi-axes in SVG px (inclined orbit)
const PLANET_ANGLE_SPEED = 0.4;   // radians/second

// Contrast curve panel (log scale)
const PL = 54, CPR = 16, CPT = 18, CPB = 28;
const CCW = W - PL - CPR, CCH = CC_H - CPT - CPB;
const CCY0 = IMG_H;
// Log contrast: 10^-3 to 10^0 on y, 0–500 AU on x
const SEP_MAX = 500; // AU separation
const sep2x = (s: number) => PL + (s / SEP_MAX) * CCW;
const con2y = (log10c: number) => CCY0 + CPT + CCH - ((log10c + 9) / 9) * CCH; // -9 to 0 mapped to bottom→top

// Pre-computed speckle noise positions (deterministic)
function makeRNG(seed: number) {
  let s = seed >>> 0;
  return () => { s = Math.imul(s, 1664525) + 1013904223; return (s >>> 0) / 0x100000000; };
}
const rng = makeRNG(0xd172ec7);
const SPECKLES = Array.from({ length: 55 }, () => {
  const r = Math.sqrt(rng()) * (FIELD_R - 4);
  const a = rng() * 2 * Math.PI;
  return { x: ICX + r * Math.cos(a), y: ICY + r * Math.sin(a), s: 2 + rng() * 4, o: 0.4 + rng() * 0.5 };
});

// Contrast curves (simplified piecewise log)
const RAW_CC = Array.from({ length: 200 }, (_, i) => {
  const s = (i / 199) * SEP_MAX;
  const logC = s < 20 ? 0 : s < 100 ? -0.03 * s + 0.6 : -0.01 * s - 1.4; // raw speckle noise
  return { s, logC: Math.max(-4, logC) };
});
const COR_CC = Array.from({ length: 200 }, (_, i) => {
  const s = (i / 199) * SEP_MAX;
  const logC = s < 10 ? 0 : s < 80 ? -0.06 * s + 0.6 : -0.015 * s - 4.2;
  return { s, logC: Math.max(-9, logC) };
});
const rawPath = RAW_CC.map((d, i) => `${i === 0 ? "M" : "L"}${sep2x(d.s).toFixed(1)},${con2y(d.logC).toFixed(1)}`).join(" ");
const corPath = COR_CC.map((d, i) => `${i === 0 ? "M" : "L"}${sep2x(d.s).toFixed(1)},${con2y(d.logC).toFixed(1)}`).join(" ");

const STAGES = [
  { label: "Raw image", sub: "Star PSF overwhelms the field — planet invisible at 10⁻⁹ contrast" },
  { label: "Coronagraph", sub: "Occulting mask blocks the star — speckle noise reduced 1000×" },
  { label: "Planet revealed", sub: "HR 8799 b detected at ~68 AU — orbit visible over years of imaging" },
];

export default function DirectImagingAnimation({ description }: { description?: string }) {
  const [stage, setStage] = useState(0);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const angleRef = useRef(0);
  const lastT = useRef<number | null>(null);

  // Animate planet orbit continuously when in stage 2
  useEffect(() => {
    if (stage < 2) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        angleRef.current = (angleRef.current + dt * PLANET_ANGLE_SPEED) % (2 * Math.PI);
        setOrbitAngle(angleRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [stage]);

  const nextStage = () => {
    if (stage >= 2 || transitioning) return;
    setTransitioning(true);
    setTimeout(() => { setStage(s => s + 1); setTransitioning(false); }, 400);
  };
  const reset = () => { setStage(0); angleRef.current = 0; setOrbitAngle(0); };

  // Planet position
  const pAngle = orbitAngle;
  const px = ICX + ORBIT_A * Math.cos(pAngle);
  const py = ICY + ORBIT_B * Math.sin(pAngle);

  // Orbit path (ellipse)
  const orbitPath = Array.from({ length: 100 }, (_, i) => {
    const a = (2 * Math.PI * i) / 99;
    return `${i === 0 ? "M" : "L"}${(ICX + ORBIT_A * Math.cos(a)).toFixed(1)},${(ICY + ORBIT_B * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + "Z";

  // PSF blur radius (raw stage: large, coronagraph: shrinks, revealed: gone)
  const psfAlpha = stage === 0 ? 0.85 : stage === 1 ? 0.25 : 0;
  const speckleAlpha = stage === 0 ? 1 : stage === 1 ? 0.4 : 0.12;

  // Planet separation for contrast curve marker
  const planetSep = 68; // AU (HR 8799 b)
  const planetContrast = -9; // log10 of contrast

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          🔭 Interactive Animation · Direct Imaging
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Direct Imaging Method — Three Stages</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Stars outshine their planets by a billion to one. Direct imaging requires blocking the star with a coronagraph, then detecting the faint reflected or thermal glow of the planet. Step through the three stages to see how it works."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="di-psf" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity={psfAlpha} />
            <stop offset="15%" stopColor="#ffeeaa" stopOpacity={psfAlpha * 0.85} />
            <stop offset="40%" stopColor="#ff8800" stopOpacity={psfAlpha * 0.5} />
            <stop offset="70%" stopColor="#ff4400" stopOpacity={psfAlpha * 0.2} />
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="di-planet" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#aaddff" />
            <stop offset="100%" stopColor="#0a1830" />
          </radialGradient>
          <radialGradient id="di-pglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5599ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5599ff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="di-field"><circle cx={ICX} cy={ICY} r={FIELD_R} /></clipPath>
        </defs>

        {/* Field of view circle */}
        <circle cx={ICX} cy={ICY} r={FIELD_R} fill="#040608" stroke="#1d2230" strokeWidth="1.5" />

        {/* Panel label */}
        <text x={12} y={16} fill="#30363d" fontSize="8.5" fontFamily="monospace">
          NEAR-INFRARED TELESCOPE IMAGE · {STAGES[stage].label.toUpperCase()}
        </text>

        {/* Diffraction spikes (raw and partial coronagraph stages) */}
        {stage < 2 && [0, 45, 90, 135].map(a => {
          const rad = (a * Math.PI) / 180;
          const len = FIELD_R * (stage === 0 ? 0.95 : 0.4) * psfAlpha;
          return (
            <line key={a}
              x1={ICX - Math.cos(rad) * len} y1={ICY - Math.sin(rad) * len}
              x2={ICX + Math.cos(rad) * len} y2={ICY + Math.sin(rad) * len}
              stroke="#ffffff" strokeWidth={stage === 0 ? 1.5 : 0.75}
              strokeOpacity={stage === 0 ? 0.7 : 0.25}
              clipPath="url(#di-field)" />
          );
        })}

        {/* Star PSF bloom */}
        <circle cx={ICX} cy={ICY} r={FIELD_R * 0.9} fill="url(#di-psf)" clipPath="url(#di-field)" />

        {/* Speckle noise */}
        {SPECKLES.map((sp, i) => (
          <circle key={i} cx={sp.x} cy={sp.y} r={sp.s}
            fill="#ff8822" opacity={sp.o * speckleAlpha} clipPath="url(#di-field)" />
        ))}

        {/* Star core */}
        {stage < 2 && (
          <circle cx={ICX} cy={ICY} r={stage === 0 ? 10 : 5}
            fill={stage === 0 ? "#ffffff" : "#aaaaaa"}
            opacity={stage === 0 ? 0.95 : 0.5}
            clipPath="url(#di-field)" />
        )}

        {/* Coronagraph mask */}
        {stage >= 1 && (
          <>
            <circle cx={ICX} cy={ICY} r={18} fill="#000000" clipPath="url(#di-field)" />
            <circle cx={ICX} cy={ICY} r={18} fill="none" stroke="#30363d" strokeWidth="1" />
            <text x={ICX} y={ICY + 28} textAnchor="middle" fill="#30363d" fontSize="7" fontFamily="monospace">
              coronagraph
            </text>
          </>
        )}

        {/* Planet orbit trace */}
        {stage >= 2 && (
          <path d={orbitPath} fill="none" stroke="#5599ff" strokeWidth="0.75"
            strokeDasharray="4,3" strokeOpacity="0.4" clipPath="url(#di-field)" />
        )}

        {/* Planet */}
        {stage >= 2 && (
          <>
            <circle cx={px} cy={py} r={9} fill="url(#di-pglow)" />
            <circle cx={px} cy={py} r={5} fill="url(#di-planet)" />
            <text x={px + 9} y={py - 6} fill="#5599ff" fontSize="7.5" fontFamily="monospace">HR 8799 b</text>
          </>
        )}

        {/* Stage caption */}
        <text x={ICX} y={IMG_H - 8} textAnchor="middle" fill="#484f58" fontSize="9" fontFamily="monospace">
          {STAGES[stage].sub}
        </text>

        {/* ── Contrast curve panel ─────────────────────────────────── */}
        <rect x={0} y={CCY0} width={W} height={CC_H} fill="#0b1018" />
        <line x1={0} y1={CCY0} x2={W} y2={CCY0} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={CCY0 + 13} fill="#30363d" fontSize="8.5" fontFamily="monospace">CONTRAST CURVE (star brightness / planet brightness)</text>

        {/* Y ticks (log10 contrast) */}
        {[-3, -6, -9].map(v => (
          <g key={v}>
            <line x1={PL} y1={con2y(v)} x2={PL + CCW} y2={con2y(v)} stroke="#151c26" strokeWidth="0.75" />
            <text x={PL - 5} y={con2y(v) + 3.5} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
              10{v === -3 ? "⁻³" : v === -6 ? "⁻⁶" : "⁻⁹"}
            </text>
          </g>
        ))}
        <text x={14} y={CCY0 + CPT + CCH / 2 + 3.5} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90,14,${CCY0 + CPT + CCH / 2})`}>
          Contrast
        </text>

        {/* X ticks (separation in AU) */}
        {[0, 100, 200, 300, 400, 500].map(s => (
          <g key={s}>
            <line x1={sep2x(s)} y1={CCY0 + CPT + CCH} x2={sep2x(s)} y2={CCY0 + CPT + CCH + 4} stroke="#30363d" />
            <text x={sep2x(s)} y={CCY0 + CPT + CCH + 14} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
              {s}
            </text>
          </g>
        ))}
        <text x={PL + CCW / 2} y={TOTAL_H - 4} textAnchor="middle" fill="#8b949e" fontSize="9">Separation (AU)</text>

        {/* Raw contrast curve */}
        <path d={rawPath} fill="none" stroke="#f0883e" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="5,3" />
        <text x={sep2x(240)} y={con2y(-1.8) - 5} fill="#f0883e" fontSize="7.5" fontFamily="monospace" opacity="0.7">
          raw (speckle noise)
        </text>

        {/* Coronagraph contrast curve */}
        {stage >= 1 && (
          <>
            <path d={corPath} fill="none" stroke="#3fb950" strokeWidth="1.5" strokeOpacity="0.85" />
            <text x={sep2x(200)} y={con2y(-6.5) - 5} fill="#3fb950" fontSize="7.5" fontFamily="monospace">
              after coronagraph
            </text>
          </>
        )}

        {/* Planet detection point */}
        {stage >= 2 && (
          <>
            <circle cx={sep2x(planetSep)} cy={con2y(planetContrast)} r={5.5}
              fill="#5599ff" stroke="#090d14" strokeWidth="1.5" />
            <text x={sep2x(planetSep) + 8} y={con2y(planetContrast) + 3.5}
              fill="#5599ff" fontSize="7.5" fontFamily="monospace">
              HR 8799 b (68 AU)
            </text>
          </>
        )}
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= stage ? "bg-[#58a6ff]" : "bg-[#30363d]"}`} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-[#8b949e]">Stage {stage + 1}/3: {STAGES[stage].label}</span>
        {stage < 2 && (
          <button onClick={nextStage} disabled={transitioning}
            className="px-3 py-1.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-medium transition-colors disabled:opacity-50 ml-2">
            Next Stage →
          </button>
        )}
        <button onClick={reset}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          ↺ Reset
        </button>
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">
          Star/planet contrast: ~10⁹ (optical) → 10⁶ (mid-IR)
        </span>
      </div>
    </div>
  );
}
