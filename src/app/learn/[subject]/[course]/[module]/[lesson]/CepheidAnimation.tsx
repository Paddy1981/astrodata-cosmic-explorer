"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 320;
const STAR_CX = 155, STAR_CY = 120;
const LC_X = 310, LC_Y = 20, LC_W = W - LC_X - 20, LC_H = 200;
const PL_X = 310, PL_Y = LC_Y + LC_H + 20, PL_W = LC_W, PL_H = 70;

// Period-Luminosity relation: log L = a * log P + b  (classical Cepheids)
// Leavitt's Law: M_V = -2.81 log P - 1.43 (approx)
const PL_PERIODS = [1, 2, 5, 10, 20, 50, 100]; // days
function plLum(P: number) { return -2.81 * Math.log10(P) - 1.43; } // M_V (abs mag)
const PL_MV_MIN = plLum(100), PL_MV_MAX = plLum(1); // absolute magnitude range

// SVG coords for P-L plot
const plog2x = (P: number) => PL_X + (Math.log10(P) - Math.log10(1)) / (Math.log10(100) - Math.log10(1)) * PL_W;
const mv2y = (mv: number) => PL_Y + PL_H * (1 - (mv - PL_MV_MIN) / (PL_MV_MAX - PL_MV_MIN));

// Light curve: asymmetric, fast rise / slow fall
function lightCurve(phase: number): number {
  const p = phase % 1;
  if (p < 0.25) return 0.3 + (p / 0.25) * 0.7;        // fast rise
  return 1.0 - ((p - 0.25) / 0.75) * 0.7;              // slow decline
}

// Radius (pulsation): peaks slightly after max brightness
function starRadius(phase: number): number {
  const p = phase % 1;
  const rPhase = (p + 0.1) % 1;
  return 0.7 + 0.3 * Math.sin(rPhase * Math.PI * 2);
}

const PERIODS = [
  { P: 5.4,  label: "δ Cephei (5.4d)" },
  { P: 10,   label: "Example (10d)"   },
  { P: 30,   label: "Long period (30d)" },
];

export default function CepheidAnimation({ description }: { description?: string }) {
  const [phaseRaw, setPhaseRaw] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [periodIdx, setPeriodIdx] = useState(0);
  const phaseRef = useRef(0);
  const lastT = useRef<number | null>(null);

  const period = PERIODS[periodIdx].P;
  // Speed normalised: one period in 8 seconds at speed 1
  const omega = (1 / 8) * speed;

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        phaseRef.current = (phaseRef.current + (now - lastT.current) / 1000 * omega) % 1;
        setPhaseRaw(phaseRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed, omega]);

  const phase = phaseRaw;
  const flux = lightCurve(phase);
  const rFrac = starRadius(phase);
  const baseR = 36;
  const R = baseR * (0.65 + rFrac * 0.35);
  const colorT = 5000 + flux * 1000; // temperature 5000-6000K
  const starColor = colorT > 5500 ? "#fff4ea" : "#ffd2a1";

  // LC trace
  const lcPts = Array.from({ length: 200 }, (_, i) => {
    const p = i / 199;
    const f = lightCurve(p);
    return { x: LC_X + p * LC_W, y: LC_Y + (1 - f) * LC_H };
  });
  const lcPath = lcPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const currentX = LC_X + phase * LC_W;
  const currentY = LC_Y + (1 - flux) * LC_H;

  // P-L line
  const plLinePts = Array.from({ length: 50 }, (_, i) => {
    const P = Math.pow(10, Math.log10(1) + (Math.log10(100) - Math.log10(1)) * (i / 49));
    return { x: plog2x(P), y: mv2y(plLum(P)) };
  });
  const plPath = plLinePts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const currentMv = plLum(period);
  const plDotX = plog2x(period), plDotY = mv2y(currentMv);

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Cepheid Variable Stars
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Pulsating Stars &amp; Leavitt&apos;s Period-Luminosity Law</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Watch a Cepheid pulsate — expanding and contracting with a clockwork period. The Period-Luminosity relation (right) shows how longer periods mean intrinsically brighter stars, making Cepheids the universe's standard candles."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="cep-star" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor={starColor} />
            <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
          </radialGradient>
          <radialGradient id="cep-glow" cx="50%" cy="50%" r="50%">
            <stop offset="30%" stopColor={starColor} stopOpacity={0.25 + flux * 0.2} />
            <stop offset="100%" stopColor={starColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Star */}
        <text x={12} y={14} fill="#30363d" fontSize="8.5" fontFamily="monospace">PULSATING STAR (size exaggerated)</text>
        <circle cx={STAR_CX} cy={STAR_CY} r={R * 3.2} fill="url(#cep-glow)" />
        <circle cx={STAR_CX} cy={STAR_CY} r={R} fill="url(#cep-star)" />
        <text x={STAR_CX} y={STAR_CY + R + 16} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">{PERIODS[periodIdx].label}</text>
        {/* Phase + flux readout */}
        <rect x={12} y={STAR_CY + R + 28} width={132} height={34} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={20} y={STAR_CY + R + 42} fill="#8b949e" fontSize="8" fontFamily="monospace">Phase: {phase.toFixed(3)}</text>
        <text x={20} y={STAR_CY + R + 54} fill="#f0883e" fontSize="8" fontFamily="monospace">Flux: {flux.toFixed(3)} · R: {rFrac.toFixed(2)}</text>

        {/* Light curve */}
        <text x={LC_X} y={LC_Y - 6} fill="#30363d" fontSize="8.5" fontFamily="monospace">LIGHT CURVE</text>
        <line x1={LC_X} y1={LC_Y} x2={LC_X} y2={LC_Y + LC_H} stroke="#1d2230" strokeWidth="1" />
        <line x1={LC_X} y1={LC_Y + LC_H} x2={LC_X + LC_W} y2={LC_Y + LC_H} stroke="#1d2230" strokeWidth="1" />
        {[0, 0.5, 1].map(f => {
          const y = LC_Y + (1 - f) * LC_H;
          return <g key={f}>
            <line x1={LC_X} y1={y} x2={LC_X + LC_W} y2={y} stroke="#1d2230" strokeWidth="0.6" />
            <text x={LC_X - 4} y={y + 3} textAnchor="end" fill="#484f58" fontSize="7" fontFamily="monospace">{f.toFixed(1)}</text>
          </g>;
        })}
        <path d={lcPath} fill="none" stroke="#f0883e" strokeWidth="2" />
        <line x1={currentX} y1={LC_Y} x2={currentX} y2={LC_Y + LC_H} stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.6" />
        <circle cx={currentX} cy={currentY} r={4.5} fill="#f0883e" stroke="#090d14" strokeWidth="1.5" />
        <text x={LC_X + LC_W / 2} y={LC_Y + LC_H + 14} textAnchor="middle" fill="#8b949e" fontSize="8.5">Phase (0–1)</text>

        {/* Period-Luminosity plot */}
        <text x={PL_X} y={PL_Y - 6} fill="#30363d" fontSize="8.5" fontFamily="monospace">LEAVITT P-L RELATION (Milky Way Cepheids)</text>
        <line x1={PL_X} y1={PL_Y} x2={PL_X} y2={PL_Y + PL_H} stroke="#1d2230" strokeWidth="1" />
        <line x1={PL_X} y1={PL_Y + PL_H} x2={PL_X + PL_W} y2={PL_Y + PL_H} stroke="#1d2230" strokeWidth="1" />
        {PL_PERIODS.map(P => (
          <text key={P} x={plog2x(P)} y={PL_Y + PL_H + 12} textAnchor="middle" fill="#484f58" fontSize="7" fontFamily="monospace">{P}d</text>
        ))}
        <path d={plPath} fill="none" stroke="#58a6ff" strokeWidth="1.5" strokeOpacity="0.7" />
        <circle cx={plDotX} cy={plDotY} r={5} fill="#f7cc4a" stroke="#090d14" strokeWidth="1.5" />
        <text x={plDotX + 8} y={plDotY + 3} fill="#f7cc4a" fontSize="8" fontFamily="monospace">M_V = {currentMv.toFixed(1)}</text>
        <text x={PL_X - 4} y={PL_Y + PL_H / 2} textAnchor="middle" fill="#8b949e" fontSize="8"
          transform={`rotate(-90, ${PL_X - 4}, ${PL_Y + PL_H / 2})`}>M_V</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? "bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/30" : "bg-[#21262d] text-[#484f58]"}`}>{s}×</button>
        ))}
        <span className="text-[10px] text-[#484f58] font-mono ml-2">Period:</span>
        {PERIODS.map((p, i) => (
          <button key={p.P} onClick={() => setPeriodIdx(i)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${periodIdx === i ? "bg-[#f7cc4a]/20 text-[#f7cc4a] border border-[#f7cc4a]/30" : "bg-[#21262d] text-[#484f58]"}`}>
            {p.P}d
          </button>
        ))}
      </div>
    </div>
  );
}
