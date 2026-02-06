"use client";
import { useState, useMemo } from "react";
import { lightTravelTime } from "@/lib/astronomy";
import { PLANETS, DEEP_SKY_OBJECTS, NOTABLE_EXOPLANETS, HISTORICAL_EVENTS } from "@/lib/data";

const DESTINATIONS = [
  ...PLANETS.filter((p) => p.name !== "Earth").map((p) => ({
    name: p.name,
    category: "Solar System",
    distanceLY: p.distanceAU * 0.0000158125,
  })),
  { name: "Proxima Centauri", category: "Nearby Star", distanceLY: 4.24 },
  { name: "Sirius", category: "Nearby Star", distanceLY: 8.6 },
  { name: "Vega", category: "Nearby Star", distanceLY: 25 },
  { name: "Betelgeuse", category: "Star", distanceLY: 700 },
  { name: "Polaris", category: "Star", distanceLY: 433 },
  ...NOTABLE_EXOPLANETS.slice(0, 5).map((p) => ({
    name: p.name,
    category: "Exoplanet",
    distanceLY: p.distance,
  })),
  ...DEEP_SKY_OBJECTS.slice(0, 4).map((d) => ({
    name: d.name,
    category: d.type,
    distanceLY: d.distance,
  })),
];

export default function CosmicPostcardPage() {
  const [selectedIdx, setSelectedIdx] = useState(5); // Sirius
  const [message, setMessage] = useState("Hello from Earth!");

  const destination = DESTINATIONS[selectedIdx];
  const travel = useMemo(() => lightTravelTime(destination.distanceLY), [destination]);

  const eventDuringTravel = useMemo(() => {
    const travelYears = destination.distanceLY;
    const arrivalYear = new Date().getFullYear() + travelYears;
    const departYear = arrivalYear - travelYears;
    return HISTORICAL_EVENTS.find(
      (e) => e.year >= departYear - travelYears && e.year <= new Date().getFullYear()
    );
  }, [destination]);

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">✉️ Cosmic Postcard</h1>
      <p className="text-[#8b949e] mb-8">
        How long would your message take to reach the stars at the speed of light?
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Message composer */}
        <div>
          <div className="cosmic-card p-5 mb-4">
            <label className="text-sm text-[#8b949e] block mb-2">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-[#1a73e8]"
              placeholder="Write your message to the cosmos..."
              maxLength={280}
            />
            <div className="text-xs text-[#484f58] text-right mt-1">{message.length}/280</div>
          </div>

          <div className="cosmic-card p-5">
            <label className="text-sm text-[#8b949e] block mb-2">Destination</label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {DESTINATIONS.map((dest, i) => (
                <button
                  key={dest.name}
                  onClick={() => setSelectedIdx(i)}
                  className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                    i === selectedIdx
                      ? "bg-[#1a73e8]/10 border border-[#1a73e8]"
                      : "hover:bg-[#161b22] border border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dest.name}</span>
                    <span className="text-xs text-[#8b949e]">{dest.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Travel visualization */}
        <div>
          <div className="cosmic-card p-6 text-center mb-4">
            <div className="text-sm text-[#8b949e] mb-2">Sending to</div>
            <h2 className="text-2xl font-bold text-gradient mb-1">{destination.name}</h2>
            <span className="badge badge-blue">{destination.category}</span>

            <div className="my-6">
              <div className="text-sm text-[#8b949e] mb-1">Travel time at speed of light</div>
              <div className="text-3xl font-bold text-white">{travel.description}</div>
            </div>

            {/* Time breakdown */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { value: travel.years, label: "Years" },
                { value: travel.days, label: "Days" },
                { value: travel.hours, label: "Hours" },
                { value: travel.minutes, label: "Min" },
                { value: travel.seconds, label: "Sec" },
              ].map((unit) => (
                <div key={unit.label} className="p-2 rounded bg-[#0d1117]">
                  <div className="text-lg font-bold font-mono text-[#58a6ff]">{unit.value}</div>
                  <div className="text-[10px] text-[#8b949e]">{unit.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Postcard preview */}
          <div className="cosmic-card p-6 border-[#d4a853]/20 bg-gradient-to-br from-[#1c2333] to-[#0d1117]">
            <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-3">Postcard Preview</div>
            <div className="border border-[#30363d] rounded-lg p-4 bg-[#0d1117]">
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs text-[#8b949e]">FROM: Earth, Solar System</div>
                <div className="text-xs text-[#8b949e]">🌍 → ✨</div>
              </div>
              <div className="text-xs text-[#8b949e] mb-2">TO: {destination.name}</div>
              <div className="section-divider" style={{ margin: "0.5rem 0" }} />
              <p className="text-sm text-white italic">&ldquo;{message}&rdquo;</p>
              <div className="text-xs text-[#484f58] mt-3">
                Estimated delivery: {travel.description} from now
              </div>
            </div>
          </div>

          {eventDuringTravel && (
            <div className="cosmic-card p-4 mt-4 border-[#bc8cff]/20">
              <div className="text-xs text-[#bc8cff] mb-1">While your message travels...</div>
              <p className="text-sm text-[#c9d1d9]">
                Light that left {destination.name} when &ldquo;{eventDuringTravel.event}&rdquo;
                happened ({eventDuringTravel.year}) is just reaching us now.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
