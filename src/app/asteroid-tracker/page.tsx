"use client";
import { useState, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Asteroid {
  name: string;
  diameter: number; // meters
  velocity: number; // km/s
  closestApproach: number; // lunar distances
  approachDate: string;
  threatLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "MINIMAL";
  famous: boolean;
  funFact?: string;
}

function generateAsteroids(): Asteroid[] {
  const famous = [
    { name: "99942 Apophis", diameter: 370, famous: true, funFact: "Once had a 2.7% chance of hitting Earth in 2029. Now confirmed safe, but will pass closer than geostationary satellites!" },
    { name: "101955 Bennu", diameter: 490, famous: true, funFact: "OSIRIS-REx collected samples from Bennu and returned them to Earth in 2023." },
    { name: "162173 Ryugu", diameter: 900, famous: true, funFact: "Hayabusa2 collected samples and found amino acids - building blocks of life!" },
    { name: "433 Eros", diameter: 16840, famous: true, funFact: "The first asteroid ever orbited by a spacecraft (NEAR Shoemaker, 2000)." },
    { name: "25143 Itokawa", diameter: 330, famous: true, funFact: "Shaped like a sea otter! First asteroid from which samples were returned." },
  ];

  const generated: Asteroid[] = famous.map((f) => {
    const dist = 0.5 + Math.random() * 50;
    const vel = 5 + Math.random() * 30;
    const monthOffset = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);

    let threat: Asteroid["threatLevel"];
    const threatScore = (f.diameter / 1000) * (1 / (dist + 0.1));
    if (threatScore > 5) threat = "CRITICAL";
    else if (threatScore > 2) threat = "HIGH";
    else if (threatScore > 0.5) threat = "MODERATE";
    else if (threatScore > 0.1) threat = "LOW";
    else threat = "MINIMAL";

    return {
      ...f,
      velocity: Math.round(vel * 10) / 10,
      closestApproach: Math.round(dist * 10) / 10,
      approachDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      threatLevel: threat,
    };
  });

  // Add some random ones
  for (let i = 0; i < 10; i++) {
    const diameter = Math.round(5 + Math.random() * 2000);
    const dist = 0.2 + Math.random() * 80;
    const vel = 3 + Math.random() * 40;
    const monthOffset = Math.floor(Math.random() * 36);
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);

    let threat: Asteroid["threatLevel"];
    const threatScore = (diameter / 1000) * (1 / (dist + 0.1));
    if (threatScore > 5) threat = "CRITICAL";
    else if (threatScore > 2) threat = "HIGH";
    else if (threatScore > 0.5) threat = "MODERATE";
    else if (threatScore > 0.1) threat = "LOW";
    else threat = "MINIMAL";

    generated.push({
      name: `20${24 + Math.floor(i / 3)} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 7) % 26))}${Math.floor(Math.random() * 9) + 1}`,
      diameter,
      velocity: Math.round(vel * 10) / 10,
      closestApproach: Math.round(dist * 10) / 10,
      approachDate: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      threatLevel: threat,
      famous: false,
    });
  }

  return generated.sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3, MINIMAL: 4 };
    return order[a.threatLevel] - order[b.threatLevel];
  });
}

export default function AsteroidTrackerPage() {
  const asteroids = useMemo(() => generateAsteroids(), []);
  const [tracked, setTracked] = useLocalStorage<string[]>("tracked-asteroids", []);
  const [selectedAsteroid, setSelectedAsteroid] = useState<number | null>(null);
  const [filterThreat, setFilterThreat] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filterThreat === "all") return asteroids;
    return asteroids.filter((a) => a.threatLevel === filterThreat);
  }, [asteroids, filterThreat]);

  const threatColors: Record<string, string> = {
    CRITICAL: "badge-red",
    HIGH: "badge-orange",
    MODERATE: "badge-gold",
    LOW: "badge-blue",
    MINIMAL: "badge-green",
  };

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">☄️ Asteroid Tracker</h1>
      <p className="text-[#8b949e] mb-8">Monitor near-Earth objects and assess potential threats</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="cosmic-card p-4 text-center">
          <div className="text-xl font-bold text-white">{asteroids.length}</div>
          <div className="text-xs text-[#8b949e]">Tracked NEOs</div>
        </div>
        <div className="cosmic-card p-4 text-center">
          <div className="text-xl font-bold text-[#f85149]">
            {asteroids.filter((a) => a.threatLevel === "CRITICAL" || a.threatLevel === "HIGH").length}
          </div>
          <div className="text-xs text-[#8b949e]">High Threat</div>
        </div>
        <div className="cosmic-card p-4 text-center">
          <div className="text-xl font-bold text-[#d4a853]">
            {asteroids.filter((a) => a.famous).length}
          </div>
          <div className="text-xs text-[#8b949e]">Famous NEOs</div>
        </div>
        <div className="cosmic-card p-4 text-center">
          <div className="text-xl font-bold text-[#58a6ff]">{tracked[0]?.length || 0}</div>
          <div className="text-xs text-[#8b949e]">Your Watchlist</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "CRITICAL", "HIGH", "MODERATE", "LOW", "MINIMAL"].map((level) => (
          <button
            key={level}
            onClick={() => setFilterThreat(level)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterThreat === level
                ? "bg-[#1a73e8] text-white"
                : "bg-[#1c2333] text-[#8b949e] border border-[#30363d]"
            }`}
          >
            {level === "all" ? "All" : level}
          </button>
        ))}
      </div>

      {/* Asteroid list */}
      <div className="space-y-2">
        {filtered.map((asteroid, idx) => (
          <div
            key={asteroid.name}
            className="cosmic-card p-4 cursor-pointer"
            onClick={() => setSelectedAsteroid(selectedAsteroid === idx ? null : idx)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{asteroid.name}</span>
                  {asteroid.famous && <span className="badge badge-gold">Famous</span>}
                  <span className={`badge ${threatColors[asteroid.threatLevel]}`}>
                    {asteroid.threatLevel}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-[#8b949e]">
                  <span>Diameter: <span className="text-white">{asteroid.diameter}m</span></span>
                  <span>Speed: <span className="text-white">{asteroid.velocity} km/s</span></span>
                  <span>Closest: <span className="text-white">{asteroid.closestApproach} LD</span></span>
                  <span>Date: <span className="text-white">{asteroid.approachDate}</span></span>
                </div>
              </div>
              {/* Size visualization */}
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 self-center"
                style={{
                  width: Math.max(12, Math.min(48, asteroid.diameter / 100)),
                  height: Math.max(12, Math.min(48, asteroid.diameter / 100)),
                  background: `radial-gradient(circle at 40% 40%, #8b949e, #484f58)`,
                }}
              />
            </div>

            {selectedAsteroid === idx && asteroid.funFact && (
              <div className="mt-3 pt-3 border-t border-[#30363d] animate-fade-in">
                <p className="text-sm text-[#d4a853] italic">{asteroid.funFact}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
