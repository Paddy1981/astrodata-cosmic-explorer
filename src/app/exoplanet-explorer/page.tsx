"use client";
import { useState, useMemo } from "react";
import { NOTABLE_EXOPLANETS } from "@/lib/data";

type SortKey = "name" | "distance" | "radius" | "mass" | "discoveryYear";

export default function ExoplanetExplorerPage() {
  const [sortBy, setSortBy] = useState<SortKey>("discoveryYear");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);

  const types = useMemo(() => {
    const t = new Set(NOTABLE_EXOPLANETS.map((p) => p.type));
    return ["all", ...Array.from(t)];
  }, []);

  const sorted = useMemo(() => {
    let filtered = [...NOTABLE_EXOPLANETS];
    if (filterType !== "all") {
      filtered = filtered.filter((p) => p.type === filterType);
    }
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return filtered;
  }, [sortBy, sortDir, filterType]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(key); setSortDir("asc"); }
  }

  function getTypeColor(type: string): string {
    switch (type) {
      case "Earth-like": return "badge-blue";
      case "Super-Earth": return "badge-green";
      case "Mini-Neptune": return "badge-cyan";
      case "Gas Giant": return "badge-orange";
      default: return "badge-purple";
    }
  }

  function getTypeVisual(type: string, radius: number): { color: string; size: number } {
    const size = Math.max(20, Math.min(80, radius * 4));
    switch (type) {
      case "Earth-like": return { color: "#58a6ff", size };
      case "Super-Earth": return { color: "#3fb950", size };
      case "Mini-Neptune": return { color: "#39d2c0", size };
      case "Gas Giant": return { color: "#f0883e", size };
      default: return { color: "#bc8cff", size };
    }
  }

  const selected = selectedPlanet !== null ? NOTABLE_EXOPLANETS.find((_, i) => i === selectedPlanet) : null;

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🪐 Exoplanet Explorer</h1>
      <p className="text-[#8b949e] mb-8">
        Browse confirmed exoplanets from NASA mission data.{" "}
        <a href="https://larun.space" target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline">
          Discover more with Larun.space AI →
        </a>
      </p>

      {/* Size comparison */}
      <div className="cosmic-card p-6 mb-8">
        <h3 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wider mb-4">
          Planet Size Comparison (relative to Earth)
        </h3>
        <div className="flex items-end gap-4 overflow-x-auto pb-2 min-h-[120px]">
          {/* Earth reference */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="rounded-full mb-2"
              style={{
                width: 20,
                height: 20,
                background: "radial-gradient(circle at 35% 35%, #88ccff, #4a90d9)",
                boxShadow: "0 0 10px rgba(74,144,217,0.3)",
              }}
            />
            <span className="text-[10px] text-[#8b949e]">Earth</span>
            <span className="text-[10px] text-[#484f58]">1.0 R⊕</span>
          </div>

          {NOTABLE_EXOPLANETS.slice(0, 8).map((planet) => {
            const vis = getTypeVisual(planet.type, planet.radius);
            return (
              <div key={planet.name} className="flex flex-col items-center flex-shrink-0">
                <div
                  className="rounded-full mb-2"
                  style={{
                    width: vis.size,
                    height: vis.size,
                    background: `radial-gradient(circle at 35% 35%, ${vis.color}cc, ${vis.color}44)`,
                    boxShadow: `0 0 ${vis.size / 3}px ${vis.color}33`,
                  }}
                />
                <span className="text-[10px] text-[#c9d1d9] max-w-[60px] text-center truncate">
                  {planet.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-[#484f58]">{planet.radius} R⊕</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === type
                ? "bg-[#1a73e8] text-white"
                : "bg-[#1c2333] text-[#8b949e] hover:text-white border border-[#30363d]"
            }`}
          >
            {type === "all" ? "All Types" : type}
          </button>
        ))}
      </div>

      {/* Planet table */}
      <div className="cosmic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#161b22] text-[#8b949e]">
                {[
                  { key: "name" as SortKey, label: "Name" },
                  { key: "distance" as SortKey, label: "Distance (ly)" },
                  { key: "radius" as SortKey, label: "Radius (R⊕)" },
                  { key: "mass" as SortKey, label: "Mass (M⊕)" },
                  { key: "discoveryYear" as SortKey, label: "Year" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortBy === col.key && (
                      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
                <th className="text-left px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((planet, idx) => (
                <tr
                  key={planet.name}
                  className="border-t border-[#30363d]/50 hover:bg-[#161b22] cursor-pointer transition-colors"
                  onClick={() => setSelectedPlanet(selectedPlanet === idx ? null : idx)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{planet.name}</div>
                    <div className="text-xs text-[#484f58]">{planet.method}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">{planet.distance}</td>
                  <td className="px-4 py-3 font-mono">{planet.radius}</td>
                  <td className="px-4 py-3 font-mono">{planet.mass}</td>
                  <td className="px-4 py-3">{planet.discoveryYear}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <span className={`badge ${getTypeColor(planet.type)}`}>{planet.type}</span>
                      {planet.habitable && <span className="badge badge-green">HZ</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected planet detail */}
      {selected && (
        <div className="cosmic-card p-6 mt-4 animate-slide-up border-[#58a6ff]/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`badge ${getTypeColor(selected.type)}`}>{selected.type}</span>
                <span className="badge badge-purple">{selected.starType} star</span>
                {selected.habitable && <span className="badge badge-green">Habitable Zone</span>}
              </div>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-[#8b949e] hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[#c9d1d9] mb-4">{selected.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2 rounded bg-[#0d1117]">
              <div className="text-xs text-[#8b949e]">Distance</div>
              <div className="font-mono font-medium">{selected.distance} ly</div>
            </div>
            <div className="p-2 rounded bg-[#0d1117]">
              <div className="text-xs text-[#8b949e]">Radius</div>
              <div className="font-mono font-medium">{selected.radius} R⊕</div>
            </div>
            <div className="p-2 rounded bg-[#0d1117]">
              <div className="text-xs text-[#8b949e]">Mass</div>
              <div className="font-mono font-medium">{selected.mass} M⊕</div>
            </div>
            <div className="p-2 rounded bg-[#0d1117]">
              <div className="text-xs text-[#8b949e]">Discovery</div>
              <div className="font-medium">{selected.discoveryYear} ({selected.method})</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
