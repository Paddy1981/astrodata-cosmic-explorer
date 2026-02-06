"use client";
import { useState, useMemo, useCallback } from "react";
import { SPECTROSCOPY_ELEMENTS, DISCOVERY_BADGES, NOTABLE_EXOPLANETS } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LabState {
  discoveries: { planet: string; elements: string[]; timestamp: number }[];
  badges: string[];
  totalAnalyses: number;
  uniqueElements: string[];
}

const INITIAL_LAB: LabState = {
  discoveries: [],
  badges: [],
  totalAnalyses: 0,
  uniqueElements: [],
};

function generateAtmosphere(planetType: string, seed: number): string[] {
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const atmo: string[] = [];
  if (planetType === "Gas Giant") {
    atmo.push("H", "He");
    if (rng() > 0.3) atmo.push("CH4");
    if (rng() > 0.5) atmo.push("NH3");
    if (rng() > 0.7) atmo.push("Na");
    if (rng() > 0.8) atmo.push("K");
    if (rng() > 0.9) atmo.push("Ti", "V");
  } else if (planetType === "Mini-Neptune") {
    atmo.push("H", "He");
    if (rng() > 0.4) atmo.push("H2O");
    if (rng() > 0.5) atmo.push("CH4");
    if (rng() > 0.7) atmo.push("CO");
  } else {
    if (rng() > 0.2) atmo.push("N2");
    if (rng() > 0.3) atmo.push("CO2");
    if (rng() > 0.4) atmo.push("H2O");
    if (rng() > 0.6) atmo.push("O2");
    if (rng() > 0.8) atmo.push("O3");
    if (rng() > 0.7) atmo.push("CH4");
    if (rng() > 0.9) atmo.push("Fe");
  }
  return atmo;
}

export default function DiscoveryLabPage() {
  const [lab, setLab, isLoaded] = useLocalStorage<LabState>("discovery-lab", INITIAL_LAB);
  const [selectedPlanet, setSelectedPlanet] = useState<number>(0);
  const [detectedElements, setDetectedElements] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [actualAtmosphere, setActualAtmosphere] = useState<string[]>([]);

  const planet = NOTABLE_EXOPLANETS[selectedPlanet];

  const elementMap = useMemo(() => {
    const map: Record<string, typeof SPECTROSCOPY_ELEMENTS[0]> = {};
    SPECTROSCOPY_ELEMENTS.forEach((e) => { map[e.symbol] = e; });
    return map;
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setDetectedElements([]);
    setAnalysisComplete(false);

    const atmo = generateAtmosphere(planet.type, selectedPlanet * 1000 + Date.now() % 1000);
    setActualAtmosphere(atmo);

    // Simulate progressive detection
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < atmo.length) {
        setDetectedElements((prev) => [...prev, atmo[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }
    }, 800);
  }, [planet, selectedPlanet]);

  const saveDiscovery = useCallback(() => {
    if (!analysisComplete) return;

    const newUniqueElements = [...new Set([...lab.uniqueElements, ...detectedElements])];

    // Check badges
    const newBadges = [...lab.badges];
    if (lab.discoveries.length === 0 && !newBadges.includes("first_light")) {
      newBadges.push("first_light");
    }
    if (newUniqueElements.length >= 5 && !newBadges.includes("element_hunter")) {
      newBadges.push("element_hunter");
    }
    if (detectedElements.includes("H2O") && !newBadges.includes("water_world")) {
      newBadges.push("water_world");
    }
    if ((detectedElements.includes("O2") || detectedElements.includes("O3")) && !newBadges.includes("biosignature")) {
      newBadges.push("biosignature");
    }
    if ((detectedElements.includes("CO2") || detectedElements.includes("CH4") || detectedElements.includes("CO")) && !newBadges.includes("carbon_seeker")) {
      newBadges.push("carbon_seeker");
    }
    if (detectedElements.includes("He") && !newBadges.includes("noble_expert")) {
      newBadges.push("noble_expert");
    }
    const metals = detectedElements.filter((e) => ["Fe", "Ti", "V", "Na", "K"].includes(e));
    if (metals.length >= 3 && !newBadges.includes("metal_detector")) {
      newBadges.push("metal_detector");
    }
    if (lab.discoveries.length + 1 >= 5 && !newBadges.includes("planet_explorer")) {
      newBadges.push("planet_explorer");
    }
    if (newUniqueElements.length >= 10 && !newBadges.includes("master_spectro")) {
      newBadges.push("master_spectro");
    }
    if (newUniqueElements.length >= 15 && !newBadges.includes("periodic_pioneer")) {
      newBadges.push("periodic_pioneer");
    }

    setLab({
      discoveries: [
        { planet: planet.name, elements: detectedElements, timestamp: Date.now() },
        ...lab.discoveries,
      ].slice(0, 50),
      badges: newBadges,
      totalAnalyses: lab.totalAnalyses + 1,
      uniqueElements: newUniqueElements,
    });

    setAnalysisComplete(false);
    setDetectedElements([]);
    setActualAtmosphere([]);
  }, [analysisComplete, detectedElements, lab, planet.name, setLab]);

  if (!isLoaded) return null;

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🔬 Discovery Lab</h1>
      <p className="text-[#8b949e] mb-8">
        Analyze exoplanet atmospheres using spectroscopy and earn discovery badges
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="cosmic-card p-3 text-center">
          <div className="text-lg font-bold text-[#58a6ff]">{lab.totalAnalyses}</div>
          <div className="text-xs text-[#8b949e]">Analyses</div>
        </div>
        <div className="cosmic-card p-3 text-center">
          <div className="text-lg font-bold text-[#3fb950]">{lab.discoveries.length}</div>
          <div className="text-xs text-[#8b949e]">Discoveries</div>
        </div>
        <div className="cosmic-card p-3 text-center">
          <div className="text-lg font-bold text-[#bc8cff]">{lab.uniqueElements.length}</div>
          <div className="text-xs text-[#8b949e]">Elements Found</div>
        </div>
        <div className="cosmic-card p-3 text-center">
          <div className="text-lg font-bold text-[#d4a853]">{lab.badges.length}</div>
          <div className="text-xs text-[#8b949e]">Badges</div>
        </div>
      </div>

      {/* Badges */}
      <div className="cosmic-card p-5 mb-6">
        <h3 className="font-semibold mb-3">Discovery Badges</h3>
        <div className="flex flex-wrap gap-3">
          {DISCOVERY_BADGES.map((badge) => {
            const earned = lab.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                  earned
                    ? "border-[#d4a853]/30 bg-[#d4a853]/5"
                    : "border-[#30363d] opacity-40"
                }`}
                title={badge.description}
              >
                <span className="text-lg">{badge.icon}</span>
                <span className={earned ? "text-[#d4a853]" : "text-[#8b949e]"}>{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Planet selector */}
        <div>
          <h3 className="font-semibold mb-3">Select Target</h3>
          <div className="space-y-2">
            {NOTABLE_EXOPLANETS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setSelectedPlanet(i); setDetectedElements([]); setAnalysisComplete(false); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  i === selectedPlanet
                    ? "border-[#1a73e8] bg-[#1a73e8]/5"
                    : "border-[#30363d] hover:border-[#30363d]"
                }`}
              >
                <div className="font-medium text-sm">{p.name}</div>
                <div className="text-xs text-[#8b949e]">{p.type} &middot; {p.distance} ly</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Analysis area */}
        <div className="lg:col-span-2">
          <div className="cosmic-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{planet.name}</h3>
                <p className="text-sm text-[#8b949e]">{planet.description}</p>
              </div>
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className={`btn-primary ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isAnalyzing ? "Analyzing..." : "Run Spectroscopy"}
              </button>
            </div>

            {/* Spectrum visualization */}
            <div className="spectrum-bar mb-4 relative">
              {detectedElements.map((elem, i) => {
                const elemData = elementMap[elem];
                if (!elemData) return null;
                const position = ((elemData.wavelength - 300) / 10000) * 100;
                return (
                  <div
                    key={elem}
                    className="absolute top-0 bottom-0 w-0.5 animate-fade-in"
                    style={{
                      left: `${Math.min(95, Math.max(5, position))}%`,
                      background: "rgba(0,0,0,0.8)",
                      boxShadow: `0 0 4px ${elemData.color}`,
                    }}
                    title={`${elemData.name} (${elemData.wavelength}nm)`}
                  />
                );
              })}
            </div>

            {/* Detected elements */}
            {detectedElements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[#8b949e] mb-2">Detected Species</h4>
                <div className="flex flex-wrap gap-2">
                  {detectedElements.map((elem) => {
                    const elemData = elementMap[elem];
                    return (
                      <div
                        key={elem}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] animate-slide-up"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: elemData?.color }}
                        />
                        <span className="font-mono font-medium text-sm">{elem}</span>
                        <span className="text-xs text-[#8b949e]">{elemData?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {analysisComplete && (
              <div className="p-4 rounded-lg border border-[#3fb950]/30 bg-[#3fb950]/5 animate-slide-up">
                <h4 className="font-semibold text-[#3fb950] mb-1">Analysis Complete!</h4>
                <p className="text-sm text-[#8b949e] mb-3">
                  Detected {detectedElements.length} chemical species in {planet.name}&apos;s atmosphere.
                </p>
                <button onClick={saveDiscovery} className="btn-primary">
                  Save Discovery & Earn XP
                </button>
              </div>
            )}

            {!isAnalyzing && detectedElements.length === 0 && (
              <div className="text-center py-8 text-[#8b949e]">
                <div className="text-4xl mb-3">🔬</div>
                <p>Select a planet and run spectroscopy to detect atmospheric elements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
