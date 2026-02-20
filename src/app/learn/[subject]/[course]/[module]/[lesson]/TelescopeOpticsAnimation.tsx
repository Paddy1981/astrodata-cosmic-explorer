"use client";
import { useState } from "react";

const W = 620, H = 310;
const CX = W / 2, CY = H / 2 + 10;

const DESIGNS = [
  {
    id: "refractor", name: "Refractor", color: "#58a6ff",
    description: "Light passes through a glass objective lens. Chromatic aberration limits large apertures. Best for planets & double stars.",
    example: "Yerkes 40\" (1897)",
  },
  {
    id: "newtonian", name: "Newtonian Reflector", color: "#3fb950",
    description: "Parabolic primary mirror + flat secondary. No chromatic aberration. Simple, affordable. Used by amateurs worldwide.",
    example: "Herschel 48\" (1789)",
  },
  {
    id: "cassegrain", name: "Cassegrain", color: "#f0883e",
    description: "Parabolic primary + convex secondary folds the light path. Long effective focal length, compact tube. Basis of most modern telescopes.",
    example: "Hubble Space Telescope (2.4 m)",
  },
  {
    id: "radio", name: "Radio Dish", color: "#bc8cff",
    description: "Large parabolic dish reflects radio waves to a central feed horn. Aperture synthesis (arrays) creates virtual giant telescopes.",
    example: "FAST 500 m, VLA 27×25 m",
  },
];

export default function TelescopeOpticsAnimation({ description }: { description?: string }) {
  const [design, setDesign] = useState(0);
  const [aperture, setAperture] = useState(200); // mm
  const [focalRatio, setFocalRatio] = useState(8); // f/number

  const d = DESIGNS[design];
  const focalLength = aperture * focalRatio; // mm
  const lightGather = Math.pow(aperture / 7, 2); // relative to 7mm eye (dark-adapted)
  // Rayleigh limit in arcsec: θ = 1.22 λ / D, λ=550nm
  const rayleigh = (1.22 * 550e-9 / (aperture * 1e-3)) * (180 / Math.PI) * 3600; // arcsec
  const magnification = focalLength / 25; // with 25mm eyepiece

  const col = d.color;
  const scaleD = Math.min(90, aperture / 3);

  // Draw telescope schematic
  const drawTelescope = () => {
    if (design === 0) {
      // Refractor: tube with objective lens at left, eyepiece at right
      return (
        <g>
          {/* Tube */}
          <rect x={CX - 140} y={CY - scaleD / 2} width={280} height={scaleD} rx={4}
            fill="#0b1018" stroke={col} strokeWidth="1.2" />
          {/* Objective lens */}
          <ellipse cx={CX - 140} cy={CY} rx={8} ry={scaleD / 2} fill={col} fillOpacity="0.3" stroke={col} strokeWidth="1.5" />
          {/* Eyepiece */}
          <rect x={CX + 132} y={CY - 10} width={20} height={20} fill="#0b1018" stroke={col} strokeWidth="1.2" />
          {/* Light rays */}
          {[-1, 0, 1].map(i => (
            <line key={i} x1={CX - 190} y1={CY + i * scaleD * 0.45}
              x2={CX - 140} y2={CY + i * scaleD * 0.45}
              stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          ))}
          <line x1={CX - 140} y1={CY - scaleD * 0.45} x2={CX + 70} y2={CY} stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1={CX - 140} y1={CY + scaleD * 0.45} x2={CX + 70} y2={CY} stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          <text x={CX - 140} y={CY - scaleD / 2 - 8} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Objective lens</text>
          <text x={CX + 150} y={CY - scaleD / 2 - 8} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Eyepiece</text>
        </g>
      );
    } else if (design === 1) {
      // Newtonian: tube, primary parabola, flat secondary, eyepiece at side
      return (
        <g>
          <rect x={CX - 130} y={CY - scaleD / 2} width={260} height={scaleD} rx={4}
            fill="#0b1018" stroke={col} strokeWidth="1.2" />
          {/* Primary mirror */}
          <path d={`M ${CX + 120} ${CY - scaleD / 2} Q ${CX + 145} ${CY} ${CX + 120} ${CY + scaleD / 2}`}
            fill="none" stroke={col} strokeWidth="2" />
          {/* Flat secondary */}
          <line x1={CX - 20} y1={CY - 15} x2={CX + 10} y2={CY + 15} stroke={col} strokeWidth="2" />
          {/* Eyepiece on side */}
          <rect x={CX - 26} y={CY - scaleD / 2 - 20} width={14} height={20} fill="#0b1018" stroke={col} strokeWidth="1.2" />
          {/* Light rays */}
          {[-1, 1].map(i => (
            <g key={i}>
              <line x1={CX - 180} y1={CY + i * scaleD * 0.45} x2={CX + 120} y2={CY + i * scaleD * 0.45}
                stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1={CX + 120} y1={CY + i * scaleD * 0.45} x2={CX - 10} y2={CY}
                stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
            </g>
          ))}
          <line x1={CX - 10} y1={CY} x2={CX - 19} y2={CY - scaleD / 2 - 10} stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          <text x={CX + 130} y={CY - scaleD / 2 - 8} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Primary mirror</text>
          <text x={CX - 15} y={CY - scaleD / 2 - 28} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Eyepiece</text>
        </g>
      );
    } else if (design === 2) {
      // Cassegrain: primary concave, secondary convex, light through hole
      return (
        <g>
          <rect x={CX - 130} y={CY - scaleD / 2} width={250} height={scaleD} rx={4}
            fill="#0b1018" stroke={col} strokeWidth="1.2" />
          {/* Primary mirror with hole */}
          <path d={`M ${CX + 110} ${CY - scaleD / 2} Q ${CX + 140} ${CY} ${CX + 110} ${CY + scaleD / 2}`}
            fill="none" stroke={col} strokeWidth="2" />
          <line x1={CX + 110} y1={CY - 8} x2={CX + 110} y2={CY + 8} stroke="#090d14" strokeWidth="4" />
          {/* Secondary convex mirror */}
          <path d={`M ${CX + 20} ${CY - 16} Q ${CX + 8} ${CY} ${CX + 20} ${CY + 16}`}
            fill="none" stroke={col} strokeWidth="2" />
          {/* Focus behind primary */}
          <circle cx={CX + 150} cy={CY} r={3} fill={col} fillOpacity="0.7" />
          {/* Light rays */}
          {[-1, 1].map(i => (
            <g key={i}>
              <line x1={CX - 180} y1={CY + i * scaleD * 0.45} x2={CX + 110} y2={CY + i * scaleD * 0.45}
                stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1={CX + 110} y1={CY + i * scaleD * 0.45} x2={CX + 18} y2={CY + i * 14}
                stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
              <line x1={CX + 18} y1={CY + i * 14} x2={CX + 150} y2={CY}
                stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
            </g>
          ))}
          <text x={CX + 120} y={CY - scaleD / 2 - 8} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Primary</text>
          <text x={CX + 22} y={CY - scaleD / 2 - 8} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Secondary</text>
        </g>
      );
    } else {
      // Radio dish: large parabola
      const dR = scaleD * 1.5;
      return (
        <g>
          <path d={`M ${CX - dR} ${CY + dR * 0.5} Q ${CX} ${CY - dR * 0.6} ${CX + dR} ${CY + dR * 0.5}`}
            fill={col} fillOpacity="0.12" stroke={col} strokeWidth="1.5" />
          {/* Feed horn at focus */}
          <line x1={CX - dR * 0.4} y1={CY + dR * 0.2} x2={CX} y2={CY - dR * 0.2} stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          <line x1={CX + dR * 0.4} y1={CY + dR * 0.2} x2={CX} y2={CY - dR * 0.2} stroke={col} strokeWidth="0.8" strokeOpacity="0.5" />
          <circle cx={CX} cy={CY - dR * 0.2} r={5} fill={col} fillOpacity="0.7" />
          <text x={CX} y={CY - dR * 0.2 - 10} textAnchor="middle" fill={col} fontSize="8" fontFamily="monospace">Feed horn</text>
          {/* Radio waves */}
          {[-1, 0, 1].map(i => (
            <line key={i} x1={CX + i * dR * 0.5} y1={CY - 120}
              x2={CX + i * dR * 0.5} y2={CY - 50}
              stroke={col} strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="4,3" />
          ))}
        </g>
      );
    }
  };

  return (
    <div className="my-8 rounded-xl border border-[#30363d] overflow-hidden shadow-xl">
      <div className="bg-[#161b22] px-5 py-4 border-b border-[#30363d]">
        <span className="text-[10px] font-bold text-[#58a6ff] uppercase tracking-widest block mb-1">
          🔭 Interactive · Telescope Optics
        </span>
        <h3 className="text-[#e6edf3] font-semibold text-base">How Telescopes Work — Aperture, Focal Length & Resolution</h3>
        <p className="text-[#8b949e] text-sm mt-1 leading-relaxed">
          {description ?? "A telescope's power comes from its aperture — larger mirrors collect more light and resolve finer details. The Rayleigh criterion θ = 1.22λ/D sets the diffraction limit. Adjust aperture and focal ratio to explore."}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ background: "#090d14", display: "block" }}>
        {/* Telescope schematic */}
        {drawTelescope()}

        {/* Stats panel */}
        <rect x={8} y={8} width={155} height={108} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={24} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Aperture</text>
        <text x={16} y={38} fill={col} fontSize="14" fontFamily="monospace" fontWeight="bold">{aperture} mm</text>
        <text x={16} y={54} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Focal length</text>
        <text x={16} y={68} fill={col} fontSize="12" fontFamily="monospace">{focalLength >= 1000 ? (focalLength / 1000).toFixed(1) + " m" : focalLength + " mm"}</text>
        <text x={16} y={84} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Light gathering</text>
        <text x={16} y={98} fill="#f7cc4a" fontSize="12" fontFamily="monospace">{lightGather.toFixed(0)}× eye</text>
        <text x={16} y={110} fill="#484f58" fontSize="7.5" fontFamily="monospace">f/{focalRatio} ratio</text>

        {/* Resolution panel */}
        <rect x={8} y={124} width={155} height={62} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        <text x={16} y={140} fill="#8b949e" fontSize="8.5" fontFamily="monospace">Resolution (Rayleigh)</text>
        <text x={16} y={156} fill="#3fb950" fontSize="13" fontFamily="monospace" fontWeight="bold">{rayleigh.toFixed(3)}"</text>
        <text x={16} y={170} fill="#484f58" fontSize="7.5" fontFamily="monospace">θ = 1.22·λ/D at 550nm</text>
        <text x={16} y={180} fill="#484f58" fontSize="7.5" fontFamily="monospace">Mag: {magnification.toFixed(0)}× (25mm ep)</text>

        {/* Design description */}
        <rect x={8} y={194} width={155} height={H - 202} rx={4} fill="#0b1018" stroke="#30363d" strokeWidth="0.75" />
        {d.description.match(/.{1,18}(\s|$)/g)?.slice(0, 5).map((line, i) => (
          <text key={i} x={14} y={210 + i * 13} fill="#8b949e" fontSize="7.5" fontFamily="monospace">{line.trim()}</text>
        ))}
        <text x={14} y={H - 14} fill="#484f58" fontSize="7" fontFamily="monospace">{d.example}</text>
      </svg>
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex-wrap">
        {DESIGNS.map((dd, i) => (
          <button key={dd.id} onClick={() => setDesign(i)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${design === i ? "font-bold text-[#0d1117]" : "bg-[#21262d] text-[#8b949e]"}`}
            style={design === i ? { background: dd.color } : {}}>
            {dd.name}
          </button>
        ))}
        <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">D:</span>
        <input type="range" min={50} max={1000} step={10} value={aperture}
          onChange={e => setAperture(parseInt(e.target.value))}
          className="w-20 h-1.5" style={{ accentColor: col }} />
        <span className="text-[10px] font-mono w-14" style={{ color: col }}>{aperture}mm</span>
        <span className="text-[10px] text-[#484f58] font-mono whitespace-nowrap">f/:</span>
        <input type="range" min={3} max={20} step={0.5} value={focalRatio}
          onChange={e => setFocalRatio(parseFloat(e.target.value))}
          className="w-16 h-1.5" style={{ accentColor: col }} />
        <span className="text-[10px] font-mono w-6" style={{ color: col }}>{focalRatio}</span>
      </div>
    </div>
  );
}
