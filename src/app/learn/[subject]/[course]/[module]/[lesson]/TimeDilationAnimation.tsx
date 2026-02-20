"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 310;
const EARTH_X = 100, SHIP_X_BASE = 420;
const CLOCK_Y = 80, CLOCK_W = 100, CLOCK_H = 80;
const TRACK_Y = 220, TRACK_W = W - 60;

export default function TimeDilationAnimation({ description }: { description?: string }) {
  const [beta, setBeta] = useState(0.6); // v/c
  const [earthTime, setEarthTime] = useState(0);
  const [shipTime, setShipTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const earthRef = useRef(0);
  const shipRef = useRef(0);
  const lastT = useRef<number | null>(null);

  const gamma = 1 / Math.sqrt(1 - beta * beta);

  useEffect(() => {
    if (!running) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000 * speed;
        earthRef.current += dt;
        shipRef.current += dt / gamma;
        setEarthTime(earthRef.current);
        setShipTime(shipRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [running, speed, gamma]);

  function reset() {
    earthRef.current = 0; shipRef.current = 0;
    setEarthTime(0); setShipTime(0); setRunning(false);
  }

  // Clock hand angle from time
  const earthAngle = (earthTime % 60) / 60 * 360;
  const shipAngle = (shipTime % 60) / 60 * 360;

  // Spaceship position (moves to the right at v)
  const shipProgress = Math.min(1, earthTime / 20); // travels full track in 20s Earth time
  const shipPx = 30 + shipProgress * (TRACK_W - 20);

  // Light cone / simultaneity lines
  const BETA_PRESETS = [0.1, 0.3, 0.5, 0.6, 0.8, 0.9, 0.99];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🕳️ Interactive · Special Relativity — Time Dilation
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Moving Clocks Run Slow: γ = 1 / √(1 − v²/c²)</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Two clocks — one on Earth, one on a moving spaceship. Press Start and watch the ship's clock tick slower. The faster the ship travels, the greater the time dilation factor γ (gamma)."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Earth clock */}
        <text x={EARTH_X} y={CLOCK_Y - 24} textAnchor="middle" fill="#3fb950" fontSize="10" fontFamily="monospace" fontWeight="bold">🌍 Earth Frame</text>
        <text x={EARTH_X} y={CLOCK_Y - 12} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">v = 0</text>
        <circle cx={EARTH_X} cy={CLOCK_Y + 40} r={38} fill="#0b1018" stroke="#3fb950" strokeWidth="1.5" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
          const rad = (a - 90) * Math.PI / 180;
          const r1 = a % 90 === 0 ? 28 : 32;
          return <line key={a} x1={EARTH_X + r1 * Math.cos(rad)} y1={CLOCK_Y + 40 + r1 * Math.sin(rad)}
            x2={EARTH_X + 36 * Math.cos(rad)} y2={CLOCK_Y + 40 + 36 * Math.sin(rad)}
            stroke="#3fb950" strokeWidth={a % 90 === 0 ? 2 : 0.75} strokeOpacity="0.7" />;
        })}
        {/* Earth clock hand */}
        {(() => {
          const rad = (earthAngle - 90) * Math.PI / 180;
          return <line x1={EARTH_X} y1={CLOCK_Y + 40} x2={EARTH_X + 30 * Math.cos(rad)} y2={CLOCK_Y + 40 + 30 * Math.sin(rad)}
            stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" />;
        })()}
        <text x={EARTH_X} y={CLOCK_Y + 100} textAnchor="middle" fill="#3fb950" fontSize="13" fontFamily="monospace" fontWeight="bold">
          t = {earthTime.toFixed(2)}s
        </text>

        {/* Ship clock */}
        <text x={SHIP_X_BASE} y={CLOCK_Y - 24} textAnchor="middle" fill="#bc8cff" fontSize="10" fontFamily="monospace" fontWeight="bold">🚀 Ship Frame</text>
        <text x={SHIP_X_BASE} y={CLOCK_Y - 12} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">v = {beta.toFixed(2)}c · γ = {gamma.toFixed(3)}</text>
        <circle cx={SHIP_X_BASE} cy={CLOCK_Y + 40} r={38} fill="#0b1018" stroke="#bc8cff" strokeWidth="1.5" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
          const rad = (a - 90) * Math.PI / 180;
          const r1 = a % 90 === 0 ? 28 : 32;
          return <line key={a} x1={SHIP_X_BASE + r1 * Math.cos(rad)} y1={CLOCK_Y + 40 + r1 * Math.sin(rad)}
            x2={SHIP_X_BASE + 36 * Math.cos(rad)} y2={CLOCK_Y + 40 + 36 * Math.sin(rad)}
            stroke="#bc8cff" strokeWidth={a % 90 === 0 ? 2 : 0.75} strokeOpacity="0.7" />;
        })}
        {(() => {
          const rad = (shipAngle - 90) * Math.PI / 180;
          return <line x1={SHIP_X_BASE} y1={CLOCK_Y + 40} x2={SHIP_X_BASE + 30 * Math.cos(rad)} y2={CLOCK_Y + 40 + 30 * Math.sin(rad)}
            stroke="#bc8cff" strokeWidth="2.5" strokeLinecap="round" />;
        })()}
        <text x={SHIP_X_BASE} y={CLOCK_Y + 100} textAnchor="middle" fill="#bc8cff" fontSize="13" fontFamily="monospace" fontWeight="bold">
          τ = {shipTime.toFixed(2)}s
        </text>

        {/* Time difference badge */}
        <rect x={W / 2 - 80} y={CLOCK_Y + 90} width={160} height={22} rx={4} fill="#0b1018" stroke="#f0883e" strokeWidth="0.75" strokeOpacity="0.6" />
        <text x={W / 2} y={CLOCK_Y + 105} textAnchor="middle" fill="#f0883e" fontSize="10" fontFamily="monospace">
          Δt = {(earthTime - shipTime).toFixed(3)}s lost
        </text>

        {/* Spaceship track */}
        <line x1={30} y1={TRACK_Y} x2={30 + TRACK_W} y2={TRACK_Y} stroke="#1d2230" strokeWidth="1.5" />
        <text x={30} y={TRACK_Y - 8} fill="#484f58" fontSize="8" fontFamily="monospace">Earth</text>
        <text x={30 + TRACK_W - 10} y={TRACK_Y - 8} textAnchor="end" fill="#484f58" fontSize="8" fontFamily="monospace">Destination</text>
        <circle cx={30} cy={TRACK_Y} r={6} fill="#3fb950" />
        <circle cx={30 + TRACK_W} cy={TRACK_Y} r={6} fill="#484f58" />
        {/* Spaceship */}
        <g transform={`translate(${shipPx}, ${TRACK_Y})`}>
          <polygon points="-10,0 0,-6 10,0 0,6" fill="#bc8cff" fillOpacity="0.85" />
          <line x1={10} y1={0} x2={10 + beta * 25} y2={0} stroke="#bc8cff" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* γ display */}
        <rect x={W / 2 - 72} y={TRACK_Y + 18} width={144} height={30} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={W / 2} y={TRACK_Y + 30} textAnchor="middle" fill="#484f58" fontSize="8" fontFamily="monospace">Lorentz factor</text>
        <text x={W / 2} y={TRACK_Y + 42} textAnchor="middle" fill="#bc8cff" fontSize="11" fontFamily="monospace" fontWeight="bold">γ = {gamma.toFixed(4)}</text>

        {/* Gamma bar chart */}
        {BETA_PRESETS.map((b, i) => {
          const g = 1 / Math.sqrt(1 - b * b);
          const barH = Math.min(50, (g - 1) * 20);
          const bx = 30 + i * (TRACK_W / 6.5);
          const isActive = Math.abs(b - beta) < 0.06;
          return (
            <g key={b}>
              <rect x={bx - 8} y={TRACK_Y + 58 - barH} width={16} height={barH} rx={2}
                fill={isActive ? "#bc8cff" : "#bc8cff"} fillOpacity={isActive ? 0.9 : 0.3} />
              <text x={bx} y={TRACK_Y + 68} textAnchor="middle" fill={isActive ? "#bc8cff" : "#484f58"} fontSize="7" fontFamily="monospace">{b}c</text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        <button onClick={() => setRunning(r => !r)}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">{running ? "⏸ Pause" : "▶ Start"}</button>
        <button onClick={reset}
          className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs font-medium">↺ Reset</button>
        <span className="text-[10px] text-[#484f58] font-mono">Speed:</span>
        {[0.5, 1, 2, 5].map(s => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${speed === s ? "bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/30" : "bg-[#21262d] text-[#484f58]"}`}>{s}×</button>
        ))}
        <div className="flex items-center gap-2 ml-2 flex-1">
          <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">v/c:</span>
          <input type="range" min={0.01} max={0.999} step={0.01} value={beta}
            onChange={e => { setBeta(parseFloat(e.target.value)); reset(); }}
            className="flex-1 h-1.5" style={{ accentColor: "#bc8cff" }} />
          <span className="text-[10px] font-mono text-[#bc8cff] w-10">{beta.toFixed(2)}c</span>
        </div>
      </div>
    </div>
  );
}
