export default function PlanetSizeScale() {
  const planets = [
    { name: "Earth", radius: "1 R⊕", cx: 55, cy: 247, r: 15, color: "#4fa3e0", glow: "#4fa3e040" },
    { name: "Neptune", radius: "3.9 R⊕", cx: 175, cy: 220, r: 42, color: "#5b8de8", glow: "#5b8de830" },
    { name: "Jupiter", radius: "11.2 R⊕", cx: 395, cy: 152, r: 110, color: "#c8a97e", glow: "#c8a97e25" },
  ];

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5 my-6 overflow-hidden">
      <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Planet Size Comparison</p>
      <p className="text-xs text-[#484f58] mb-3">Relative radii — Earth = 1 R⊕</p>
      <svg viewBox="0 0 700 290" xmlns="http://www.w3.org/2000/svg" className="w-full">
        {/* Background stars */}
        {[
          [20, 30], [80, 15], [140, 45], [250, 20], [320, 55], [480, 15], [560, 40], [630, 25], [690, 50],
          [30, 80], [110, 100], [200, 70], [600, 80], [660, 110],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#30363d" opacity="0.8" />
        ))}

        {/* Grid baseline */}
        <line x1="0" y1="262" x2="700" y2="262" stroke="#21262d" strokeWidth="1" />

        {/* Sun — large golden arc on the right (partial circle, radius=390, center off-right) */}
        <defs>
          <radialGradient id="sunGrad" cx="100%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#f7cc4a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f0883e" stopOpacity="0.05" />
          </radialGradient>
          <clipPath id="svgBounds">
            <rect x="0" y="0" width="700" height="290" />
          </clipPath>
        </defs>

        <g clipPath="url(#svgBounds)">
          {/* Sun circle: cx=1060, cy=131, r=395 — only left arc visible */}
          <circle cx="1060" cy="131" r="395" fill="url(#sunGrad)" />
          <circle cx="1060" cy="131" r="395" fill="none" stroke="#f7cc4a" strokeWidth="2" opacity="0.7" />
          {/* Sun glow halo */}
          <circle cx="1060" cy="131" r="395" fill="none" stroke="#f7cc4a" strokeWidth="8" opacity="0.12" />
        </g>

        {/* Sun label */}
        <text x="682" y="32" textAnchor="end" fill="#f7cc4a" fontSize="11" fontWeight="600">☀ Sun</text>
        <text x="682" y="48" textAnchor="end" fill="#8b949e" fontSize="10">109 R⊕</text>

        {/* Planets */}
        {planets.map((p) => (
          <g key={p.name}>
            {/* Glow */}
            <circle cx={p.cx} cy={p.cy} r={p.r + 8} fill={p.glow} />
            {/* Planet */}
            <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.color} opacity="0.85" />
            {/* Atmosphere shimmer */}
            <circle cx={p.cx} cy={p.cy} r={p.r} fill="none" stroke={p.color} strokeWidth="2" opacity="0.5" />
            {/* Name label */}
            <text x={p.cx} y={p.cy + p.r + 18} textAnchor="middle" fill="#e6edf3" fontSize="11" fontWeight="600">{p.name}</text>
            <text x={p.cx} y={p.cy + p.r + 32} textAnchor="middle" fill="#8b949e" fontSize="10">{p.radius}</text>
          </g>
        ))}

        {/* Earth details — blue swirls */}
        <circle cx="55" cy="244" r="4" fill="#1a73e8" opacity="0.6" />
        <circle cx="60" cy="250" r="3" fill="#3a8fd0" opacity="0.5" />

        {/* Neptune bands */}
        <ellipse cx="175" cy="218" rx="30" ry="4" fill="#4a7fd4" opacity="0.4" />
        <ellipse cx="175" cy="226" rx="28" ry="3" fill="#3a6fbe" opacity="0.3" />

        {/* Jupiter bands */}
        <ellipse cx="395" cy="140" rx="80" ry="8" fill="#b89060" opacity="0.5" />
        <ellipse cx="395" cy="158" rx="85" ry="6" fill="#d4a870" opacity="0.4" />
        <ellipse cx="395" cy="172" rx="78" ry="5" fill="#b07050" opacity="0.35" />

        {/* Size indicator line */}
        <line x1="20" y1="268" x2="680" y2="268" stroke="#21262d" strokeWidth="1" strokeDasharray="3,3" />
        <text x="340" y="280" textAnchor="middle" fill="#484f58" fontSize="9">← not drawn to scale — sun would be ~40× wider than shown →</text>
      </svg>
    </div>
  );
}
