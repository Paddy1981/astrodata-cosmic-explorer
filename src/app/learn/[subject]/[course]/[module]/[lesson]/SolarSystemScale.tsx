const PLANETS = [
  { name: "Mercury", r: 5,   color: "#9ca3af", cx: 30  },
  { name: "Venus",   r: 9,   color: "#d4a853", cx: 70  },
  { name: "Earth",   r: 10,  color: "#4fa3e0", cx: 115 },
  { name: "Mars",    r: 7,   color: "#ef4444", cx: 157 },
  // frost line gap
  { name: "Jupiter", r: 90,  color: "#c8a97e", cx: 330 },
  { name: "Saturn",  r: 76,  color: "#d4b483", cx: 510 },
  { name: "Uranus",  r: 38,  color: "#67e8f9", cx: 644 },
  { name: "Neptune", r: 36,  color: "#3b82f6", cx: 718 },
];

const BOTTOM = 228;

export default function SolarSystemScale() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5 my-6 overflow-x-auto">
      <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Solar System — Relative Planet Sizes</p>
      <p className="text-xs text-[#484f58] mb-3">Radii approximately to scale · Not orbital distances</p>
      <svg viewBox="0 0 760 290" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[600px]">
        <defs>
          <radialGradient id="jupGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8c98e" />
            <stop offset="100%" stopColor="#9a6a30" />
          </radialGradient>
          <radialGradient id="satGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#e8d498" />
            <stop offset="100%" stopColor="#a07840" />
          </radialGradient>
          <radialGradient id="uraGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
          <radialGradient id="nepGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id="earthGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>
          <radialGradient id="marsGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#b91c1c" />
          </radialGradient>
        </defs>

        {/* Background stars */}
        {[
          [40,15],[90,8],[200,20],[420,12],[500,5],[600,18],[700,10],[750,25],
          [150,35],[350,28],[460,40],[680,32],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#30363d" opacity="0.9" />
        ))}

        {/* Baseline */}
        <line x1="0" y1={BOTTOM} x2="760" y2={BOTTOM} stroke="#21262d" strokeWidth="1" />

        {/* Frost line annotation */}
        <line x1="200" y1="10" x2="200" y2={BOTTOM} stroke="#f7cc4a" strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
        <text x="204" y="22" fill="#f7cc4a" fontSize="8.5" opacity="0.8">frost</text>
        <text x="204" y="33" fill="#f7cc4a" fontSize="8.5" opacity="0.8">line</text>
        <text x="204" y="44" fill="#f7cc4a" fontSize="8.5" opacity="0.8">~2.7 AU</text>

        {/* Inner planets label */}
        <text x="100" y="255" textAnchor="middle" fill="#484f58" fontSize="9">◄ rocky ►</text>
        {/* Outer planets label */}
        <text x="520" y="255" textAnchor="middle" fill="#484f58" fontSize="9">◄ gas / ice giants ►</text>

        {/* Mercury */}
        <circle cx={30} cy={BOTTOM - 5} r={5} fill="#9ca3af" />
        <text x={30} y={BOTTOM + 16} textAnchor="middle" fill="#8b949e" fontSize="9">Mercury</text>
        <text x={30} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">0.38 R⊕</text>

        {/* Venus */}
        <circle cx={70} cy={BOTTOM - 9} r={9} fill="#d4a853" opacity="0.9" />
        <text x={70} y={BOTTOM + 16} textAnchor="middle" fill="#8b949e" fontSize="9">Venus</text>
        <text x={70} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">0.95 R⊕</text>

        {/* Earth */}
        <circle cx={115} cy={BOTTOM - 10} r={10} fill="url(#earthGrad)" />
        <text x={115} y={BOTTOM + 16} textAnchor="middle" fill="#4fa3e0" fontSize="9" fontWeight="600">Earth</text>
        <text x={115} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">1.0 R⊕</text>

        {/* Mars */}
        <circle cx={157} cy={BOTTOM - 7} r={7} fill="url(#marsGrad)" />
        <text x={157} y={BOTTOM + 16} textAnchor="middle" fill="#8b949e" fontSize="9">Mars</text>
        <text x={157} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">0.53 R⊕</text>

        {/* Jupiter */}
        <circle cx={330} cy={BOTTOM - 90} r={90} fill="url(#jupGrad)" opacity="0.9" />
        {/* Jupiter bands */}
        <ellipse cx={330} cy={BOTTOM - 80} rx={70} ry={6} fill="#9a7040" opacity="0.35" />
        <ellipse cx={330} cy={BOTTOM - 100} rx={75} ry={7} fill="#d4b070" opacity="0.3" />
        <ellipse cx={330} cy={BOTTOM - 115} rx={60} ry={5} fill="#9a7040" opacity="0.3" />
        {/* Great Red Spot */}
        <ellipse cx={310} cy={BOTTOM - 78} rx={12} ry={8} fill="#c0503a" opacity="0.7" />
        <text x={330} y={BOTTOM + 16} textAnchor="middle" fill="#c8a97e" fontSize="9" fontWeight="600">Jupiter</text>
        <text x={330} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">11.2 R⊕</text>

        {/* Saturn */}
        <ellipse cx={510} cy={BOTTOM - 76} rx={130} ry={12} fill="#d4b483" opacity="0.25" />
        <ellipse cx={510} cy={BOTTOM - 76} rx={120} ry={10} fill="none" stroke="#c8a070" strokeWidth="3" opacity="0.5" />
        <ellipse cx={510} cy={BOTTOM - 76} rx={108} ry={8} fill="#c8a070" opacity="0.2" />
        <circle cx={510} cy={BOTTOM - 76} r={76} fill="url(#satGrad)" opacity="0.9" />
        {/* Ring overlay (front part) */}
        <ellipse cx={510} cy={BOTTOM - 76} rx={120} ry={10} fill="none" stroke="#c8a070" strokeWidth="2" opacity="0.6" strokeDasharray="189,189" strokeDashoffset="0" />
        <text x={510} y={BOTTOM + 16} textAnchor="middle" fill="#d4b483" fontSize="9" fontWeight="600">Saturn</text>
        <text x={510} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">9.1 R⊕ + rings</text>

        {/* Uranus */}
        <circle cx={644} cy={BOTTOM - 38} r={38} fill="url(#uraGrad)" opacity="0.9" />
        {/* Uranus rings (tilted) */}
        <ellipse cx={644} cy={BOTTOM - 38} rx={50} ry={12} fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.35" transform="rotate(-98 644 190)" />
        <text x={644} y={BOTTOM + 16} textAnchor="middle" fill="#67e8f9" fontSize="9" fontWeight="600">Uranus</text>
        <text x={644} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">3.98 R⊕</text>

        {/* Neptune */}
        <circle cx={718} cy={BOTTOM - 36} r={36} fill="url(#nepGrad)" opacity="0.9" />
        {/* Neptune storm */}
        <ellipse cx={708} cy={BOTTOM - 46} rx={8} ry={5} fill="#1e40af" opacity="0.6" />
        <text x={718} y={BOTTOM + 16} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600">Neptune</text>
        <text x={718} y={BOTTOM + 27} textAnchor="middle" fill="#484f58" fontSize="8">3.86 R⊕</text>

        {/* Sun partial arc (left edge) */}
        <circle cx="-800" cy="114" r="860" fill="none" stroke="#f7cc4a" strokeWidth="3" opacity="0.5" />
        <circle cx="-800" cy="114" r="860" fill="#f7cc4a" opacity="0.04" />
        <text x="6" y="75" fill="#f7cc4a" fontSize="9" opacity="0.8">☀ Sun</text>
        <text x="6" y="88" fill="#8b949e" fontSize="8" opacity="0.7">(109 R⊕)</text>
      </svg>
    </div>
  );
}
