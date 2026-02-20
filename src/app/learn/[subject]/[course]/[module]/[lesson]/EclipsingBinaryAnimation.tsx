"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 320;
const SCX = W / 2, SCY = 115;
const LC_Y = 205, LC_H = 90;
const PL = 48, LPR = 16, LPT = 14, LPB = 24;
const LCW = W - PL - LPR, LCH = LC_H - LPT - LPB;
const p2x = (p: number) => PL + p * LCW;
const f2y = (f: number) => LC_Y + LPT + LCH - (f / 1.05) * LCH;

const PRESETS = [
  { name: "Equal stars", R1: 26, R2: 22, L1: 1.0, L2: 0.7, a: 90, color1: "#ffdd44", color2: "#ffaa22", orbit: 100 },
  { name: "Giant + dwarf", R1: 36, R2: 12, L1: 1.0, L2: 0.1, a: 80, color1: "#ff8844", color2: "#ffffff", orbit: 120 },
  { name: "Hot + cool", R1: 20, R2: 28, L1: 0.5, L2: 1.0, a: 80, color1: "#aabbff", color2: "#ff6622", orbit: 100 },
];

// Compute overlap area between two circles
function overlapArea(d: number, r1: number, r2: number): number {
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a1 = 2 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const a2 = 2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  return 0.5 * r1 * r1 * (a1 - Math.sin(a1)) + 0.5 * r2 * r2 * (a2 - Math.sin(a2));
}

function lightCurve(phase: number, R1: number, R2: number, L1: number, L2: number, orbit: number, a: number): number {
  const th = 2 * Math.PI * phase;
  const incl = (a * Math.PI) / 180;
  const dx = orbit * Math.cos(th);
  const dy = orbit * Math.sin(th) * Math.cos(incl);
  const d = Math.sqrt(dx * dx + dy * dy);
  const totalLight = L1 * Math.PI * R1 * R1 + L2 * Math.PI * R2 * R2;
  const ov = overlapArea(d, R1, R2);
  const behind = Math.sin(th) > 0; // star 2 behind star 1
  const loss = behind
    ? L2 * ov     // primary eclipse: brighter star in front
    : L1 * ov;    // secondary eclipse: dimmer star in front
  return (totalLight - loss) / totalLight;
}

export default function EclipsingBinaryAnimation({ description }: { description?: string }) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [presetIdx, setPresetIdx] = useState(0);
  const phaseRef = useRef(0);
  const lastT = useRef<number | null>(null);
  const preset = PRESETS[presetIdx];

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        phaseRef.current = (phaseRef.current + (now - lastT.current) / 1000 * 0.08 * speed) % 1;
        setPhase(phaseRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  const { R1, R2, L1, L2, color1, color2, orbit } = preset;
  const th = 2 * Math.PI * phase;
  const incl = (preset.a * Math.PI) / 180;
  const s1x = SCX - orbit * Math.cos(th) * 0.5;
  const s1y = SCY - orbit * Math.sin(th) * Math.cos(incl) * 0.5;
  const s2x = SCX + orbit * Math.cos(th) * 0.5;
  const s2y = SCY + orbit * Math.sin(th) * Math.cos(incl) * 0.5;
  const star2Behind = Math.sin(th) > 0;

  const flux = lightCurve(phase, R1, R2, L1, L2, orbit / 2, preset.a);

  // Pre-compute LC
  const lcPts = Array.from({ length: 360 }, (_, i) => {
    const p = i / 359;
    const f = lightCurve(p, R1, R2, L1, L2, orbit / 2, preset.a);
    return { p, f };
  });
  const lcPath = lcPts.map((d, i) => `${i === 0 ? "M" : "L"}${p2x(d.p).toFixed(1)},${f2y(d.f).toFixed(1)}`).join(" ");

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest block mb-1">
          ⭐ Interactive · Eclipsing Binary Stars
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Two Stars, One Light Curve — Primary &amp; Secondary Eclipses</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Two stars orbit each other. When one passes in front of the other (as seen from Earth), the combined brightness dips. The primary eclipse is deeper — the hotter star is hidden."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          {PRESETS.map((p, i) => (
            <g key={i}>
              <radialGradient id={`eb-s1-${i}`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fff" /><stop offset="40%" stopColor={p.color1} /><stop offset="100%" stopColor="#000" stopOpacity="0.9" />
              </radialGradient>
              <radialGradient id={`eb-s2-${i}`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fff" /><stop offset="40%" stopColor={p.color2} /><stop offset="100%" stopColor="#000" stopOpacity="0.9" />
              </radialGradient>
            </g>
          ))}
        </defs>
        <text x={12} y={13} fill="#30363d" fontSize="8.5" fontFamily="monospace">OBSERVER VIEW (inclination {preset.a}°)</text>
        {/* Orbit ellipse */}
        <ellipse cx={SCX} cy={SCY} rx={orbit / 2} ry={orbit / 2 * Math.abs(Math.cos((preset.a * Math.PI) / 180))}
          fill="none" stroke="#1d2230" strokeWidth="1" strokeDasharray="5,4" />
        {/* Stars (back one first) */}
        {star2Behind ? (
          <>
            <circle cx={s2x} cy={s2y} r={R2} fill={`url(#eb-s2-${presetIdx})`} opacity="0.7" />
            <circle cx={s1x} cy={s1y} r={R1} fill={`url(#eb-s1-${presetIdx})`} />
          </>
        ) : (
          <>
            <circle cx={s1x} cy={s1y} r={R1} fill={`url(#eb-s1-${presetIdx})`} opacity="0.7" />
            <circle cx={s2x} cy={s2y} r={R2} fill={`url(#eb-s2-${presetIdx})`} />
          </>
        )}
        {/* Labels */}
        <text x={12} y={SCY + R1 + 16} fill={color1} fontSize="8" fontFamily="monospace">Star 1 (R={R1})</text>
        <text x={W - 12} y={SCY + R2 + 16} textAnchor="end" fill={color2} fontSize="8" fontFamily="monospace">Star 2 (R={R2})</text>
        {/* LC panel */}
        <rect x={0} y={LC_Y - 2} width={W} height={LC_H + 4} fill="#0b1018" />
        <line x1={0} y1={LC_Y - 2} x2={W} y2={LC_Y - 2} stroke="#1d2230" strokeWidth="1" />
        <text x={12} y={LC_Y + 10} fill="#30363d" fontSize="8.5" fontFamily="monospace">COMBINED LIGHT CURVE</text>
        {[0.8, 0.9, 1.0].map(f => (
          <g key={f}>
            <line x1={PL} y1={f2y(f)} x2={PL + LCW} y2={f2y(f)} stroke="#1d2230" strokeWidth="0.75" />
            <text x={PL - 4} y={f2y(f) + 3.5} textAnchor="end" fill="#484f58" fontSize="7.5" fontFamily="monospace">{f.toFixed(1)}</text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <g key={p}>
            <line x1={p2x(p)} y1={LC_Y + LPT + LCH} x2={p2x(p)} y2={LC_Y + LPT + LCH + 4} stroke="#30363d" />
            <text x={p2x(p)} y={LC_Y + LPT + LCH + 13} textAnchor="middle" fill="#484f58" fontSize="7.5" fontFamily="monospace">{p.toFixed(2)}</text>
          </g>
        ))}
        <path d={lcPath} fill="none" stroke="#58a6ff" strokeWidth="1.8" />
        <line x1={p2x(phase)} y1={LC_Y + LPT} x2={p2x(phase)} y2={LC_Y + LPT + LCH} stroke="#f0883e" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.6" />
        <circle cx={p2x(phase)} cy={f2y(flux)} r={4.5} fill="#f0883e" stroke="#0b1018" strokeWidth="1.5" />
        <text x={PL + LCW / 2} y={H - 5} textAnchor="middle" fill="#8b949e" fontSize="8.5">Orbital Phase</text>
        <text x={PL + LCW - 4} y={LC_Y + LPT + 10} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">F = {flux.toFixed(3)}</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">{playing ? "⏸ Pause" : "▶ Play"}</button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? "bg-[#58a6ff]/20 text-[#58a6ff] border border-[#58a6ff]/30" : "bg-[#21262d] text-[#484f58]"}`}>{s}×</button>
        ))}
        <span className="text-[10px] text-[#484f58] font-mono ml-2">System:</span>
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => { setPresetIdx(i); phaseRef.current = 0; setPhase(0); }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${presetIdx === i ? "bg-[#f0883e]/20 text-[#f0883e] border border-[#f0883e]/30" : "bg-[#21262d] text-[#484f58]"}`}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
