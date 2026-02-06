"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getMoonPhase,
  getSunLongitude,
  getPlanetLongitude,
  getZodiacSign,
  toJulianDay,
  calculateSunTimes,
  formatTime,
} from "@/lib/astronomy";
import { LOCATIONS, PLANETS } from "@/lib/data";

export default function TonightsSkyPage() {
  const [locationKey, setLocationKey] = useState("mumbai");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const location = LOCATIONS[locationKey];
  const jd = useMemo(() => toJulianDay(now), [now]);
  const moonPhase = useMemo(() => getMoonPhase(now), [now]);
  const sunLon = useMemo(() => getSunLongitude(jd), [jd]);
  const sunSign = useMemo(() => getZodiacSign(sunLon), [sunLon]);
  const sunTimes = useMemo(
    () => calculateSunTimes(now, location.lat, location.lon),
    [now, location]
  );

  const planetData = useMemo(() => {
    return PLANETS.filter((p) => p.name !== "Earth").map((planet) => {
      const lon = getPlanetLongitude(planet.name, jd);
      const sign = getZodiacSign(lon);
      const elongation = Math.abs(lon - sunLon);
      const visible = planet.name === "Mercury" || planet.name === "Venus"
        ? elongation > 15
        : elongation > 30 || elongation < 330;
      return { ...planet, longitude: lon, sign, visible, elongation };
    });
  }, [jd, sunLon]);

  const isNight = now > sunTimes.sunset || now < sunTimes.sunrise;

  return (
    <div className="content-container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          🌃 Tonight&apos;s Sky
        </h1>
        <p className="text-[#8b949e]">
          Real-time sky conditions and what&apos;s visible from your location
        </p>
      </div>

      {/* Location picker */}
      <div className="cosmic-card p-4 mb-6">
        <label className="text-sm text-[#8b949e] block mb-2">Your Location</label>
        <select
          value={locationKey}
          onChange={(e) => setLocationKey(e.target.value)}
          className="w-full sm:w-auto bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
        >
          {Object.entries(LOCATIONS).map(([key, loc]) => (
            <option key={key} value={key}>
              {loc.name}, {loc.country}
            </option>
          ))}
        </select>
      </div>

      {/* Sky status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="cosmic-card p-5">
          <div className="text-3xl mb-2">{isNight ? "🌃" : "☀️"}</div>
          <div className="text-sm text-[#8b949e]">Sky Status</div>
          <div className="text-lg font-semibold text-white">
            {isNight ? "Dark Sky - Go Observe!" : "Daylight"}
          </div>
          <div className="text-xs text-[#484f58] mt-1">
            Sunset: {formatTime(sunTimes.sunset)} &middot; Sunrise: {formatTime(sunTimes.sunrise)}
          </div>
        </div>

        <div className="cosmic-card p-5">
          <div className="text-3xl mb-2">{moonPhase.emoji}</div>
          <div className="text-sm text-[#8b949e]">Moon Phase</div>
          <div className="text-lg font-semibold text-white">{moonPhase.phaseName}</div>
          <div className="text-xs text-[#484f58] mt-1">
            {Math.round(moonPhase.illumination * 100)}% illuminated &middot; Age: {moonPhase.age.toFixed(1)} days
          </div>
        </div>

        <div className="cosmic-card p-5">
          <div className="text-3xl mb-2">{sunSign.symbol}</div>
          <div className="text-sm text-[#8b949e]">Sun in</div>
          <div className="text-lg font-semibold text-white">{sunSign.sign}</div>
          <div className="text-xs text-[#484f58] mt-1">
            {sunSign.degree.toFixed(1)}° &middot; Day length: {sunTimes.dayLength.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Twilight timeline */}
      <div className="cosmic-card p-5 mb-8">
        <h3 className="font-semibold mb-4">Twilight Timeline</h3>
        <div className="space-y-3">
          {[
            { label: "Astronomical Dawn", time: sunTimes.astronomicalDawn, color: "#1a1a3e" },
            { label: "Nautical Dawn", time: sunTimes.nauticalDawn, color: "#1a2a4e" },
            { label: "Civil Dawn", time: sunTimes.civilDawn, color: "#2a3a5e" },
            { label: "Sunrise", time: sunTimes.sunrise, color: "#f0883e" },
            { label: "Solar Noon", time: sunTimes.solarNoon, color: "#d4a853" },
            { label: "Sunset", time: sunTimes.sunset, color: "#f0883e" },
            { label: "Civil Dusk", time: sunTimes.civilDusk, color: "#2a3a5e" },
            { label: "Nautical Dusk", time: sunTimes.nauticalDusk, color: "#1a2a4e" },
            { label: "Astronomical Dusk", time: sunTimes.astronomicalDusk, color: "#1a1a3e" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-sm text-[#8b949e] w-40">{item.label}</span>
              <span className="text-sm font-mono text-white">
                {formatTime(item.time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Planets */}
      <div className="cosmic-card p-5">
        <h3 className="font-semibold mb-4">Planets Tonight</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {planetData.map((planet) => (
            <div
              key={planet.name}
              className={`p-3 rounded-lg border ${
                planet.visible
                  ? "border-[#3fb950]/30 bg-[#3fb950]/5"
                  : "border-[#30363d] bg-[#0d1117]/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: planet.color }}
                  />
                  <span className="font-medium text-sm">{planet.name}</span>
                  <span className="text-[#8b949e] text-xs">{planet.symbol}</span>
                </div>
                <span className={`badge ${planet.visible ? "badge-green" : "badge-red"}`}>
                  {planet.visible ? "Visible" : "Hidden"}
                </span>
              </div>
              <div className="text-xs text-[#8b949e]">
                In {planet.sign.sign} {planet.sign.symbol} at {planet.longitude.toFixed(1)}°
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
