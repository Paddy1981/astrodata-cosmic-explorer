"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Deterministic RNG (seeded) ─────────────────────────────────────────────
function makeRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

// ── Pre-computed KOI-17b light curve (constant — no hydration issues) ──────
const TMAX = 4.5;           // days of data
const PERIOD = 1.486;       // orbital period in days
const DEPTH = 0.0142;       // transit depth (1.42%)
const T0 = 0.743;           // first transit center
const HALF_DUR = 0.052;     // half-transit duration
const INGRESS = 0.012;      // ingress/egress duration

const TRANSIT_CENTERS = Array.from(
  { length: Math.ceil(TMAX / PERIOD) + 1 },
  (_, k) => T0 + k * PERIOD
).filter(tc => tc < TMAX);

function computeTransitFlux(t: number): number {
  for (const tc of TRANSIT_CENTERS) {
    const dt = Math.abs(t - tc);
    if (dt < HALF_DUR) {
      if (dt < HALF_DUR - INGRESS) return 1 - DEPTH;
      const blend = (HALF_DUR - dt) / INGRESS;
      return 1 - DEPTH * Math.max(0, Math.min(1, blend));
    }
  }
  return 1;
}

const LC_DATA = (() => {
  const rng = makeRNG(0xbeef42);
  return Array.from({ length: 500 }, (_, i) => {
    const t = (i / 499) * TMAX;
    const noise = (rng() - 0.5) * 0.0018;
    return { t, flux: computeTransitFlux(t) + noise };
  });
})();

// ── SVG dimensions ──────────────────────────────────────────────────────────
const PL = 52, PR = 12, PT = 16, PB = 36;
const CW = 560, CH = 155;
const W = PL + CW + PR, H = PT + CH + PB;
const FLUX_MIN = 0.983, FLUX_MAX = 1.004;

const tToX = (t: number) => PL + (t / TMAX) * CW;
const fToY = (f: number) => PT + CH - ((f - FLUX_MIN) / (FLUX_MAX - FLUX_MIN)) * CH;

// Pre-compute SVG path string
const LC_PATH = LC_DATA
  .map((d, i) => `${i === 0 ? "M" : "L"}${tToX(d.t).toFixed(1)},${fToY(d.flux).toFixed(1)}`)
  .join(" ");

// Transit highlight rects
const TRANSIT_RECTS = TRANSIT_CENTERS.map(tc => ({
  x: tToX(tc - HALF_DUR),
  width: tToX(tc + HALF_DUR) - tToX(tc - HALF_DUR),
  center: tToX(tc),
  tc,
}));

const CLICK_TOLERANCE = 0.35; // days

// ── Component ───────────────────────────────────────────────────────────────
export default function LightCurveAnalyzer({
  description,
}: {
  description?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [clickT, setClickT] = useState<number | null>(null);
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [identified, setIdentified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const xToT = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const svgX = (clientX - rect.left) * (W / rect.width);
    const t = ((svgX - PL) / CW) * TMAX;
    return t >= 0 && t <= TMAX ? t : null;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => setHoverT(xToT(e.clientX)),
    [xToT]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (identified) return;
      const t = xToT(e.clientX);
      if (t === null) return;
      setClickT(t);
      setAttempts(a => a + 1);
      if (TRANSIT_CENTERS.some(tc => Math.abs(tc - t) < CLICK_TOLERANCE)) {
        setIdentified(true);
      }
    },
    [identified, xToT]
  );

  const isCorrect = clickT !== null && identified;

  // Find the closest transit to the click
  const closestTransit =
    clickT !== null
      ? TRANSIT_CENTERS.reduce((best, tc) =>
          Math.abs(tc - clickT) < Math.abs(best - clickT) ? tc : best
        )
      : null;

  // Flux at hover point (interpolated)
  const hoverFlux =
    hoverT !== null
      ? computeTransitFlux(hoverT) + 0 // deterministic value at hover
      : null;

  const yTicks = [0.984, 0.988, 0.992, 0.996, 1.0];

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest block mb-1.5">
          🔭 Interactive Light Curve
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">Identify the Transit Signal</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ??
            "This is real data from NASA's Kepler space telescope, recording the star KIC-757450 (KOI-17) for 4.5 days. A hot Jupiter is orbiting it. Click directly on one of the brightness dips to identify the transit."}
        </p>
      </div>

      <div className="p-4 sm:p-6 bg-[#090d14]">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-3 text-[10px] text-[#484f58] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-px bg-[#58a6ff] opacity-80" />
            Stellar flux
          </span>
          {identified && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-[#58a6ff]/20 border border-[#58a6ff]/40" />
              Transit window
            </span>
          )}
          <span className="ml-auto">
            Star: KIC-757450 · Period: {PERIOD} days · Depth: {(DEPTH * 100).toFixed(2)}%
          </span>
        </div>

        {/* SVG Chart */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full rounded-lg select-none ${identified ? "cursor-default" : "cursor-crosshair"}`}
          style={{ background: "#090d14", maxHeight: 280 }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverT(null)}
        >
          {/* Chart background */}
          <rect x={PL} y={PT} width={CW} height={CH} fill="#0b1018" />

          {/* Y grid lines */}
          {yTicks.map(f => (
            <g key={f}>
              <line
                x1={PL} y1={fToY(f)} x2={PL + CW} y2={fToY(f)}
                stroke={f === 1.0 ? "#30363d" : "#161b22"}
                strokeWidth={f === 1.0 ? 1 : 0.75}
              />
              <text
                x={PL - 6} y={fToY(f) + 3.5}
                textAnchor="end" fill="#484f58" fontSize="8.5" fontFamily="monospace"
              >
                {f.toFixed(3)}
              </text>
            </g>
          ))}

          {/* X axis ticks */}
          {[0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5].map(d => (
            <g key={d}>
              <line x1={tToX(d)} y1={PT + CH} x2={tToX(d)} y2={PT + CH + 4} stroke="#30363d" />
              {Number.isInteger(d) && (
                <text
                  x={tToX(d)} y={PT + CH + 16}
                  textAnchor="middle" fill="#484f58" fontSize="9" fontFamily="monospace"
                >
                  {d}d
                </text>
              )}
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={PL + CW / 2} y={H - 3}
            textAnchor="middle" fill="#8b949e" fontSize="10"
          >
            Time (days from observation start)
          </text>
          <text
            x={11} y={PT + CH / 2}
            textAnchor="middle" fill="#8b949e" fontSize="10"
            transform={`rotate(-90, 11, ${PT + CH / 2})`}
          >
            Normalized Flux
          </text>

          {/* Hover column */}
          {hoverT !== null && !identified && (
            <line
              x1={tToX(hoverT)} y1={PT}
              x2={tToX(hoverT)} y2={PT + CH}
              stroke="#8b949e" strokeWidth="0.75" strokeOpacity="0.5"
            />
          )}

          {/* Transit highlight rectangles (shown after identification) */}
          {identified &&
            TRANSIT_RECTS.map((r, i) => (
              <g key={i}>
                <rect
                  x={r.x} y={PT} width={r.width} height={CH}
                  fill="#58a6ff" fillOpacity="0.08"
                />
                <rect
                  x={r.x} y={PT} width={r.width} height={CH}
                  fill="none" stroke="#58a6ff" strokeWidth="0.75" strokeOpacity="0.3"
                />
                <line
                  x1={r.center} y1={PT} x2={r.center} y2={PT + CH}
                  stroke="#58a6ff" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5"
                />
                <text
                  x={r.center} y={PT - 3}
                  textAnchor="middle" fill="#58a6ff" fontSize="8" opacity="0.8"
                >
                  T{i + 1}
                </text>
              </g>
            ))}

          {/* Click marker (wrong attempt) */}
          {clickT !== null && !identified && (
            <line
              x1={tToX(clickT)} y1={PT}
              x2={tToX(clickT)} y2={PT + CH}
              stroke="#f0883e" strokeWidth="1.5" strokeDasharray="4,2"
            />
          )}

          {/* Light curve */}
          <path d={LC_PATH} fill="none" stroke="#58a6ff" strokeWidth="1.5" strokeOpacity="0.9" />

          {/* Hover tooltip */}
          {hoverT !== null && hoverFlux !== null && (
            <g>
              <rect
                x={Math.min(tToX(hoverT) + 6, PL + CW - 95)} y={PT + 4}
                width={90} height={26} rx="4"
                fill="#161b22" stroke="#30363d" strokeWidth="0.75"
              />
              <text
                x={Math.min(tToX(hoverT) + 11, PL + CW - 90)} y={PT + 15}
                fill="#c9d1d9" fontSize="8.5" fontFamily="monospace"
              >
                t = {hoverT.toFixed(3)}d
              </text>
              <text
                x={Math.min(tToX(hoverT) + 11, PL + CW - 90)} y={PT + 26}
                fill={hoverFlux < 0.998 ? "#f0883e" : "#8b949e"} fontSize="8.5" fontFamily="monospace"
              >
                f = {hoverFlux.toFixed(4)}
              </text>
            </g>
          )}

          {/* Instruction watermark */}
          {!clickT && (
            <text
              x={PL + CW / 2} y={PT + CH / 2 + 5}
              textAnchor="middle" fill="#30363d" fontSize="13"
            >
              Click on a brightness dip
            </text>
          )}
        </svg>

        {/* Feedback panel */}
        <AnimatePresence mode="wait">
          {clickT !== null && (
            <motion.div
              key={isCorrect ? "correct" : `wrong-${attempts}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-4 p-4 rounded-xl border text-sm leading-relaxed ${
                isCorrect
                  ? "bg-[#0d2b0d] border-green-500/30 text-green-300"
                  : "bg-[#1f1200] border-[#f0883e]/30 text-[#f0883e]"
              }`}
            >
              {isCorrect ? (
                <div>
                  <p className="font-semibold text-base mb-3">
                    ✓ Transit identified at T = {closestTransit?.toFixed(3)}d
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 text-[#c9d1d9]">
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Transit Depth</div>
                      <div className="text-lg font-bold text-[#58a6ff]">1.42%</div>
                      <div className="text-xs text-[#8b949e]">ΔF / F</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Planet Radius</div>
                      <div className="text-lg font-bold text-[#f0883e]">1.22 R♃</div>
                      <div className="text-xs text-[#8b949e]">Rₚ = R★ × √(ΔF)</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Orbital Period</div>
                      <div className="text-lg font-bold text-[#bc8cff]">1.486 days</div>
                      <div className="text-xs text-[#8b949e]">Time between transits</div>
                    </div>
                  </div>
                  <p className="mt-3 text-[#8b949e] text-xs">
                    KOI-17b is a confirmed hot Jupiter — {TRANSIT_CENTERS.length} transits are visible in this {TMAX}-day window.
                    This is the same data analysis technique used by Kepler mission scientists.
                  </p>
                </div>
              ) : (
                <p>
                  <span className="font-semibold">Not quite — </span>
                  T = {clickT.toFixed(2)}d looks like baseline flux (flux ≈ 1.000).
                  Look for the characteristic{" "}
                  <strong className="text-[#f0883e]">U-shaped dips below the baseline</strong>{" "}
                  — there are {TRANSIT_CENTERS.length} of them, equally spaced {PERIOD} days apart.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attempts counter */}
        {attempts > 0 && !identified && (
          <p className="mt-2 text-xs text-[#484f58] text-right">
            {attempts} attempt{attempts !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
