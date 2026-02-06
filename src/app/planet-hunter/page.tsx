"use client";
import { useState, useCallback } from "react";
import { generateExoplanet } from "@/lib/astronomy";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Discovery {
  planet: ReturnType<typeof generateExoplanet>;
  timestamp: number;
}

interface HunterState {
  discoveries: Discovery[];
  totalScans: number;
  habitableFound: number;
}

const INITIAL_STATE: HunterState = {
  discoveries: [],
  totalScans: 0,
  habitableFound: 0,
};

function getPlanetColor(type: string): string {
  switch (type) {
    case "Sub-Earth": return "#8b949e";
    case "Earth-like": return "#58a6ff";
    case "Super-Earth": return "#3fb950";
    case "Mini-Neptune": return "#39d2c0";
    case "Neptune-like": return "#bc8cff";
    case "Gas Giant": return "#f0883e";
    default: return "#8b949e";
  }
}

function getPlanetSize(radius: number): number {
  return Math.max(24, Math.min(120, radius * 12));
}

export default function PlanetHunterPage() {
  const [state, setState, isLoaded] = useLocalStorage<HunterState>("planet-hunter", INITIAL_STATE);
  const [currentPlanet, setCurrentPlanet] = useState<ReturnType<typeof generateExoplanet> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const scan = useCallback(() => {
    setIsScanning(true);
    setShowDetails(false);

    setTimeout(() => {
      const seed = Date.now() + Math.floor(Math.random() * 100000);
      const planet = generateExoplanet(seed);
      setCurrentPlanet(planet);
      setIsScanning(false);

      setState((prev) => ({
        ...prev,
        totalScans: prev.totalScans + 1,
      }));
    }, 1500);
  }, [setState]);

  const catalogPlanet = useCallback(() => {
    if (!currentPlanet) return;
    setState((prev) => ({
      ...prev,
      discoveries: [{ planet: currentPlanet, timestamp: Date.now() }, ...prev.discoveries].slice(0, 50),
      habitableFound: prev.habitableFound + (currentPlanet.habitable ? 1 : 0),
    }));
    setCurrentPlanet(null);
    setShowDetails(false);
  }, [currentPlanet, setState]);

  if (!isLoaded) return null;

  return (
    <div className="content-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎮 Planet Hunter</h1>
          <p className="text-[#8b949e]">
            Scan star systems and discover new exoplanets!
          </p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-[#58a6ff]">{state.totalScans}</div>
            <div className="text-xs text-[#8b949e]">Scans</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#3fb950]">{state.discoveries.length}</div>
            <div className="text-xs text-[#8b949e]">Cataloged</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#d4a853]">{state.habitableFound}</div>
            <div className="text-xs text-[#8b949e]">Habitable</div>
          </div>
        </div>
      </div>

      {/* Scan area */}
      <div className="cosmic-card p-8 mb-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        {isScanning ? (
          <div className="animate-pulse">
            <div className="text-5xl mb-4">🔭</div>
            <p className="text-[#8b949e]">Scanning star system...</p>
            <div className="mt-4 w-48 mx-auto">
              <div className="xp-bar">
                <div className="xp-fill animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          </div>
        ) : currentPlanet ? (
          <div className="animate-slide-up">
            {/* Planet visualization */}
            <div className="relative inline-block mb-4">
              <div
                className="rounded-full mx-auto planet-card"
                style={{
                  width: getPlanetSize(currentPlanet.radius),
                  height: getPlanetSize(currentPlanet.radius),
                  background: `radial-gradient(circle at 35% 35%, ${getPlanetColor(currentPlanet.type)}88, ${getPlanetColor(currentPlanet.type)}22)`,
                  boxShadow: `0 0 ${getPlanetSize(currentPlanet.radius) / 2}px ${getPlanetColor(currentPlanet.type)}33`,
                }}
              />
              {currentPlanet.habitable && (
                <div className="absolute -top-2 -right-2 text-xl animate-float">💧</div>
              )}
            </div>

            <h2 className="text-xl font-bold mb-1">{currentPlanet.name}</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="badge badge-blue">{currentPlanet.type}</span>
              <span className="badge badge-purple">{currentPlanet.starType}-type Star</span>
              {currentPlanet.habitable && (
                <span className="badge badge-green">Potentially Habitable</span>
              )}
            </div>

            {showDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto mb-4 text-sm">
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Radius</div>
                  <div className="font-mono">{currentPlanet.radius} R⊕</div>
                </div>
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Mass</div>
                  <div className="font-mono">{currentPlanet.mass} M⊕</div>
                </div>
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Orbital Period</div>
                  <div className="font-mono">{currentPlanet.orbitalPeriod} days</div>
                </div>
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Temperature</div>
                  <div className="font-mono">{currentPlanet.equilibriumTemp} K</div>
                </div>
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Star Temperature</div>
                  <div className="font-mono">{currentPlanet.starTemp} K</div>
                </div>
                <div className="p-2 rounded bg-[#0d1117]">
                  <div className="text-[#8b949e] text-xs">Distance</div>
                  <div className="font-mono">{currentPlanet.distance} ly</div>
                </div>
                {currentPlanet.atmosphere.length > 0 && (
                  <div className="p-2 rounded bg-[#0d1117] col-span-2 sm:col-span-3">
                    <div className="text-[#8b949e] text-xs mb-1">Atmosphere</div>
                    <div className="flex gap-1 flex-wrap">
                      {currentPlanet.atmosphere.map((gas) => (
                        <span key={gas} className="badge badge-cyan">{gas}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              {!showDetails && (
                <button onClick={() => setShowDetails(true)} className="btn-secondary">
                  Analyze
                </button>
              )}
              <button onClick={catalogPlanet} className="btn-primary">
                Add to Catalog
              </button>
              <button onClick={scan} className="btn-secondary">
                Skip & Scan Again
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4 animate-float">🔭</div>
            <h2 className="text-xl font-semibold mb-2">Ready to Hunt Exoplanets?</h2>
            <p className="text-[#8b949e] mb-6 max-w-md mx-auto">
              Point your virtual telescope at a star system and discover new worlds.
              Each scan uses realistic distributions of star types and planet properties.
            </p>
            <button onClick={scan} className="btn-primary text-base px-8 py-3">
              Start Scanning
            </button>
          </div>
        )}
      </div>

      {/* Discoveries catalog */}
      {state.discoveries.length > 0 && (
        <div className="cosmic-card p-5">
          <h3 className="font-semibold mb-4">
            Your Catalog ({state.discoveries.length} planets)
          </h3>
          <div className="space-y-2">
            {state.discoveries.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#30363d] hover:border-[#30363d]"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${getPlanetColor(d.planet.type)}88, ${getPlanetColor(d.planet.type)}22)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{d.planet.name}</div>
                  <div className="text-xs text-[#8b949e]">
                    {d.planet.type} &middot; {d.planet.radius} R⊕ &middot; {d.planet.distance} ly
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="badge badge-blue text-[10px]">{d.planet.starType}</span>
                  {d.planet.habitable && <span className="badge badge-green text-[10px]">HZ</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
