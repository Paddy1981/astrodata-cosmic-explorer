"use client";
import { useRef, useState, useEffect } from "react";

const W = 620, H = 300;
const CX = W / 2, CY = H / 2 + 10;
const BH_R = 20;

// Disk ring data: radius, speed, doppler color
const RINGS = [
  { r: 28,  omega: 1.80, label: "ISCO" },
  { r: 38,  omega: 1.20 },
  { r: 52,  omega: 0.80 },
  { r: 68,  omega: 0.55 },
  { r: 86,  omega: 0.38 },
  { r: 106, omega: 0.26 },
  { r: 128, omega: 0.18 },
  { r: 152, omega: 0.12 },
];

// Doppler: approaching side (left) = blue, receding (right) = red
function dopplerColor(angle: number, r: number): string {
  // cos(angle) = 1 means right (receding), -1 means left (approaching)
  const v = Math.cos(angle); // +1 = receding, -1 = approaching
  // Map to temperature gradient of accretion disk
  const innerHot = Math.max(0, 1 - r / 160); // hotter closer to BH
  const R = Math.min(255, Math.round(220 + v * 35 + innerHot * 60));
  const G = Math.min(255, Math.round(80 - v * 40 + innerHot * 40));
  const B = Math.min(255, Math.round(20 - v * 20));
  return `rgb(${R},${G},${B})`;
}

function ringEllipsePath(r: number, n = 200) {
  const ry = r * 0.28; // disk inclination ~75°
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * 2 * Math.PI;
    const x = CX + r * Math.cos(angle);
    const y = CY + ry * Math.sin(angle);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + "Z";
}

export default function AccretionDiskAnimation({ description }: { description?: string }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const tRef = useRef(0);
  const lastT = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastT.current = null; return; }
    let id: number;
    const loop = (now: number) => {
      if (lastT.current !== null) {
        const dt = (now - lastT.current) / 1000;
        tRef.current += dt * speed * 0.4;
        setT(tRef.current);
      }
      lastT.current = now;
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(id); lastT.current = null; };
  }, [playing, speed]);

  // Jet height animation (pulsing)
  const jetH = 85 + Math.sin(t * 2.5) * 15;

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest block mb-1">
          🕳️ Interactive · Accretion Disk
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Spinning Accretion Disk — Doppler Shift &amp; Relativistic Jets</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "The left side of the disk rotates toward us (blueshifted — hotter colours); the right side rotates away (redshifted). Relativistic jets emerge perpendicular to the disk plane."}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#050608", display: "block" }}>
        <defs>
          <radialGradient id="ad-bh" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#000000" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="ad-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Polar jets */}
        <line x1={CX} y1={CY - BH_R - 2} x2={CX} y2={CY - BH_R - jetH}
          stroke="#88ccff" strokeWidth="3" strokeOpacity="0.7" />
        <line x1={CX} y1={CY + BH_R + 2} x2={CX} y2={CY + BH_R + jetH}
          stroke="#88ccff" strokeWidth="3" strokeOpacity="0.7" />
        {/* Jet widening */}
        <path d={`M ${CX - 3} ${CY - BH_R - 2} L ${CX - jetH * 0.25} ${CY - BH_R - jetH} L ${CX + jetH * 0.25} ${CY - BH_R - jetH} L ${CX + 3} ${CY - BH_R - 2}`}
          fill="#88ccff" fillOpacity="0.12" />
        <path d={`M ${CX - 3} ${CY + BH_R + 2} L ${CX - jetH * 0.25} ${CY + BH_R + jetH} L ${CX + jetH * 0.25} ${CY + BH_R + jetH} L ${CX + 3} ${CY + BH_R + 2}`}
          fill="#88ccff" fillOpacity="0.12" />
        {/* Jet knots */}
        {[0.3, 0.6, 0.9].map((f, i) => (
          <g key={i}>
            <circle cx={CX} cy={CY - BH_R - jetH * f - ((t * 30 * f) % (jetH * 0.4))}
              r={3 - f} fill="#aaddff" fillOpacity={0.6 - f * 0.2} />
            <circle cx={CX} cy={CY + BH_R + jetH * f + ((t * 30 * f) % (jetH * 0.4))}
              r={3 - f} fill="#aaddff" fillOpacity={0.6 - f * 0.2} />
          </g>
        ))}

        {/* Disk rings (back — y > 0) */}
        {RINGS.slice().reverse().map((ring, ri) => {
          const angle = (t * ring.omega) % (2 * Math.PI);
          const ry = ring.r * 0.28;
          // Draw the ring as coloured segments
          const N = 120;
          const segments = Array.from({ length: N }, (_, i) => {
            const a0 = (i / N) * 2 * Math.PI + angle;
            const a1 = ((i + 1) / N) * 2 * Math.PI + angle;
            const x0 = CX + ring.r * Math.cos(a0), y0 = CY + ry * Math.sin(a0);
            const x1 = CX + ring.r * Math.cos(a1), y1 = CY + ry * Math.sin(a1);
            const col = dopplerColor(a0 + angle, ring.r);
            const opacity = Math.sin(a0) < 0 ? 0.0 : 0.85; // only draw back half (behind BH)
            if (opacity === 0) return null;
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={col} strokeWidth="3" strokeOpacity={0.55} />;
          });
          return <g key={ri}>{segments}</g>;
        })}

        {/* Black hole disk */}
        <ellipse cx={CX} cy={CY} rx={BH_R + 5} ry={(BH_R + 5) * 0.28} fill="#000" />
        <circle cx={CX} cy={CY} r={BH_R} fill="#000" />
        <circle cx={CX} cy={CY} r={BH_R} fill="none" stroke="#bc8cff" strokeWidth="0.75" strokeOpacity="0.5" strokeDasharray="3,4" />

        {/* Disk rings (front — y > 0 in orbital coords means front) */}
        {RINGS.map((ring, ri) => {
          const angle = (t * ring.omega) % (2 * Math.PI);
          const ry = ring.r * 0.28;
          const N = 120;
          const segments = Array.from({ length: N }, (_, i) => {
            const a0 = (i / N) * 2 * Math.PI + angle;
            const a1 = ((i + 1) / N) * 2 * Math.PI + angle;
            const x0 = CX + ring.r * Math.cos(a0), y0 = CY + ry * Math.sin(a0);
            const x1 = CX + ring.r * Math.cos(a1), y1 = CY + ry * Math.sin(a1);
            const col = dopplerColor(a0 + angle, ring.r);
            if (Math.sin(a0) >= 0) return null; // only front half
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={col} strokeWidth="3" strokeOpacity={0.8} />;
          });
          return <g key={ri}>{segments}</g>;
        })}

        {/* Doppler legend */}
        <rect x={8} y={8} width={168} height={54} rx={5} fill="#050608" stroke="#30363d" strokeWidth="0.75" />
        <text x={18} y={22} fill="#88ccff" fontSize="9" fontFamily="monospace">← Approaching (blueshift)</text>
        <text x={18} y={34} fill="#ff4400" fontSize="9" fontFamily="monospace">Receding (redshift) →</text>
        <text x={18} y={46} fill="#484f58" fontSize="7.5" fontFamily="monospace">ISCO = innermost stable orbit</text>
        <text x={18} y={56} fill="#88ccff" fontSize="7.5" fontFamily="monospace">↑ Relativistic jets (c-scale)</text>

        {/* ISCO label */}
        {RINGS[0].label && (
          <text x={CX + RINGS[0].r + 6} y={CY + 3} fill="#484f58" fontSize="7.5" fontFamily="monospace">{RINGS[0].label}</text>
        )}
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
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">v_ISCO ≈ 0.5c · T_max ≈ 10⁷ K</span>
      </div>
    </div>
  );
}
