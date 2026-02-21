export default function StellarLifecycle() {
  const boxStyle = {
    rx: "6",
  };

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#0d1117] p-5 my-6 overflow-x-auto">
      <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest mb-1">Stellar Lifecycle</p>
      <p className="text-xs text-[#484f58] mb-4">From molecular cloud to stellar remnant</p>
      <svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[600px]">
        <defs>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#58a6ff" />
          </marker>
          <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#f0883e" />
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#3fb950" />
          </marker>
          <marker id="arrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#bc8cff" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#f85149" />
          </marker>
        </defs>

        {/* ── TOP ROW: Main path ── */}
        {/* Molecular Cloud */}
        <rect x="5" y="55" width="110" height="52" rx="6" fill="#0d1f33" stroke="#58a6ff" strokeWidth="1.5" />
        <text x="60" y="76" textAnchor="middle" fill="#58a6ff" fontSize="11" fontWeight="700">☁ Nebula</text>
        <text x="60" y="90" textAnchor="middle" fill="#8b949e" fontSize="9">Molecular Cloud</text>
        <text x="60" y="103" textAnchor="middle" fill="#484f58" fontSize="8">10–30 K</text>

        {/* Arrow 1 */}
        <line x1="115" y1="81" x2="148" y2="81" stroke="#58a6ff" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
        <text x="131" y="74" textAnchor="middle" fill="#484f58" fontSize="8">collapse</text>

        {/* Protostar */}
        <rect x="150" y="55" width="110" height="52" rx="6" fill="#1f1200" stroke="#f0883e" strokeWidth="1.5" />
        <text x="205" y="76" textAnchor="middle" fill="#f0883e" fontSize="11" fontWeight="700">🔥 Protostar</text>
        <text x="205" y="90" textAnchor="middle" fill="#8b949e" fontSize="9">Kelvin-Helmholtz</text>
        <text x="205" y="103" textAnchor="middle" fill="#484f58" fontSize="8">T-Tauri Phase</text>

        {/* Arrow 2 */}
        <line x1="260" y1="81" x2="293" y2="81" stroke="#f0883e" strokeWidth="1.5" markerEnd="url(#arrowOrange)" />
        <text x="277" y="74" textAnchor="middle" fill="#484f58" fontSize="8">fusion ignites</text>

        {/* Main Sequence */}
        <rect x="295" y="40" width="130" height="80" rx="6" fill="#071a07" stroke="#3fb950" strokeWidth="2" />
        <text x="360" y="65" textAnchor="middle" fill="#3fb950" fontSize="12" fontWeight="700">⭐ Main Sequence</text>
        <text x="360" y="82" textAnchor="middle" fill="#8b949e" fontSize="9">H → He fusion</text>
        <text x="360" y="96" textAnchor="middle" fill="#484f58" fontSize="8">Hydrostatic equilibrium</text>
        <text x="360" y="110" textAnchor="middle" fill="#484f58" fontSize="8">~10 Gyr (for Sun)</text>

        {/* FORK: Low mass arrow (down-left) */}
        {/* Label */}
        <text x="460" y="57" fill="#8b949e" fontSize="9" fontWeight="600">Low mass</text>
        <text x="460" y="70" fill="#484f58" fontSize="8">(&lt;8 M☉)</text>

        {/* Arrow from MS → Red Giant (down) */}
        <line x1="390" y1="120" x2="390" y2="152" stroke="#f0883e" strokeWidth="1.5" markerEnd="url(#arrowOrange)" />

        {/* High mass label */}
        <text x="460" y="86" fill="#8b949e" fontSize="9" fontWeight="600">High mass</text>
        <text x="460" y="98" fill="#484f58" fontSize="8">(&gt;8 M☉)</text>

        {/* Arrow from MS → Supergiant (right then down) */}
        <line x1="425" y1="80" x2="455" y2="80" stroke="#f85149" strokeWidth="1.5" markerEnd="url(#arrowRed)" />

        {/* ── BOTTOM ROW: Low mass path ── */}
        {/* Red Giant */}
        <rect x="315" y="155" width="150" height="50" rx="6" fill="#2a1200" stroke="#f0883e" strokeWidth="1.5" />
        <text x="390" y="176" textAnchor="middle" fill="#f0883e" fontSize="11" fontWeight="700">🌹 Red Giant</text>
        <text x="390" y="193" textAnchor="middle" fill="#8b949e" fontSize="9">Envelope expands</text>

        {/* Arrow → Planetary Nebula */}
        <line x1="315" y1="180" x2="248" y2="180" stroke="#f0883e" strokeWidth="1.5" markerEnd="url(#arrowOrange)" />

        {/* Planetary Nebula */}
        <rect x="135" y="155" width="112" height="50" rx="6" fill="#0d1f33" stroke="#58a6ff" strokeWidth="1.5" />
        <text x="191" y="176" textAnchor="middle" fill="#58a6ff" fontSize="11" fontWeight="700">💫 PN</text>
        <text x="191" y="192" textAnchor="middle" fill="#8b949e" fontSize="9">Planetary Nebula</text>

        {/* Arrow → White Dwarf */}
        <line x1="135" y1="180" x2="108" y2="180" stroke="#58a6ff" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />

        {/* White Dwarf */}
        <rect x="5" y="155" width="102" height="50" rx="6" fill="#161b22" stroke="#58a6ff" strokeWidth="1.5" />
        <text x="56" y="176" textAnchor="middle" fill="#8b949e" fontSize="11" fontWeight="700">⚪ WD</text>
        <text x="56" y="192" textAnchor="middle" fill="#484f58" fontSize="9">White Dwarf</text>

        {/* ── RIGHT: High mass path ── */}
        {/* Red Supergiant */}
        <rect x="457" y="40" width="130" height="52" rx="6" fill="#2a0800" stroke="#f85149" strokeWidth="1.5" />
        <text x="522" y="62" textAnchor="middle" fill="#f85149" fontSize="11" fontWeight="700">🔴 Supergiant</text>
        <text x="522" y="78" textAnchor="middle" fill="#8b949e" fontSize="9">Shell burning stages</text>

        {/* Arrow → Supernova */}
        <line x1="587" y1="66" x2="620" y2="66" stroke="#f85149" strokeWidth="1.5" markerEnd="url(#arrowRed)" />

        {/* Supernova */}
        <rect x="622" y="40" width="120" height="52" rx="6" fill="#200014" stroke="#f85149" strokeWidth="2" />
        <text x="682" y="60" textAnchor="middle" fill="#f85149" fontSize="12" fontWeight="700">💥 Supernova</text>
        <text x="682" y="76" textAnchor="middle" fill="#8b949e" fontSize="9">Core collapse 0.1s</text>

        {/* Fork: Neutron Star */}
        <line x1="660" y1="92" x2="612" y2="152" stroke="#bc8cff" strokeWidth="1.5" markerEnd="url(#arrowPurple)" />
        <text x="617" y="130" fill="#8b949e" fontSize="8">if M_core</text>
        <text x="617" y="140" fill="#8b949e" fontSize="8">&lt;3 M☉</text>

        {/* Fork: Black Hole */}
        <line x1="710" y1="92" x2="746" y2="152" stroke="#f85149" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
        <text x="720" y="130" fill="#8b949e" fontSize="8">if M_core</text>
        <text x="720" y="140" fill="#8b949e" fontSize="8">&gt;3 M☉</text>

        {/* Neutron Star */}
        <rect x="555" y="155" width="110" height="50" rx="6" fill="#150d2a" stroke="#bc8cff" strokeWidth="1.5" />
        <text x="610" y="175" textAnchor="middle" fill="#bc8cff" fontSize="11" fontWeight="700">💫 NS</text>
        <text x="610" y="191" textAnchor="middle" fill="#8b949e" fontSize="9">Neutron Star</text>

        {/* Black Hole */}
        <rect x="700" y="155" width="112" height="50" rx="6" fill="#0d0014" stroke="#f85149" strokeWidth="1.5" />
        <text x="756" y="175" textAnchor="middle" fill="#f85149" fontSize="11" fontWeight="700">🕳 BH</text>
        <text x="756" y="191" textAnchor="middle" fill="#8b949e" fontSize="9">Black Hole</text>

        {/* Legend */}
        <rect x="5" y="260" width="810" height="50" rx="6" fill="#161b22" stroke="#30363d" strokeWidth="1" />
        <text x="20" y="278" fill="#484f58" fontSize="9" fontWeight="600">LEGEND</text>
        <rect x="20" y="283" width="12" height="2" fill="#3fb950" />
        <text x="36" y="288" fill="#8b949e" fontSize="9">Main sequence (H-fusion)</text>
        <rect x="170" y="283" width="12" height="2" fill="#f0883e" />
        <text x="186" y="288" fill="#8b949e" fontSize="9">Giant phase</text>
        <rect x="285" y="283" width="12" height="2" fill="#f85149" />
        <text x="301" y="288" fill="#8b949e" fontSize="9">Supernova path</text>
        <rect x="410" y="283" width="12" height="2" fill="#bc8cff" />
        <text x="426" y="288" fill="#8b949e" fontSize="9">Neutron star outcome</text>
        <rect x="570" y="283" width="12" height="2" fill="#58a6ff" />
        <text x="586" y="288" fill="#8b949e" fontSize="9">Low-mass remnant</text>
        <text x="20" y="302" fill="#484f58" fontSize="8">The Sun's path: Nebula → Protostar → Main Sequence (now, ~5 Gyr remaining) → Red Giant → Planetary Nebula → White Dwarf</text>
      </svg>
    </div>
  );
}
