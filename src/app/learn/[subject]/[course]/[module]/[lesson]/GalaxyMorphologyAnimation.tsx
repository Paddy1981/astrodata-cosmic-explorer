"use client";
import { useState } from "react";

const W = 620, H = 310;

const GALAXY_TYPES = [
  {
    id: "E0", name: "Elliptical E0", hubble: "E0",
    color: "#f0c070", description: "Nearly circular. Old stars, little dust or gas. Red/orange colour. Found in galaxy clusters.",
    starCount: 300,
    render: (cx: number, cy: number, r: number) => ({
      type: "elliptical" as const, rx: r, ry: r, angle: 0, cx, cy
    })
  },
  {
    id: "E7", name: "Elliptical E7", hubble: "E7",
    color: "#f0b850", description: "Highly elongated elliptical. Same stellar population as E0 but seen edge-on or intrinsically flat.",
    starCount: 280,
    render: (cx: number, cy: number, r: number) => ({
      type: "elliptical" as const, rx: r, ry: r * 0.3, angle: 15, cx, cy
    })
  },
  {
    id: "Sa", name: "Spiral Sa", hubble: "Sa",
    color: "#88bbff", description: "Tightly wound spiral arms, large central bulge. Mix of old (bulge) and young (arms) stars.",
    starCount: 200,
    render: (cx: number, cy: number, r: number) => ({
      type: "spiral" as const, rx: r, ry: r * 0.4, arms: 2, winding: 4.5, bar: false, cx, cy
    })
  },
  {
    id: "Sc", name: "Spiral Sc", hubble: "Sc",
    color: "#6699ff", description: "Loosely wound, open spiral arms, small bulge. Rich in gas, dust, and new star formation (HII regions).",
    starCount: 220,
    render: (cx: number, cy: number, r: number) => ({
      type: "spiral" as const, rx: r, ry: r * 0.38, arms: 2, winding: 2.5, bar: false, cx, cy
    })
  },
  {
    id: "SBb", name: "Barred Spiral SBb", hubble: "SBb",
    color: "#88ddaa", description: "Central bar of stars with spiral arms emerging from bar ends. ~70% of spirals have bars, including the Milky Way.",
    starCount: 240,
    render: (cx: number, cy: number, r: number) => ({
      type: "spiral" as const, rx: r, ry: r * 0.38, arms: 2, winding: 3, bar: true, cx, cy
    })
  },
  {
    id: "Irr", name: "Irregular", hubble: "Irr",
    color: "#ff8866", description: "No regular structure. Often result of gravitational interaction. Rich in gas and active star formation. (e.g. Magellanic Clouds).",
    starCount: 180,
    render: (cx: number, cy: number, r: number) => ({
      type: "irregular" as const, rx: r, ry: r * 0.75, cx, cy
    })
  },
];

// Pseudo-random seeded
function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export default function GalaxyMorphologyAnimation({ description }: { description?: string }) {
  const [selected, setSelected] = useState(2); // Sa default
  const gt = GALAXY_TYPES[selected];
  const CX = 230, CY = 155;
  const R = 90;
  const info = gt.render(CX, CY, R);
  const rand = rng(42 + selected * 17);

  // Build star positions for this galaxy type
  const stars: Array<{ x: number; y: number; sz: number; op: number; col: string }> = [];

  if (info.type === "elliptical") {
    for (let i = 0; i < gt.starCount; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.pow(rand(), 0.5) * info.rx;
      const yScale = info.ry / info.rx;
      const rad = (info.angle * Math.PI) / 180;
      const lx = rr * Math.cos(a), ly = rr * yScale * Math.sin(a);
      const x = info.cx + lx * Math.cos(rad) - ly * Math.sin(rad);
      const y = info.cy + lx * Math.sin(rad) + ly * Math.cos(rad);
      stars.push({ x, y, sz: 0.6 + rand() * 1.2, op: 0.4 + rand() * 0.5, col: gt.color });
    }
  } else if (info.type === "spiral") {
    const armN = info.arms;
    const bar = info.bar;
    // Bulge
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.pow(rand(), 0.5) * R * 0.25;
      stars.push({ x: info.cx + rr * Math.cos(a), y: info.cy + rr * 0.4 * Math.sin(a), sz: 0.8 + rand() * 0.8, op: 0.7 + rand() * 0.25, col: "#f0c060" });
    }
    // Bar
    if (bar) {
      for (let i = 0; i < 40; i++) {
        const bx = (rand() - 0.5) * R * 0.7;
        const by = (rand() - 0.5) * R * 0.08;
        stars.push({ x: info.cx + bx, y: info.cy + by * 0.4, sz: 0.7, op: 0.6, col: "#f0d090" });
      }
    }
    // Spiral arms
    for (let arm = 0; arm < armN; arm++) {
      const armOffset = (arm / armN) * Math.PI * 2;
      const barEnd = bar ? R * 0.33 : 0;
      for (let i = 0; i < 80; i++) {
        const t = (i / 80);
        const radius = barEnd + t * (R * 0.9 - barEnd);
        const theta = armOffset + t * info.winding * Math.PI;
        const scatter = (rand() - 0.5) * R * 0.12;
        const x = info.cx + (radius + scatter) * Math.cos(theta);
        const y = info.cy + (radius + scatter) * 0.4 * Math.sin(theta);
        const col = t < 0.3 ? "#8899ff" : t < 0.6 ? "#aabbff" : "#ffffff";
        stars.push({ x, y, sz: 0.5 + rand() * 1.3, op: 0.3 + rand() * 0.6, col });
      }
    }
    // Disk haze
    for (let i = 0; i < 50; i++) {
      const a = rand() * Math.PI * 2;
      const rr = rand() * R * 0.85;
      stars.push({ x: info.cx + rr * Math.cos(a), y: info.cy + rr * 0.4 * Math.sin(a), sz: 0.4, op: 0.15 + rand() * 0.2, col: "#aaaaff" });
    }
  } else {
    // Irregular
    for (let i = 0; i < gt.starCount; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.pow(rand(), 0.6) * R * (0.6 + rand() * 0.4);
      stars.push({ x: info.cx + rr * Math.cos(a) * 1.2, y: info.cy + rr * 0.75 * Math.sin(a), sz: 0.5 + rand() * 1.4, op: 0.3 + rand() * 0.6, col: rand() < 0.3 ? "#aaddff" : "#ffbbaa" });
    }
  }

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#f7cc4a] uppercase tracking-widest block mb-1">
          🌌 Interactive · Galaxy Morphology
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">The Hubble Sequence — Galaxy Classification</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "Galaxies come in many shapes — from featureless ellipticals to grand spiral designs. Edwin Hubble's 'tuning fork' diagram classifies them. Select a type to explore its structure and stellar populations."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Galaxy rendering */}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.sz} fill={s.col} fillOpacity={s.op} />
        ))}

        {/* Outer glow ellipse */}
        <ellipse cx={CX} cy={CY}
          rx={info.type === "elliptical" ? info.rx + 10 : R + 10}
          ry={info.type === "elliptical" ? info.ry + 10 : R * 0.4 + 5}
          fill="none" stroke={gt.color} strokeWidth="0.5" strokeOpacity="0.2" />

        {/* Info panel */}
        <rect x={380} y={20} width={220} height={H - 40} rx={5} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={490} y={42} textAnchor="middle" fill={gt.color} fontSize="13" fontFamily="monospace" fontWeight="bold">{gt.name}</text>
        <text x={390} y={60} fill="#484f58" fontSize="7.5" fontFamily="monospace">Hubble type: {gt.hubble}</text>

        {/* Wrapping description */}
        {gt.description.match(/.{1,32}(\s|$)/g)?.slice(0, 6).map((line, i) => (
          <text key={i} x={390} y={80 + i * 14} fill="#8b949e" fontSize="8" fontFamily="monospace">{line.trim()}</text>
        ))}

        {/* Properties */}
        <line x1={390} y1={175} x2={590} y2={175} stroke="#30363d" strokeWidth="0.6" />
        <text x={390} y={190} fill="#484f58" fontSize="7.5" fontFamily="monospace">Star formation:</text>
        <text x={390} y={202} fill={gt.id === "Irr" || gt.id.startsWith("S") ? "#3fb950" : "#f0883e"} fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          {gt.id === "Irr" || gt.id.startsWith("S") ? "Active" : "Quiescent"}
        </text>
        <text x={390} y={218} fill="#484f58" fontSize="7.5" fontFamily="monospace">Dominant stars:</text>
        <text x={390} y={230} fill={gt.color} fontSize="8.5" fontFamily="monospace">
          {gt.id.startsWith("E") ? "Old red giants" : gt.id === "Irr" ? "Mixed" : "Old bulge + blue disk"}
        </text>
        <text x={390} y={248} fill="#484f58" fontSize="7.5" fontFamily="monospace">Example:</text>
        <text x={390} y={260} fill="#8b949e" fontSize="8" fontFamily="monospace">
          {gt.id === "E0" ? "M87 (Virgo A)" : gt.id === "E7" ? "NGC 3115" : gt.id === "Sa" ? "Sombrero M104" : gt.id === "Sc" ? "Pinwheel M101" : gt.id === "SBb" ? "Milky Way" : "Large Magellanic Cloud"}
        </text>

        {/* Hubble sequence indicator */}
        <text x={14} y={H - 14} fill="#30363d" fontSize="8" fontFamily="monospace">← Early type (redder)</text>
        <text x={W / 2 + 20} y={H - 14} fill="#30363d" fontSize="8" fontFamily="monospace">Late type (bluer) →</text>
      </svg>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        {GALAXY_TYPES.map((g, i) => (
          <button key={g.id} onClick={() => setSelected(i)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${selected === i ? "font-bold text-[#0d1117]" : "bg-[#21262d] text-[#8b949e]"}`}
            style={selected === i ? { background: g.color } : {}}>
            {g.id}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[#484f58] font-mono">Hubble tuning-fork sequence</span>
      </div>
    </div>
  );
}
