"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 320;
const CX = W / 2, CY = H / 2 - 10;
const SUN_R = 18;

// Kepler ellipse: a = semi-major, e = eccentricity
const DEFAULT_A = 130;
const DEFAULT_E = 0.5;

function ellipsePos(angle: number, a: number, e: number) {
  const b = a * Math.sqrt(1 - e * e);
  const focus = a * e;
  // position relative to focus (sun)
  const r = a * (1 - e * e) / (1 + e * Math.cos(angle));
  return { x: CX - focus + r * Math.cos(angle), y: CY + r * Math.sin(angle), r };
}

function ellipsePath(a: number, e: number) {
  const b = a * Math.sqrt(1 - e * e);
  const focus = a * e;
  return `M ${CX - focus - a} ${CY} A ${a} ${b} 0 0 0 ${CX - focus + a} ${CY} A ${a} ${b} 0 0 0 ${CX - focus - a} ${CY}`;
}

// Build path for swept area sector
function sweptAreaPath(angle0: number, dAngle: number, a: number, e: number, steps = 40) {
  const pts: string[] = [];
  pts.push(`M ${CX - a * e} ${CY}`);
  for (let i = 0; i <= steps; i++) {
    const th = angle0 + (dAngle * i) / steps;
    const p = ellipsePos(th, a, e);
    pts.push(`L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

// Angular speed ∝ 1/r² (Kepler's 2nd law)
function angularSpeed(r: number, a: number) {
  return (a * a) / (r * r * 8); // normalised
}

export default function OrbitalMechanicsAnimation({ description }: { description?: string }) {
  const [ecc, setEcc] = useState(DEFAULT_E);
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const angleRef = useRef(0);
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const a = DEFAULT_A;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        const { r } = ellipsePos(angleRef.current, a, ecc);
        const omega = angularSpeed(r, a) * speed;
        angleRef.current = (angleRef.current + dt * omega) % (2 * Math.PI);
        setAngle(angleRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed, ecc]);

  const a = DEFAULT_A;
  const pos = ellipsePos(angle, a, ecc);
  const { r } = pos;
  const v = Math.sqrt(1 / r) * 80; // visual speed indicator
  const b = a * Math.sqrt(1 - ecc * ecc);
  const focus = a * ecc;
  const period2 = (a / 100) ** 3; // P² ∝ a³ (normalised, a in AU equiv)
  const period = Math.sqrt(period2).toFixed(2);

  // Swept area sector (past ~0.4 rad)
  const sweptAngle0 = angle - 0.45;
  const areaPath = sweptAreaPath(sweptAngle0, 0.45, a, ecc);

  // Aphelion / perihelion labels
  const aph = ellipsePos(Math.PI, a, ecc);
  const per = ellipsePos(0, a, ecc);

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f7cc4a] uppercase tracking-widest block mb-1">
          ☀️ Interactive · Kepler&apos;s Laws of Orbital Motion
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Kepler&apos;s Second Law — Equal Areas in Equal Times</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "The shaded sector shows the area swept in a fixed time interval. Drag the eccentricity slider to change the orbit shape — the planet speeds up near the star and slows down far away."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        <defs>
          <radialGradient id="om-sun" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff7d0" />
            <stop offset="50%" stopColor="#ffb030" />
            <stop offset="100%" stopColor="#e05000" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="om-planet" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ab0ff" />
            <stop offset="100%" stopColor="#07090e" />
          </radialGradient>
          <radialGradient id="om-sunglow" cx="50%" cy="50%" r="50%">
            <stop offset="40%" stopColor="#ff9900" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit ellipse */}
        <ellipse cx={CX - focus} cy={CY} rx={a} ry={b}
          fill="none" stroke="#1d2230" strokeWidth="1" strokeDasharray="6,4" />

        {/* Empty focus marker */}
        <circle cx={CX + focus} cy={CY} r={2.5} fill="#30363d" />
        <text x={CX + focus + 6} y={CY + 3} fill="#30363d" fontSize="8" fontFamily="monospace">F₂</text>

        {/* Aphelion / Perihelion labels */}
        <text x={aph.x - 12} y={aph.y + 18} fill="#30363d" fontSize="8" fontFamily="monospace" textAnchor="middle">aphelion</text>
        <text x={per.x + 6} y={per.y + 18} fill="#30363d" fontSize="8" fontFamily="monospace">perihelion</text>

        {/* Swept area */}
        <path d={areaPath} fill="#58a6ff" fillOpacity="0.12" stroke="#58a6ff" strokeWidth="0.75" strokeOpacity="0.4" />

        {/* Sun glow + disk */}
        <circle cx={CX - focus} cy={CY} r={SUN_R * 3.5} fill="url(#om-sunglow)" />
        <circle cx={CX - focus} cy={CY} r={SUN_R} fill="url(#om-sun)" />

        {/* Line from sun to planet */}
        <line x1={CX - focus} y1={CY} x2={pos.x} y2={pos.y}
          stroke="#58a6ff" strokeWidth="0.75" strokeDasharray="3,2" strokeOpacity="0.5" />

        {/* Planet */}
        <circle cx={pos.x} cy={pos.y} r={9} fill="url(#om-planet)" />

        {/* Velocity arrow */}
        {(() => {
          const vLen = Math.min(v, 50);
          const vAngle = angle + Math.PI / 2; // perpendicular to radius (approx)
          const vx = pos.x + Math.cos(vAngle) * vLen;
          const vy = pos.y + Math.sin(vAngle) * vLen;
          return (
            <>
              <line x1={pos.x} y1={pos.y} x2={vx} y2={vy}
                stroke="#3fb950" strokeWidth="1.5" strokeOpacity="0.8" />
              <circle cx={vx} cy={vy} r={2.5} fill="#3fb950" fillOpacity="0.8" />
            </>
          );
        })()}

        {/* Stats box */}
        <rect x={8} y={8} width={162} height={84} rx={6} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={24} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Orbital radius r</text>
        <text x={16} y={39} fill="#e6edf3" fontSize="14" fontFamily="monospace" fontWeight="bold">{r.toFixed(0)} px</text>
        <text x={16} y={54} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Period (P² ∝ a³)</text>
        <text x={16} y={69} fill="#f7cc4a" fontSize="14" fontFamily="monospace" fontWeight="bold">{period} yr</text>
        <text x={16} y={82} fill="#484f58" fontSize="7.5" fontFamily="monospace">e = {ecc.toFixed(2)}</text>

        {/* Kepler 2nd law label */}
        <rect x={W - 190} y={8} width={182} height={46} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={W - 182} y={23} fill="#58a6ff" fontSize="8" fontFamily="monospace">Equal areas in equal times</text>
        <text x={W - 182} y={36} fill="#484f58" fontSize="8" fontFamily="monospace">Shaded = area swept now</text>
        <text x={W - 182} y={47} fill="#3fb950" fontSize="8" fontFamily="monospace">Arrow = velocity direction</text>
      </svg>

      <div className="flex items-center gap-4 px-5 py-3 bg-[#161b22] border-t border-[#30363d]">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={() => { angleRef.current = 0; setAngle(0); setPlaying(false); }}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium transition-colors">
          ↺ Reset
        </button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${speed === s
              ? "bg-[#f7cc4a]/20 text-[#f7cc4a] border border-[#f7cc4a]/30"
              : "bg-[#21262d] text-[#484f58] hover:text-[#8b949e]"}`}>
            {s}×
          </button>
        ))}
        <div className="flex items-center gap-2 ml-4 flex-1">
          <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">Eccentricity e:</span>
          <input type="range" min={0.01} max={0.85} step={0.01} value={ecc}
            onChange={e => setEcc(parseFloat(e.target.value))}
            className="flex-1 h-1.5" style={{ accentColor: "#f7cc4a" }} />
          <span className="text-[10px] font-mono text-[#f7cc4a] w-8">{ecc.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
