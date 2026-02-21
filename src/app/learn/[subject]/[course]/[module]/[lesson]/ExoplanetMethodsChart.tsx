export default function ExoplanetMethodsChart() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5 my-6">
      <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Exoplanet Detection Methods</p>
      <p className="text-xs text-[#484f58] mb-4">Four indirect techniques used to discover worlds around distant stars</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Panel 1: Transit */}
        <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
          <p className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-widest mb-2">① Transit Photometry</p>
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Star */}
            <circle cx="110" cy="48" r="32" fill="#f7cc4a" opacity="0.9" />
            <circle cx="110" cy="48" r="38" fill="none" stroke="#f7cc4a" strokeWidth="2" opacity="0.2" />
            {/* Planet crossing */}
            <circle cx="110" cy="48" r="9" fill="#1a2744" />
            <circle cx="110" cy="48" r="9" fill="none" stroke="#58a6ff" strokeWidth="1.5" opacity="0.7" />
            {/* Light curve */}
            <polyline
              points="10,105 55,105 70,105 80,118 110,120 140,118 150,105 165,105 210,105"
              fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinejoin="round"
            />
            {/* Dip label */}
            <text x="110" y="128" textAnchor="middle" fill="#8b949e" fontSize="8">Transit dip ΔF = (Rₚ/R★)²</text>
            {/* Arrows showing planet motion */}
            <line x1="75" y1="48" x2="95" y2="48" stroke="#58a6ff" strokeWidth="1" opacity="0.5" markerEnd="url(#arrow1)" />
            <defs>
              <marker id="arrow1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#58a6ff" opacity="0.5" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Panel 2: Radial Velocity */}
        <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
          <p className="text-[10px] font-bold text-[#f0883e] uppercase tracking-widest mb-2">② Radial Velocity</p>
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Star wobble path */}
            <ellipse cx="110" cy="55" rx="20" ry="8" fill="none" stroke="#f7cc4a" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
            {/* Star positions */}
            <circle cx="90" cy="55" r="18" fill="#f7cc4a" opacity="0.5" />
            <circle cx="130" cy="55" r="18" fill="#f7cc4a" opacity="0.85" />
            {/* Blueshift / redshift label */}
            <text x="58" y="50" textAnchor="middle" fill="#58a6ff" fontSize="8" fontWeight="600">blue</text>
            <text x="58" y="60" textAnchor="middle" fill="#58a6ff" fontSize="8">← approach</text>
            <text x="162" y="50" textAnchor="middle" fill="#f85149" fontSize="8" fontWeight="600">red</text>
            <text x="162" y="60" textAnchor="middle" fill="#f85149" fontSize="8">recede →</text>
            {/* Planet */}
            <circle cx="110" cy="95" r="7" fill="#3a5a8a" />
            <ellipse cx="110" cy="55" rx="40" ry="40" fill="none" stroke="#30363d" strokeWidth="1" />
            {/* Doppler wave from star */}
            <path d="M 40 75 Q 50 70 60 75 Q 70 80 80 75" fill="none" stroke="#58a6ff" strokeWidth="1.5" opacity="0.7" />
            <path d="M 140 75 Q 150 82 160 75 Q 170 68 180 75" fill="none" stroke="#f85149" strokeWidth="1.5" opacity="0.7" />
            <text x="110" y="125" textAnchor="middle" fill="#8b949e" fontSize="8">Stellar wobble → Doppler shift</text>
          </svg>
        </div>

        {/* Panel 3: Direct Imaging */}
        <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
          <p className="text-[10px] font-bold text-[#3fb950] uppercase tracking-widest mb-2">③ Direct Imaging</p>
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Coronagraph disk */}
            <circle cx="110" cy="55" r="22" fill="#161b22" />
            <circle cx="110" cy="55" r="22" fill="none" stroke="#30363d" strokeWidth="2" />
            <text x="110" y="58" textAnchor="middle" fill="#484f58" fontSize="7">coronagraph</text>
            {/* Blocked starlight rays */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 110 + 22 * Math.cos(rad);
              const y1 = 55 + 22 * Math.sin(rad);
              const x2 = 110 + 35 * Math.cos(rad);
              const y2 = 55 + 35 * Math.sin(rad);
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f7cc4a" strokeWidth="1.5" opacity="0.25" />;
            })}
            {/* Planet dot — visible */}
            <circle cx="155" cy="38" r="6" fill="#6a9fd8" opacity="0.9" />
            <circle cx="155" cy="38" r="10" fill="none" stroke="#58a6ff" strokeWidth="1" opacity="0.4" />
            <text x="168" y="36" fill="#3fb950" fontSize="8" fontWeight="600">planet!</text>
            {/* Label */}
            <text x="110" y="110" textAnchor="middle" fill="#8b949e" fontSize="8">Block star → see nearby planet</text>
            <text x="110" y="122" textAnchor="middle" fill="#484f58" fontSize="7.5">Detects young giant planets</text>
          </svg>
        </div>

        {/* Panel 4: Gravitational Microlensing */}
        <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
          <p className="text-[10px] font-bold text-[#bc8cff] uppercase tracking-widest mb-2">④ Microlensing</p>
          <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" className="w-full">
            {/* Background star */}
            <circle cx="110" cy="55" r="5" fill="white" opacity="0.9" />
            {/* Lens star + planet */}
            <circle cx="110" cy="90" r="12" fill="#f0883e" opacity="0.8" />
            <circle cx="135" cy="84" r="4" fill="#6a9fd8" opacity="0.7" />
            {/* Lensing arcs */}
            <path d="M 80 40 Q 60 55 80 70" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <path d="M 140 40 Q 160 55 140 70" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
            {/* Magnification spike chart */}
            <polyline
              points="10,110 50,110 70,108 85,103 96,92 100,85 105,88 110,95 115,85 120,90 125,102 135,108 155,110 210,110"
              fill="none" stroke="#bc8cff" strokeWidth="2" strokeLinejoin="round"
            />
            {/* Extra spike from planet */}
            <polyline
              points="100,95 103,89 107,82 110,85 113,80 117,88 120,93"
              fill="none" stroke="#bc8cff" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="2,1"
            />
            <text x="110" y="125" textAnchor="middle" fill="#8b949e" fontSize="8">Gravity lens magnifies background star</text>
          </svg>
        </div>
      </div>

      <p className="text-xs text-[#484f58] mt-3 text-center">
        Transit accounts for ~75% of discoveries · Radial velocity ~19% · Direct imaging ~1% · Microlensing ~3%
      </p>
    </div>
  );
}
