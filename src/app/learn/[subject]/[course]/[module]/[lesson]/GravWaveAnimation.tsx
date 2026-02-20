"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 320;
const WAVE_Y = 130;         // vertical centre of waveform panel
const WAVE_H = 90;          // half-height of waveform
const GRID_Y = 230;         // top of spacetime grid panel
const GRID_H = H - GRID_Y - 10;
const COLS = 14, ROWS = 4;  // spacetime grid cells
const CELL_W = (W - 40) / COLS;
const CELL_H = GRID_H / ROWS;

// GW chirp signal: frequency and amplitude increase over time
function chirpAmplitude(phase: number, chirpT: number): number {
  // phase 0..1, chirpT = time to merger (0 = merger)
  const tau = Math.max(0.01, 1 - chirpT);
  return Math.min(1, 0.12 / (tau * tau * 0.5 + 0.01));
}

function chirpFreq(chirpT: number): number {
  const tau = Math.max(0.01, 1 - chirpT);
  return 20 + 150 / (tau + 0.1); // Hz scaling (visual)
}

function buildWaveform(chirpT: number, n = 300): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const phase = t * chirpFreq(chirpT) * 0.08;
    const amp = chirpAmplitude(t, chirpT * t) * WAVE_H * 0.85;
    return {
      x: 20 + t * (W - 40),
      y: WAVE_Y + Math.sin(phase * Math.PI * 2) * amp,
    };
  });
}

// Grid deformation: simulate h+ strain
function gridPt(col: number, row: number, chirpT: number, t: number): { x: number; y: number } {
  const baseX = 20 + col * CELL_W;
  const baseY = GRID_Y + row * CELL_H;
  const tau = Math.max(0.01, 1 - chirpT);
  const h = Math.min(0.35, 0.06 / (tau + 0.08)) * Math.sin(t * chirpFreq(chirpT) * 0.15);
  // h+ polarisation: stretches x, compresses y
  const dx = (col - COLS / 2) * CELL_W * h * 0.5;
  const dy = -(row - ROWS / 2) * CELL_H * h * 0.5;
  return { x: baseX + dx, y: baseY + dy };
}

export default function GravWaveAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(0);
  const lastT = useRef<number | null>(null);

  const PERIOD = 12; // seconds for full inspiral

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        tRef.current = (tRef.current + dt * speed) % PERIOD;
        setT(tRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  const chirpT = t / PERIOD; // 0..1
  const waveform = buildWaveform(chirpT);
  const wavePathD = waveform.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const strain = chirpAmplitude(chirpT, chirpT) * 0.45;
  const freq = Math.round(20 + 150 * Math.min(1, chirpT * 1.2));
  const tau = Math.max(0.01, 1 - chirpT);

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🕳️ Interactive · Gravitational Waves
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Binary Inspiral Chirp Signal &amp; Spacetime Distortion</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Two merging black holes emit gravitational waves — a chirp signal that rises in frequency and amplitude. The grid shows h+ spacetime strain: stretching in one axis, compressing in the other."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Waveform panel */}
        <text x={22} y={16} fill="#30363d" fontSize="8.5" fontFamily="monospace">LIGO-STYLE WAVEFORM h(t) — CHIRP SIGNAL</text>

        {/* Baseline */}
        <line x1={20} y1={WAVE_Y} x2={W - 20} y2={WAVE_Y} stroke="#1d2230" strokeWidth="1" />

        {/* Amplitude envelope (orange lines above/below) */}
        {(() => {
          const envPts = Array.from({ length: 200 }, (_, i) => {
            const phase = i / 199;
            const amp = chirpAmplitude(phase, chirpT * phase) * WAVE_H * 0.85;
            return { x: 20 + phase * (W - 40), amp };
          });
          const topD = envPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${(WAVE_Y - p.amp).toFixed(1)}`).join(" ");
          const botD = envPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${(WAVE_Y + p.amp).toFixed(1)}`).join(" ");
          return (
            <>
              <path d={topD} fill="none" stroke="#bc8cff" strokeWidth="0.75" strokeOpacity="0.45" strokeDasharray="4,3" />
              <path d={botD} fill="none" stroke="#bc8cff" strokeWidth="0.75" strokeOpacity="0.45" strokeDasharray="4,3" />
            </>
          );
        })()}

        {/* Chirp waveform */}
        <path d={wavePathD} fill="none" stroke="#58a6ff" strokeWidth="1.8" strokeOpacity="0.92" />

        {/* Current position marker */}
        {(() => {
          const idx = Math.floor(chirpT * (waveform.length - 1));
          const pt = waveform[idx];
          return <circle cx={pt.x} cy={pt.y} r={4} fill="#f0883e" stroke="#0d1117" strokeWidth="1.5" />;
        })()}

        {/* Merger annotation */}
        {chirpT > 0.85 && (
          <>
            <line x1={20 + chirpT * (W - 40)} y1={WAVE_Y - WAVE_H - 10} x2={20 + chirpT * (W - 40)} y2={WAVE_Y + WAVE_H + 10}
              stroke="#f0883e" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.7" />
            <text x={20 + chirpT * (W - 40) + 4} y={WAVE_Y - WAVE_H - 4} fill="#f0883e" fontSize="8" fontFamily="monospace">MERGER</text>
          </>
        )}

        {/* Stats badge */}
        <rect x={W - 140} y={6} width={132} height={50} rx={5} fill="#0d1117" stroke="#30363d" strokeWidth="0.75" />
        <text x={W - 134} y={19} fill="#8b949e" fontSize="8" fontFamily="monospace">Freq (scaled):</text>
        <text x={W - 134} y={30} fill="#58a6ff" fontSize="12" fontFamily="monospace" fontWeight="bold">{freq} Hz</text>
        <text x={W - 134} y={41} fill="#8b949e" fontSize="8" fontFamily="monospace">Strain h:</text>
        <text x={W - 80} y={41} fill="#bc8cff" fontSize="10" fontFamily="monospace" fontWeight="bold">{strain.toExponential(1)}</text>
        <text x={W - 134} y={51} fill="#484f58" fontSize="7.5" fontFamily="monospace">ΔL/L ~ 10⁻²¹ (LIGO)</text>

        {/* ── Spacetime grid panel ── */}
        <line x1={0} y1={GRID_Y - 4} x2={W} y2={GRID_Y - 4} stroke="#1d2230" strokeWidth="1" />
        <text x={22} y={GRID_Y + 10} fill="#30363d" fontSize="8.5" fontFamily="monospace">SPACETIME GRID · h+ STRAIN (x-stretched, y-compressed)</text>

        {/* Vertical grid lines */}
        {Array.from({ length: COLS + 1 }, (_, c) => {
          const pts = Array.from({ length: ROWS + 1 }, (_, r) => gridPt(c, r, chirpT, t));
          return (
            <polyline key={c}
              points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
              fill="none" stroke="#58a6ff" strokeWidth="0.6" strokeOpacity="0.4" />
          );
        })}
        {/* Horizontal grid lines */}
        {Array.from({ length: ROWS + 1 }, (_, r) => {
          const pts = Array.from({ length: COLS + 1 }, (_, c) => gridPt(c, r, chirpT, t));
          return (
            <polyline key={r}
              points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}
              fill="none" stroke="#58a6ff" strokeWidth="0.6" strokeOpacity="0.4" />
          );
        })}
      </svg>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { tRef.current = 0; setT(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          ↺ Reset
        </button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${speed === s
              ? "bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">
          GW150914 style · h = ΔL/L
        </span>
      </div>
    </div>
  );
}
