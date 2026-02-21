export default function BlackHoleAnatomy() {
  const CX = 340;
  const CY = 165;

  // Zone radii
  const r_EH = 48;          // Event Horizon
  const r_photon = 72;      // Photon Sphere (1.5× EH)
  const r_ISCO = 144;       // ISCO (3× EH)
  const r_disk_outer = 200; // Accretion disk outer edge

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5 my-6">
      <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Black Hole Anatomy</p>
      <p className="text-xs text-[#484f58] mb-3">Cross-section showing key structural zones (not to scale)</p>
      <svg viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <defs>
          <radialGradient id="bhCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="60%" stopColor="#0a0010" />
            <stop offset="100%" stopColor="#1a0a2e" />
          </radialGradient>
          <radialGradient id="diskGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0883e" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f7cc4a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f0883e" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="photonRing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7cc4a" stopOpacity="0" />
            <stop offset="85%" stopColor="#f7cc4a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f7cc4a" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="diskBlur">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Background deep space ── */}
        {[
          [20,20],[60,45],[100,15],[180,30],[250,20],[430,18],[500,40],[560,12],
          [620,30],[660,50],[640,8],[400,50],[80,300],[620,310],[50,280],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1" fill="#30363d" opacity="0.7" />
        ))}

        {/* ── Accretion disk (back half — behind BH) ── */}
        <ellipse cx={CX} cy={CY} rx={r_disk_outer} ry={28} fill="url(#diskGrad)" opacity="0.6" filter="url(#diskBlur)" />
        <ellipse cx={CX} cy={CY} rx={r_disk_outer} ry={28} fill="none" stroke="#f0883e" strokeWidth="1.5" opacity="0.5" />

        {/* ── ISCO zone ── */}
        <circle cx={CX} cy={CY} r={r_ISCO} fill="#0d0a14" stroke="#bc8cff" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" />

        {/* ── Photon sphere ── */}
        <circle cx={CX} cy={CY} r={r_photon} fill="#080612" />
        <circle cx={CX} cy={CY} r={r_photon} fill="none" stroke="#f7cc4a" strokeWidth="2.5" opacity="0.8" filter="url(#glow)" />

        {/* ── Event Horizon ── */}
        <circle cx={CX} cy={CY} r={r_EH} fill="url(#bhCore)" />
        <circle cx={CX} cy={CY} r={r_EH} fill="none" stroke="#f85149" strokeWidth="2" opacity="0.7" />

        {/* ── Singularity ── */}
        <circle cx={CX} cy={CY} r={4} fill="#ffffff" opacity="0.15" />
        <circle cx={CX} cy={CY} r={2} fill="#ffffff" opacity="0.4" />

        {/* ── Accretion disk (front half — in front of BH) ── */}
        {/* Upper front arc */}
        <path
          d={`M ${CX - r_disk_outer} ${CY} A ${r_disk_outer} 28 0 0 1 ${CX + r_disk_outer} ${CY}`}
          fill="url(#diskGrad)"
          opacity="0.7"
          filter="url(#diskBlur)"
        />
        <path
          d={`M ${CX - r_disk_outer} ${CY} A ${r_disk_outer} 28 0 0 1 ${CX + r_disk_outer} ${CY}`}
          fill="none"
          stroke="#f7cc4a"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* ── Relativistic Jets ── */}
        {/* Top jet */}
        <line x1={CX} y1={CY - r_EH - 5} x2={CX} y2="10" stroke="#58a6ff" strokeWidth="2.5" opacity="0.7" />
        <path d={`M ${CX - 30} 10 L ${CX} -10 L ${CX + 30} 10`} fill="none" stroke="#58a6ff" strokeWidth="2" opacity="0.5" />
        {/* Jet cone */}
        <path d={`M ${CX - 4} ${CY - r_EH} L ${CX - 25} 30 L ${CX + 25} 30 L ${CX + 4} ${CY - r_EH} Z`}
          fill="#58a6ff" opacity="0.08" />
        {/* Bottom jet */}
        <line x1={CX} y1={CY + r_EH + 5} x2={CX} y2="330" stroke="#58a6ff" strokeWidth="2.5" opacity="0.7" />
        <path d={`M ${CX - 30} 330 L ${CX} 350 L ${CX + 30} 330`} fill="none" stroke="#58a6ff" strokeWidth="2" opacity="0.5" />
        <path d={`M ${CX - 4} ${CY + r_EH} L ${CX - 25} 300 L ${CX + 25} 300 L ${CX + 4} ${CY + r_EH} Z`}
          fill="#58a6ff" opacity="0.08" />

        {/* ── Labels (right side) ── */}
        {/* Singularity label */}
        <line x1={CX + 4} y1={CY} x2={CX + r_EH + 45} y2={CY - 10} stroke="#484f58" strokeWidth="1" />
        <text x={CX + r_EH + 48} y={CY - 5} fill="#c9d1d9" fontSize="11" fontWeight="600">Singularity</text>
        <text x={CX + r_EH + 48} y={CY + 9} fill="#484f58" fontSize="9">infinite density (r = 0)</text>

        {/* Event Horizon label */}
        <line x1={CX + r_EH} y1={CY - 30} x2={CX + r_EH + 45} y2={CY - 55} stroke="#f85149" strokeWidth="1" />
        <text x={CX + r_EH + 48} y={CY - 50} fill="#f85149" fontSize="11" fontWeight="600">Event Horizon</text>
        <text x={CX + r_EH + 48} y={CY - 36} fill="#484f58" fontSize="9">r_s = 2GM/c² (point of no return)</text>

        {/* Photon Sphere label */}
        <line x1={CX + r_photon} y1={CY - 45} x2={CX + r_photon + 30} y2={CY - 75} stroke="#f7cc4a" strokeWidth="1" />
        <text x={CX + r_photon + 33} y={CY - 70} fill="#f7cc4a" fontSize="11" fontWeight="600">Photon Sphere</text>
        <text x={CX + r_photon + 33} y={CY - 56} fill="#484f58" fontSize="9">r = 1.5 r_s — light orbits here</text>

        {/* ISCO label */}
        <line x1={CX + r_ISCO} y1={CY - 30} x2={CX + r_ISCO + 20} y2={CY - 60} stroke="#bc8cff" strokeWidth="1" />
        <text x={CX + r_ISCO + 23} y={CY - 55} fill="#bc8cff" fontSize="11" fontWeight="600">ISCO</text>
        <text x={CX + r_ISCO + 23} y={CY - 41} fill="#484f58" fontSize="9">r = 3 r_s — innermost stable orbit</text>

        {/* Accretion disk label */}
        <line x1={CX - 5} y1={CY + 24} x2={CX - 5} y2={CY + 65} stroke="#f0883e" strokeWidth="1" />
        <text x={CX - 5} y={CY + 80} textAnchor="middle" fill="#f0883e" fontSize="11" fontWeight="600">Accretion Disk</text>
        <text x={CX - 5} y={CY + 94} textAnchor="middle" fill="#484f58" fontSize="9">10⁶–10⁷ K · X-ray emitter</text>

        {/* Jet labels */}
        <text x={CX + 30} y="30" fill="#58a6ff" fontSize="11" fontWeight="600">Relativistic Jet</text>
        <text x={CX + 30} y="44" fill="#484f58" fontSize="9">~c · Blandford-Znajek</text>
        <text x={CX + 30} y="312" fill="#58a6ff" fontSize="11" fontWeight="600">Relativistic Jet</text>
        <text x={CX + 30} y="326" fill="#484f58" fontSize="9">perpendicular to disk</text>
      </svg>
    </div>
  );
}
