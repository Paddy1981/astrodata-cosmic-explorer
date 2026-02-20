"use client";
import { useRef, useState, useEffect } from "react";

// ── Layout ───────────────────────────────────────────────────────────────────
const W = 620, STAR_H = 230, LC_H = 145, TOTAL_H = STAR_H + LC_H;
const SCX = W / 2, SCY = STAR_H / 2 + 8;
const SR = 56;           // star radius (SVG px)
const PLR = 13;          // planet radius (SVG px, ~2.3× exaggerated for visibility)
const OA = 192;          // orbit semi-major axis (SVG px)
const IF = 0.056;        // inclination factor — planet y = OA*sin(θ)*IF ≈ 10.8 px at transit centre
// Impact parameter b = 10.8/56 ≈ 0.19 (close to KOI-17b's 0.18)
// Transit fraction: arcsin((SR+PLR)/OA) = arcsin(69/192) ≈ 21° → ~12% of orbit

// ── LC panel ─────────────────────────────────────────────────────────────────
const PL = 48, LPR = 14, LPT = 18, LPB = 26;
const LCW = W - PL - LPR, LCH = LC_H - LPT - LPB;
const LCY = STAR_H;
const FMIN = 0.982, FMAX = 1.003;
const p2x = (p: number) => PL + p * LCW;
const f2y = (f: number) => LCY + LPT + LCH - ((f - FMIN) / (FMAX - FMIN)) * LCH;

// ── Physics ───────────────────────────────────────────────────────────────────
const DEPTH = (PLR / SR) ** 2; // ≈ 0.054 (exaggerated for visibility)
const DEPTH_LABEL = 1.42;      // real KOI-17b depth shown in label

function transitFlux(phase: number): number {
  const th = 2 * Math.PI * phase;
  const dx = OA * Math.cos(th);
  const dy = OA * Math.sin(th) * IF;
  const d = Math.sqrt(dx * dx + dy * dy) / SR;
  const r = PLR / SR;
  if (Math.sin(th) <= 0) return 1;           // planet behind star
  if (d >= 1 + r) return 1;                  // no overlap
  if (d <= 1 - r) return 1 - r * r;          // full transit (simplified depth)
  const k0 = Math.acos(Math.min(1, (d * d + r * r - 1) / (2 * d * r)));
  const k1 = Math.acos(Math.min(1, (d * d + 1 - r * r) / (2 * d)));
  const disc = Math.max(0, (1 + r + d) * (-1 + r + d) * (1 - r + d) * (1 + r - d));
  return 1 - (r * r * k0 + k1 - 0.5 * Math.sqrt(disc)) / Math.PI;
}

// Pre-compute full theoretical light curve path
const LC_FULL = Array.from({ length: 360 }, (_, i) => {
  const p = i / 359;
  return { p, f: transitFlux(p) };
});
const LC_PATH = LC_FULL
  .map((d, i) => `${i === 0 ? "M" : "L"}${p2x(d.p).toFixed(1)},${f2y(d.f).toFixed(1)}`)
  .join(" ");

// Orbit ellipse path
const ORBIT_PATH = Array.from({ length: 200 }, (_, i) => {
  const th = (2 * Math.PI * i) / 199;
  const x = (SCX + OA * Math.cos(th)).toFixed(1);
  const y = (SCY + OA * Math.sin(th) * IF).toFixed(1);
  return `${i === 0 ? "M" : "L"}${x},${y}`;
}).join(" ") + "Z";

const YTICKS = [0.984, 0.988, 0.992, 0.996, 1.000];

export default function TransitMethodAnimation({ description }: { description?: string }) {
  const [phase, setPhase] = useState(0.88);   // start just before transit
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const phRef = useRef(0.88);
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
  const px = SCX + OA * Math.cos(th);
  const py = SCY + OA * Math.sin(th) * IF;
  const inFront = Math.sin(th) > 0;
  const normDist = Math.sqrt((OA * Math.cos(th)) ** 2 + (OA * Math.sin(th) * IF) ** 2) / SR;
  const transiting = inFront && normDist < 1 + PLR / SR;
  const fullTransit = inFront && normDist < 1 - PLR / SR;
  const flux = transitFlux(phase);
  const statusLabel = fullTransit ? "FULL TRANSIT" : transiting ? "INGRESS/EGRESS" : "BASELINE";
  const statusColor = transiting ? "#f0883e" : "#3fb950";

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1">
          🪐 Interactive Animation · Transit Photometry
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Transit Method — Live Simulation</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Watch a hot Jupiter crossing its star. The lower panel shows the light curve Kepler records — the planet's shadow causes a 1.42% brightness dip. Sizes are exaggerated for clarity."}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${TOTAL_H}`}
        className="w-full"
        style={{ background: "#090d14", display: "block" }}
      >
        <defs>
          <radialGradient id="tm-star" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff7d0" />
            <stop offset="45%" stopColor="#ffb030" />
            <stop offset="100%" stopColor="#e05000" stopOpacity="0.92" />
          </radialGradient>
          <radialGradient id="tm-planet" cx="32%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#3a5575" />
            <stop offset="100%" stopColor="#07090e" />
          </radialGradient>
          <radialGradient id="tm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor="#ff9900" stopOpacity={transiting ? 0.18 : 0.26} />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
          </radialGradient>
          <clipPath id="tm-starclip"><circle cx={SCX} cy={SCY} r={SR} /></clipPath>
        </defs>

        {/* Panel label */}
        <text x={12} y={16} fill="#30363d" fontSize="8.5" fontFamily="monospace">TELESCOPE VIEW (observer sees stellar disk)</text>

        {/* Orbit path */}
        <path d={ORBIT_PATH} fill="none" stroke="#1d2230" strokeWidth="1" strokeDasharray="5,4" />

        {/* Star glow */}
        <circle cx={SCX} cy={SCY} r={SR * 2.6} fill="url(#tm-glow)" />
        {/* Star disk */}
        <circle cx={SCX} cy={SCY} r={SR} fill="url(#tm-star)" />
        {/* Limb darkening */}
        <circle cx={SCX} cy={SCY} r={SR} fill="none" stroke="#80380040" strokeWidth="12" />

        {/* Planet behind star */}
        {!inFront && (
          <circle cx={px} cy={py} r={PLR} fill="#0b1220" stroke="#1a2535" strokeWidth="0.8" opacity={0.65} />
        )}

        {/* Planet in front of star */}
        {inFront && (
          <>
            {/* Atmosphere halo */}
            <circle cx={px} cy={py} r={PLR * 1.55} fill="none" stroke="#4488ee" strokeWidth="1.5"
              strokeOpacity="0.25" clipPath="url(#tm-starclip)" />
            {/* Planet disk */}
            <circle cx={px} cy={py} r={PLR} fill="url(#tm-planet)" clipPath="url(#tm-starclip)" />
          </>
        )}

        {/* Impact parameter guide (during transit) */}
        {transiting && (
          <>
            <line x1={SCX - SR - 4} y1={py} x2={SCX + SR + 4} y2={py}
              stroke="#484f58" strokeWidth="0.75" strokeDasharray="3,2" />
            <text x={SCX + SR + 8} y={py + 3.5} fill="#484f58" fontSize="7.5" fontFamily="monospace">b = 0.19</text>
          </>
        )}

        {/* Status badge */}
        <rect x={W - 128} y={7} width={120} height={32} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={W - 68} y={20} textAnchor="middle" fill={statusColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
          {statusLabel}
        </text>
        <text x={W - 68} y={32} textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">
          F = {flux.toFixed(4)}
        </text>

        {/* Star label */}
        <text x={SCX} y={SCY + SR + 17} textAnchor="middle" fill="#30363d" fontSize="8" fontFamily="monospace">
          KOI-17 (G-type · T_eff 5680 K · R★ = 1.02 R☉)
        </text>

        {/* ── LC panel ─────────────────────────────────────────────────── */}
        <rect x={0} y={LCY} width={W} height={LC_H} fill="#0b1018" />
        <line x1={0} y1={LCY} x2={W} y2={LCY} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={LCY + 13} fill="#30363d" fontSize="8.5" fontFamily="monospace">LIGHT CURVE · Kepler-style photometry</text>

        {/* Y grid + labels */}
        {YTICKS.map(f => (
          <g key={f}>
            <line x1={PL} y1={f2y(f)} x2={PL + LCW} y2={f2y(f)}
              stroke={f === 1.0 ? "#30363d" : "#151c26"} strokeWidth={f === 1 ? 1 : 0.75} />
            <text x={PL - 5} y={f2y(f) + 3.5} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
              {f.toFixed(3)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={p2x(p)} y1={LCY + LPT + LCH} x2={p2x(p)} y2={LCY + LPT + LCH + 4} stroke="#30363d" />
            <text x={p2x(p)} y={LCY + LPT + LCH + 14} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">
              {p.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={PL + LCW / 2} y={TOTAL_H - 4} textAnchor="middle" fill="#8b949e" fontSize="9">Orbital Phase</text>

        {/* Full light curve */}
        <path d={LC_PATH} fill="none" stroke="#58a6ff" strokeWidth="1.75" strokeOpacity="0.9" />

        {/* Transit depth annotation */}
        {fullTransit && (
          <>
            <line x1={p2x(phase) - 22} y1={f2y(1 - DEPTH)} x2={p2x(phase) + 22} y2={f2y(1 - DEPTH)}
              stroke="#f0883e" strokeWidth="0.75" strokeDasharray="2,2" strokeOpacity="0.6" />
            <text x={p2x(phase) + 26} y={f2y(1 - DEPTH) + 3.5} fill="#f0883e" fontSize="7.5" fontFamily="monospace">
              ΔF = {DEPTH_LABEL}%
            </text>
          </>
        )}

        {/* Current phase marker */}
        <line x1={p2x(phase)} y1={LCY + LPT} x2={p2x(phase)} y2={LCY + LPT + LCH}
          stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.5" />
        <circle cx={p2x(phase)} cy={f2y(flux)} r={4.5} fill="#f0883e" stroke="#0b1018" strokeWidth="1.5" />

        {/* Phase readout */}
        <text x={PL + LCW - 4} y={LCY + LPT + 10} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">
          φ = {phase.toFixed(3)}
        </text>
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { phRef.current = 0.88; setPhase(0.88); setPlaying(false); }}
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
          KOI-17b · P = 1.486 d · Depth = {DEPTH_LABEL}%
        </span>
      </div>
    </div>
  );
}
