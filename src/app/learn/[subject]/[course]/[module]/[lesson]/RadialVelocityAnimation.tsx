"use client";
import { useRef, useState, useEffect } from "react";

// ── Layout ───────────────────────────────────────────────────────────────────
const W = 620, ORB_H = 210, RV_H = 145, TOTAL_H = ORB_H + RV_H;

// Orbital view (top-down)
const OCX = W / 2, OCY = ORB_H / 2 + 6;
const ORBIT_R = 88;   // orbit radius (SVG px)
const STAR_R = 16;    // star radius (exaggerated)
const PLANET_R = 8;   // planet radius
const BARY_OFFSET = 5; // barycenter offset (star wobble amplitude in SVG px)

// RV panel
const PL = 54, RPR = 14, RPT = 20, RPB = 28;
const RVW = W - PL - RPR, RVH = RV_H - RPT - RPB;
const RVY = ORB_H;
const K = 100; // semi-amplitude m/s
const RV_MAX = 120, RV_MIN = -120;
const p2x = (p: number) => PL + p * RVW;
const v2y = (v: number) => RVY + RPT + RVH / 2 - (v / RV_MAX) * (RVH / 2);

// Full RV curve path
const RV_PATH = Array.from({ length: 360 }, (_, i) => {
  const p = i / 359;
  const v = K * Math.sin(2 * Math.PI * p); // circular orbit, transit centre at phase=0.25
  return `${i === 0 ? "M" : "L"}${p2x(p).toFixed(1)},${v2y(v).toFixed(1)}`;
}).join(" ");

const YTICKS = [-100, -50, 0, 50, 100];

// Spectrum absorption lines (normalised positions within 0–1)
const ABS_LINES = [
  { wl: 0.22, label: "Mg I", color: "#7c9cff" },
  { wl: 0.38, label: "Na D", color: "#ffcc44" },
  { wl: 0.55, label: "Hα",   color: "#ff6060" },
  { wl: 0.74, label: "Hβ",   color: "#88aaff" },
];
const SPEC_X = PL, SPEC_Y = RVY + RPT - 14, SPEC_W = RVW, SPEC_H = 10;

export default function RadialVelocityAnimation({ description }: { description?: string }) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const phRef = useRef(0);
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        phRef.current = (phRef.current + dt * speed / 10) % 1;
        setPhase(phRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  const th = 2 * Math.PI * phase;
  const rv = K * Math.sin(th);       // radial velocity (m/s) — positive = receding
  const approaching = rv < 0;

  // Planet position (top-down view)
  const px = OCX + ORBIT_R * Math.cos(th);
  const py = OCY + ORBIT_R * Math.sin(th);

  // Star wobbles opposite to planet (barycenter at OCX, OCY)
  const sx = OCX - BARY_OFFSET * Math.cos(th);
  const sy = OCY - BARY_OFFSET * Math.sin(th);

  // RV arrow on star (points toward/away from observer = up/down in top-down view)
  const arrowLen = Math.abs(rv) / K * 28;
  const arrowDir = rv > 0 ? 1 : -1; // positive rv = receding = arrow points down (away from obs)
  const arrowColor = approaching ? "#4488ff" : "#ff4444";
  const dopColor = approaching ? "#5599ff" : "#ff5533";

  // Doppler shift for absorption lines (in pixels within spectrum bar)
  // Δλ/λ = v/c → Δx = v/c * SPEC_W ≈ v/3e8 * SPEC_W (scaled ×8000 for visibility)
  const dopShift = (rv / 3e8) * SPEC_W * 8000;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          📡 Interactive Animation · Radial Velocity
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Radial Velocity Method — Live Simulation</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "The planet's gravity makes the star wobble. That wobble shifts the star's spectral lines via the Doppler effect. The bottom panel shows the radial velocity curve — the same sinusoidal signal HARPS detects at just ±100 m/s."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="rv-star" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff0b0" />
            <stop offset="55%" stopColor="#ffaa20" />
            <stop offset="100%" stopColor="#dd5500" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="rv-planet" cx="30%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#305060" />
            <stop offset="100%" stopColor="#060a10" />
          </radialGradient>
          <radialGradient id="rv-glow" cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor="#ff8800" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ff8800" stopOpacity="0" />
          </radialGradient>
          {/* Spectrum gradient */}
          <linearGradient id="rv-spec" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#7800ff" />
            <stop offset="15%"  stopColor="#0040ff" />
            <stop offset="35%"  stopColor="#00aaff" />
            <stop offset="50%"  stopColor="#00ff88" />
            <stop offset="65%"  stopColor="#aaff00" />
            <stop offset="80%"  stopColor="#ffaa00" />
            <stop offset="100%" stopColor="#ff2200" />
          </linearGradient>
          <clipPath id="rv-specc"><rect x={SPEC_X} y={SPEC_Y} width={SPEC_W} height={SPEC_H} /></clipPath>
        </defs>

        {/* Panel label */}
        <text x={12} y={16} fill="#30363d" fontSize="8.5" fontFamily="monospace">TOP-DOWN ORBITAL VIEW</text>

        {/* Observer direction arrow */}
        <line x1={W - 20} y1={OCY - 40} x2={W - 20} y2={OCY + 40} stroke="#30363d" strokeWidth="0.75" />
        <text x={W - 17} y={OCY - 44} fill="#30363d" fontSize="7.5" fontFamily="monospace">OBS</text>
        <polygon points={`${W - 20},${OCY - 40} ${W - 24},${OCY - 32} ${W - 16},${OCY - 32}`} fill="#30363d" />

        {/* Orbit circle */}
        <circle cx={OCX} cy={OCY} r={ORBIT_R} fill="none" stroke="#1d2230" strokeWidth="1" strokeDasharray="5,4" />

        {/* Barycenter dot */}
        <circle cx={OCX} cy={OCY} r={2.5} fill="#30363d" />
        <text x={OCX + 5} y={OCY + 3.5} fill="#30363d" fontSize="7" fontFamily="monospace">CoM</text>

        {/* Star glow */}
        <circle cx={sx} cy={sy} r={STAR_R * 2.8} fill="url(#rv-glow)" />
        {/* Star */}
        <circle cx={sx} cy={sy} r={STAR_R} fill="url(#rv-star)" />

        {/* Planet */}
        <circle cx={px} cy={py} r={PLANET_R} fill="url(#rv-planet)" stroke="#1a2535" strokeWidth="0.8" />

        {/* RV arrow on star */}
        {Math.abs(rv) > 5 && (
          <g>
            <line x1={sx} y1={sy} x2={sx} y2={sy + arrowDir * arrowLen}
              stroke={arrowColor} strokeWidth={1.5} markerEnd={`url(#rv-arr-${approaching ? "b" : "r"})`} />
            <defs>
              <marker id="rv-arr-b" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#4488ff" />
              </marker>
              <marker id="rv-arr-r" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#ff4444" />
              </marker>
            </defs>
          </g>
        )}

        {/* Velocity label on star */}
        <text x={sx + STAR_R + 5} y={sy - 4} fill={arrowColor} fontSize="8" fontFamily="monospace">
          {approaching ? "◀ approaching" : "receding ▶"}
        </text>
        <text x={sx + STAR_R + 5} y={sy + 8} fill="#8b949e" fontSize="7.5" fontFamily="monospace">
          v_r = {rv > 0 ? "+" : ""}{rv.toFixed(0)} m/s
        </text>

        {/* ── RV panel ─────────────────────────────────────────────── */}
        <rect x={0} y={RVY} width={W} height={RV_H} fill="#0b1018" />
        <line x1={0} y1={RVY} x2={W} y2={RVY} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={RVY + 13} fill="#30363d" fontSize="8.5" fontFamily="monospace">RADIAL VELOCITY CURVE + STELLAR SPECTRUM</text>

        {/* Spectrum strip */}
        <rect x={SPEC_X} y={SPEC_Y} width={SPEC_W} height={SPEC_H} fill="url(#rv-spec)" rx={2} />
        {/* Absorption lines (shifted by Doppler) */}
        {ABS_LINES.map(l => (
          <g key={l.label}>
            <rect
              x={SPEC_X + l.wl * SPEC_W + dopShift - 1}
              y={SPEC_Y}
              width={2}
              height={SPEC_H}
              fill="#090d14"
              clipPath="url(#rv-specc)"
            />
            <text
              x={SPEC_X + l.wl * SPEC_W + dopShift}
              y={SPEC_Y - 2}
              textAnchor="middle" fill={dopColor} fontSize="6.5" fontFamily="monospace"
            >
              {l.label}
            </text>
          </g>
        ))}
        <text x={SPEC_X + SPEC_W + 5} y={SPEC_Y + 7.5} fill="#484f58" fontSize="7" fontFamily="monospace">
          {approaching ? "blueshift" : "redshift"}
        </text>

        {/* Y grid + labels */}
        {YTICKS.map(v => (
          <g key={v}>
            <line x1={PL} y1={v2y(v)} x2={PL + RVW} y2={v2y(v)}
              stroke={v === 0 ? "#30363d" : "#151c26"} strokeWidth={v === 0 ? 1 : 0.75} />
            <text x={PL - 5} y={v2y(v) + 3.5} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
              {v > 0 ? "+" : ""}{v}
            </text>
          </g>
        ))}
        <text x={12} y={RVY + RPT + RVH / 2 + 3.5} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90,12,${RVY + RPT + RVH / 2})`}>
          v_r (m/s)
        </text>

        {/* X ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={p2x(p)} y1={RVY + RPT + RVH} x2={p2x(p)} y2={RVY + RPT + RVH + 4} stroke="#30363d" />
            <text x={p2x(p)} y={RVY + RPT + RVH + 14} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
              {p.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={PL + RVW / 2} y={TOTAL_H - 4} textAnchor="middle" fill="#8b949e" fontSize="9">Orbital Phase</text>

        {/* RV curve */}
        <path d={RV_PATH} fill="none" stroke="#58a6ff" strokeWidth="1.75" strokeOpacity="0.9" />

        {/* Zero line annotation */}
        <text x={PL + RVW - 4} y={v2y(0) - 3} textAnchor="end" fill="#30363d" fontSize="7.5" fontFamily="monospace">
          0 m/s (systemic)
        </text>

        {/* Current point */}
        <line x1={p2x(phase)} y1={RVY + RPT} x2={p2x(phase)} y2={RVY + RPT + RVH}
          stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.5" />
        <circle cx={p2x(phase)} cy={v2y(rv)} r={4.5} fill="#f0883e" stroke="#0b1018" strokeWidth="1.5" />

        {/* K amplitude bracket */}
        <line x1={PL - 20} y1={v2y(K)} x2={PL - 12} y2={v2y(K)} stroke="#bc8cff" strokeWidth="0.75" />
        <line x1={PL - 20} y1={v2y(-K)} x2={PL - 12} y2={v2y(-K)} stroke="#bc8cff" strokeWidth="0.75" />
        <line x1={PL - 16} y1={v2y(K)} x2={PL - 16} y2={v2y(-K)} stroke="#bc8cff" strokeWidth="0.75" />
        <text x={PL - 18} y={v2y(0) + 3.5} textAnchor="middle" fill="#bc8cff" fontSize="7.5" fontFamily="monospace"
          transform={`rotate(-90,${PL - 18},${v2y(0)})`}>
          2K = {2 * K} m/s
        </text>
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { phRef.current = 0; setPhase(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          ↺ Reset
        </button>
        <span className="text-[10px] text-[#484f58] font-mono ml-2">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${speed === s
              ? "bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">
          K = {K} m/s · Mp sin i ≈ {((K / 28.4) * Math.sqrt(1.486)).toFixed(2)} M_J
        </span>
      </div>
    </div>
  );
}
