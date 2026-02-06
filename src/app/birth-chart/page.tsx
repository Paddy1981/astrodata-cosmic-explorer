"use client";
import { useState, useMemo } from "react";
import {
  toJulianDay,
  getSunLongitude,
  getMoonLongitude,
  getPlanetLongitude,
  getZodiacSign,
  getLahiriAyanamsa,
} from "@/lib/astronomy";
import { ZODIAC_SIGNS, LOCATIONS } from "@/lib/data";

type ViewMode = "scientific" | "western" | "vedic" | "compare";

export default function BirthChartPage() {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("12:00");
  const [locationKey, setLocationKey] = useState("mumbai");
  const [viewMode, setViewMode] = useState<ViewMode>("compare");

  const location = LOCATIONS[locationKey];

  const chartData = useMemo(() => {
    const [y, m, d] = birthDate.split("-").map(Number);
    const [h, min] = birthTime.split(":").map(Number);
    const date = new Date(y, m - 1, d, h, min);
    const jd = toJulianDay(date);
    const ayanamsa = getLahiriAyanamsa(y);

    const sunLon = getSunLongitude(jd);
    const moonLon = getMoonLongitude(jd);

    const planets = [
      { name: "Sun", symbol: "☉", lon: sunLon },
      { name: "Moon", symbol: "☽", lon: moonLon },
      ...["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].map((name) => ({
        name,
        symbol: name === "Mercury" ? "☿" : name === "Venus" ? "♀" : name === "Mars" ? "♂" : name === "Jupiter" ? "♃" : "♄",
        lon: getPlanetLongitude(name, jd),
      })),
    ];

    return {
      jd,
      ayanamsa,
      planets: planets.map((p) => ({
        ...p,
        tropical: getZodiacSign(p.lon),
        sidereal: getZodiacSign(((p.lon - ayanamsa) + 360) % 360),
        eclipticLon: p.lon,
        siderealLon: ((p.lon - ayanamsa) + 360) % 360,
      })),
    };
  }, [birthDate, birthTime]);

  const viewLabels: Record<ViewMode, string> = {
    scientific: "Scientific (Ecliptic)",
    western: "Western (Tropical)",
    vedic: "Vedic (Sidereal)",
    compare: "Compare All Views",
  };

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🗺️ Cultural Astronomy</h1>
      <p className="text-[#8b949e] mb-8">
        See how different traditions interpret the same sky - science, Western tropical, and Vedic sidereal perspectives
      </p>

      {/* Input controls */}
      <div className="cosmic-card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-[#8b949e] block mb-1">Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
            />
          </div>
          <div>
            <label className="text-sm text-[#8b949e] block mb-1">Birth Time</label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
            />
          </div>
          <div>
            <label className="text-sm text-[#8b949e] block mb-1">Location</label>
            <select
              value={locationKey}
              onChange={(e) => setLocationKey(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
            >
              {Object.entries(LOCATIONS).map(([key, loc]) => (
                <option key={key} value={key}>{loc.name}, {loc.country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-[#8b949e] block mb-1">Perspective</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
            >
              {Object.entries(viewLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Explanation banner */}
      <div className="cosmic-card p-4 mb-6 border-[#bc8cff]/20 bg-[#bc8cff]/5">
        <p className="text-sm text-[#c9d1d9]">
          <strong className="text-[#bc8cff]">Same sky, different maps:</strong> Western astrology uses the tropical zodiac (aligned to seasons),
          Vedic uses sidereal (aligned to stars), and science uses ecliptic coordinates. Due to Earth&apos;s
          precession, tropical and sidereal differ by ~{chartData.ayanamsa.toFixed(1)}° (Lahiri Ayanamsa).
        </p>
      </div>

      {/* Chart table */}
      {viewMode === "compare" ? (
        <div className="cosmic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#161b22] text-[#8b949e]">
                  <th className="text-left px-4 py-3">Planet</th>
                  <th className="text-left px-4 py-3">Ecliptic (Scientific)</th>
                  <th className="text-left px-4 py-3">Western (Tropical)</th>
                  <th className="text-left px-4 py-3">Vedic (Sidereal)</th>
                  <th className="text-left px-4 py-3">Shift</th>
                </tr>
              </thead>
              <tbody>
                {chartData.planets.map((p) => (
                  <tr key={p.name} className="border-t border-[#30363d]/50">
                    <td className="px-4 py-3">
                      <span className="mr-1">{p.symbol}</span>
                      <span className="font-medium">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#8b949e]">
                      {p.eclipticLon.toFixed(2)}°
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-1">{p.tropical.symbol}</span>
                      {p.tropical.sign}
                      <span className="text-[#484f58] ml-1">{p.tropical.degree.toFixed(1)}°</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-1">{p.sidereal.symbol}</span>
                      {p.sidereal.sign}
                      <span className="text-[#484f58] ml-1">{p.sidereal.degree.toFixed(1)}°</span>
                      {p.sidereal.sign !== p.tropical.sign && (
                        <span className="badge badge-gold ml-2">Different!</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8b949e]">
                      {chartData.ayanamsa.toFixed(1)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cosmic-card p-5">
          <h3 className="font-semibold mb-4">{viewLabels[viewMode]}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chartData.planets.map((p) => {
              const sign = viewMode === "vedic" ? p.sidereal : p.tropical;
              const lon = viewMode === "scientific" ? p.eclipticLon : viewMode === "vedic" ? p.siderealLon : p.eclipticLon;
              return (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg border border-[#30363d]">
                  <span className="text-2xl">{p.symbol}</span>
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-[#8b949e]">
                      {viewMode === "scientific"
                        ? `${lon.toFixed(2)}° ecliptic longitude`
                        : `${sign.symbol} ${sign.sign} at ${sign.degree.toFixed(1)}°`
                      }
                    </div>
                  </div>
                  {viewMode !== "scientific" && (
                    <span className={`badge ${
                      sign.element === "Fire" ? "badge-orange" :
                      sign.element === "Earth" ? "badge-green" :
                      sign.element === "Air" ? "badge-cyan" : "badge-blue"
                    }`}>
                      {sign.element}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zodiac reference */}
      <div className="cosmic-card p-5 mt-6">
        <h3 className="font-semibold mb-4">Zodiac Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ZODIAC_SIGNS.map((z) => (
            <div key={z.name} className="text-center p-2 rounded-lg border border-[#30363d] hover:border-[#30363d]">
              <div className="text-2xl">{z.symbol}</div>
              <div className="text-sm font-medium">{z.name}</div>
              <div className="text-[10px] text-[#8b949e]">{z.rashi}</div>
              <span className={`badge mt-1 ${
                z.element === "Fire" ? "badge-orange" :
                z.element === "Earth" ? "badge-green" :
                z.element === "Air" ? "badge-cyan" : "badge-blue"
              }`} style={{ fontSize: "0.6rem" }}>
                {z.element}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
