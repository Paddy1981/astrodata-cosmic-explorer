"use client";
import { useRef, useState, useEffect } from "react";

// ── Layout ───────────────────────────────────────────────────────────────────
const W = 620, SKY_H = 215, MAG_H = 150, TOTAL_H = SKY_H + MAG_H;

// Sky panel — source star moves relative to lens star (fixed at centre)
const LCX = W / 2, LCY = SKY_H / 2 + 8;   // lens star position (fixed)
const TRAJ_Y = LCY - 22;                    // source trajectory y-level (impact offset)
const TRAJ_X0 = 48, TRAJ_X1 = W - 48;      // trajectory start/end
const EINSTEIN_R_BASE = 42;                 // Einstein ring radius when u=1

// Magnification (Paczynski 1986)
function magnification(u: number): number {
  return (u * u + 2) / (u * Math.sqrt(u * u + 4));
}

// Time axis: t ∈ [-2.5, 2.5] (in units of Einstein crossing time T_E)
const T_RANGE = 5; // total time range
const U_MIN = 0.14;           // min impact param → peak magnification

// Planetary anomaly (short extra bump)
const T_PLANET = 0.7;          // planet crossing time offset
const T_ANOMALY_HALF = 0.12;   // half-width
const A_ANOMALY = 2.8;         // extra magnification amplitude

function totalMag(t: number): number {
  const u = Math.sqrt(U_MIN * U_MIN + (t / 0.9) * (t / 0.9));
  const base = magnification(Math.max(0.01, u));
  const anomaly = A_ANOMALY * Math.exp(-0.5 * ((t - T_PLANET) / T_ANOMALY_HALF) ** 2);
  return base + anomaly;
}

// Magnification panel
const PL = 54, MPR = 14, MPT = 18, MPB = 28;
const MGW = W - PL - MPR, MGH = MAG_H - MPT - MPB;
const MGY = SKY_H;
const MAG_MAX = 12, MAG_MIN = 1;
const t2x = (t: number) => PL + ((t + T_RANGE / 2) / T_RANGE) * MGW;
const m2y = (m: number) => MGY + MPT + MGH - ((Math.min(m, MAG_MAX) - MAG_MIN) / (MAG_MAX - MAG_MIN)) * MGH;

// Pre-compute full magnification curve
const MAG_PATH = Array.from({ length: 400 }, (_, i) => {
  const t = -T_RANGE / 2 + (i / 399) * T_RANGE;
  const m = totalMag(t);
  return `${i === 0 ? "M" : "L"}${t2x(t).toFixed(1)},${m2y(m).toFixed(1)}`;
}).join(" ");

// Source position along trajectory → t ∈ [-2.5, 2.5]
function tToSourceX(t: number) {
  return TRAJ_X0 + ((t + T_RANGE / 2) / T_RANGE) * (TRAJ_X1 - TRAJ_X0);
}

const YTICKS = [1, 3, 6, 9, 12];

export default function MicrolensAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(-T_RANGE / 2 * 0.95);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(-T_RANGE / 2 * 0.95);
  const lastTime = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastTime.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastTime.current !== null) {
        const dt = (now - lastTime.current) / 1000;
        tRef.current = tRef.current + dt * speed * 0.5;
        if (tRef.current > T_RANGE / 2 * 0.95) tRef.current = -T_RANGE / 2 * 0.95; // loop
        setT(tRef.current);
      }
      lastTime.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastTime.current = null; };
  }, [playing, speed]);

  const srcX = tToSourceX(t);
  const srcY = TRAJ_Y;
  const u = Math.sqrt(U_MIN * U_MIN + (t / 0.9) * (t / 0.9));
  const mag = totalMag(t);
  const einsteinR = EINSTEIN_R_BASE / Math.max(u, 0.05);  // ring grows as source approaches
  const einsteinVisible = u < 2.5;
  const nearPeak = Math.abs(t) < 0.4;
  const inAnomaly = Math.abs(t - T_PLANET) < T_ANOMALY_HALF * 2.5;

  // Lensed image positions (two images along source-lens axis)
  const img1Dist = (u + Math.sqrt(u * u + 4)) / 2 * EINSTEIN_R_BASE;
  const img2Dist = (u - Math.sqrt(u * u + 4)) / 2 * EINSTEIN_R_BASE;
  const angle = Math.atan2(srcY - LCY, srcX - LCX);
  const img1x = LCX + img1Dist * Math.cos(angle);
  const img1y = LCY + img1Dist * Math.sin(angle);
  const img2x = LCX + img2Dist * Math.cos(angle);
  const img2y = LCY + img2Dist * Math.sin(angle);

  // Background "stars"
  const BG = [
    { x: 90, y: 55 }, { x: 160, y: 80 }, { x: 250, y: 45 }, { x: 380, y: 90 },
    { x: 490, y: 60 }, { x: 540, y: 130 }, { x: 420, y: 155 }, { x: 75, y: 145 },
    { x: 310, y: 180 }, { x: 185, y: 170 },
  ];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          🌌 Interactive Animation · Gravitational Microlensing
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Microlensing Method — Live Simulation</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "A foreground star (lens) passes in front of a background star (source). Its gravity bends the source's light, creating a magnification event. A planet around the lens adds a short extra spike. Watch the Einstein ring form and the magnification peak in the bottom panel."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="ml-lens" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff0c0" />
            <stop offset="60%" stopColor="#ffaa30" />
            <stop offset="100%" stopColor="#cc6600" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="ml-src" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#d0eeff" />
            <stop offset="70%" stopColor="#88bbff" />
            <stop offset="100%" stopColor="#2255cc" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="ml-srcglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#aaddff" stopOpacity={Math.min(0.9, (mag - 1) / 8)} />
            <stop offset="100%" stopColor="#aaddff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Panel label */}
        <text x={12} y={16} fill="#30363d" fontSize="8.5" fontFamily="monospace">SKY VIEW — SOURCE MOVES LEFT TO RIGHT</text>

        {/* Background field stars */}
        {BG.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={1.2} fill="#8b949e" opacity={0.4} />
        ))}

        {/* Source trajectory line */}
        <line x1={TRAJ_X0} y1={TRAJ_Y} x2={TRAJ_X1} y2={TRAJ_Y}
          stroke="#30363d" strokeWidth="0.75" strokeDasharray="5,4" />
        <text x={TRAJ_X0 - 4} y={TRAJ_Y + 3.5} textAnchor="end" fill="#30363d" fontSize="7.5" fontFamily="monospace">→</text>

        {/* Einstein ring */}
        {einsteinVisible && (
          <circle cx={LCX} cy={LCY} r={Math.min(einsteinR, 80)}
            fill="none"
            stroke="#bc8cff"
            strokeWidth={nearPeak ? 1.5 : 0.75}
            strokeOpacity={nearPeak ? 0.7 : 0.35}
            strokeDasharray={nearPeak ? "none" : "4,3"} />
        )}
        {einsteinVisible && (
          <text x={LCX + Math.min(einsteinR, 80) + 5} y={LCY - 3}
            fill="#bc8cff" fontSize="7.5" fontFamily="monospace" opacity={nearPeak ? 0.8 : 0.4}>
            θ_E
          </text>
        )}

        {/* Two lensed images */}
        {u < 2.2 && (
          <>
            <circle cx={img1x} cy={img1y} r={5 * Math.min(mag / 4, 1.2)}
              fill="url(#ml-src)" opacity={0.7} />
            {Math.abs(img2Dist) < 80 && (
              <circle cx={img2x} cy={img2y} r={3 * Math.min(mag / 6, 0.9)}
                fill="url(#ml-src)" opacity={0.4} />
            )}
          </>
        )}

        {/* Source glow (magnification effect) */}
        <circle cx={srcX} cy={srcY} r={Math.min(mag * 4, 40)} fill="url(#ml-srcglow)" />

        {/* Source star */}
        <circle cx={srcX} cy={srcY} r={6} fill="url(#ml-src)" />
        <text x={srcX} y={srcY - 10} textAnchor="middle" fill="#88bbff" fontSize="7.5" fontFamily="monospace">
          source
        </text>

        {/* Lens star */}
        <circle cx={LCX} cy={LCY} r={EINSTEIN_R_BASE * 0.06} fill="url(#ml-lens)" />
        <circle cx={LCX} cy={LCY} r={EINSTEIN_R_BASE * 0.14} fill="url(#ml-lens)" opacity={0.3} />
        <text x={LCX} y={LCY + 18} textAnchor="middle" fill="#ffaa30" fontSize="7.5" fontFamily="monospace">
          lens star
        </text>

        {/* Planet anomaly marker */}
        {inAnomaly && (
          <text x={srcX} y={srcY + 18} textAnchor="middle" fill="#f0883e" fontSize="8" fontFamily="monospace">
            ← planet!
          </text>
        )}

        {/* Magnification readout */}
        <rect x={W - 130} y={7} width={122} height={34} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={W - 69} y={21} textAnchor="middle"
          fill={nearPeak ? "#f0883e" : inAnomaly ? "#bc8cff" : "#3fb950"}
          fontSize="9" fontFamily="monospace" fontWeight="bold">
          A = {mag.toFixed(2)}×
        </text>
        <text x={W - 69} y={34} textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">
          u = {u.toFixed(3)}
        </text>

        {/* ── Magnification panel ──────────────────────────────────── */}
        <rect x={0} y={MGY} width={W} height={MAG_H} fill="#0b1018" />
        <line x1={0} y1={MGY} x2={W} y2={MGY} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={MGY + 13} fill="#30363d" fontSize="8.5" fontFamily="monospace">
          LIGHT MAGNIFICATION CURVE · Paczynski (1986) + planetary anomaly
        </text>

        {/* Y grid */}
        {YTICKS.map(m => (
          <g key={m}>
            <line x1={PL} y1={m2y(m)} x2={PL + MGW} y2={m2y(m)}
              stroke={m === 1 ? "#30363d" : "#151c26"} strokeWidth={m === 1 ? 1 : 0.75} />
            <text x={PL - 5} y={m2y(m) + 3.5} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
              {m}×
            </text>
          </g>
        ))}
        <text x={14} y={MGY + MPT + MGH / 2 + 3.5} textAnchor="middle" fill="#8b949e" fontSize="9"
          transform={`rotate(-90,14,${MGY + MPT + MGH / 2})`}>
          Magnification
        </text>

        {/* X ticks */}
        {[-2, -1, 0, 1, 2].map(v => (
          <g key={v}>
            <line x1={t2x(v)} y1={MGY + MPT + MGH} x2={t2x(v)} y2={MGY + MPT + MGH + 4} stroke="#30363d" />
            <text x={t2x(v)} y={MGY + MPT + MGH + 14} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
              {v > 0 ? "+" : ""}{v} T_E
            </text>
          </g>
        ))}
        <text x={PL + MGW / 2} y={TOTAL_H - 4} textAnchor="middle" fill="#8b949e" fontSize="9">
          Time (Einstein crossing time T_E)
        </text>

        {/* Magnification curve */}
        <path d={MAG_PATH} fill="none" stroke="#58a6ff" strokeWidth="1.75" strokeOpacity="0.9" />

        {/* Planetary anomaly highlight region */}
        <rect
          x={t2x(T_PLANET - T_ANOMALY_HALF * 2)} y={MGY + MPT}
          width={t2x(T_PLANET + T_ANOMALY_HALF * 2) - t2x(T_PLANET - T_ANOMALY_HALF * 2)}
          height={MGH}
          fill="#bc8cff" fillOpacity="0.06"
        />
        <text x={t2x(T_PLANET)} y={MGY + MPT + 12} textAnchor="middle" fill="#bc8cff" fontSize="7.5" fontFamily="monospace">
          planet anomaly
        </text>

        {/* Peak annotation */}
        <line x1={t2x(0)} y1={MGY + MPT} x2={t2x(0)} y2={MGY + MPT + MGH}
          stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.4" />
        <text x={t2x(0) + 4} y={MGY + MPT + 12} fill="#f0883e" fontSize="7.5" fontFamily="monospace">
          A_peak = {magnification(U_MIN).toFixed(1)}×
        </text>

        {/* Current position marker */}
        <line x1={t2x(t)} y1={MGY + MPT} x2={t2x(t)} y2={MGY + MPT + MGH}
          stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.6" />
        <circle cx={t2x(t)} cy={m2y(mag)} r={4.5} fill="#f0883e" stroke="#0b1018" strokeWidth="1.5" />
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { tRef.current = -T_RANGE / 2 * 0.95; setT(tRef.current); setPlaying(false); }}
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
          u_min = {U_MIN} · A_max ≈ {magnification(U_MIN).toFixed(1)}× · OGLE style
        </span>
      </div>
    </div>
  );
}
