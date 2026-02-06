"use client";
import { useState, useMemo } from "react";
import {
  toJulianDay,
  getSunLongitude,
  getMoonLongitude,
  getPlanetLongitude,
  getZodiacSign,
  getMoonPhase,
} from "@/lib/astronomy";

export default function CelestialCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [selectedTime, setSelectedTime] = useState("22:00");

  const dateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const [h, min] = selectedTime.split(":").map(Number);
    return new Date(y, m - 1, d, h, min);
  }, [selectedDate, selectedTime]);

  const jd = useMemo(() => toJulianDay(dateObj), [dateObj]);
  const moonPhase = useMemo(() => getMoonPhase(dateObj), [dateObj]);

  const bodies = useMemo(() => {
    const sunLon = getSunLongitude(jd);
    const moonLon = getMoonLongitude(jd);

    const planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].map((name) => {
      const lon = getPlanetLongitude(name, jd);
      return { name, longitude: lon, sign: getZodiacSign(lon) };
    });

    return {
      sun: { longitude: sunLon, sign: getZodiacSign(sunLon) },
      moon: { longitude: moonLon, sign: getZodiacSign(moonLon) },
      planets,
    };
  }, [jd]);

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">📅 Celestial Calendar</h1>
      <p className="text-[#8b949e] mb-8">
        View planetary positions for any date and time
      </p>

      {/* Date/Time picker */}
      <div className="cosmic-card p-5 mb-8 flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-[#8b949e] block mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
          />
        </div>
        <div>
          <label className="text-sm text-[#8b949e] block mb-1">Time</label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a73e8]"
          />
        </div>
        <div>
          <label className="text-sm text-[#8b949e] block mb-1">Julian Day</label>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-[#58a6ff] text-sm font-mono">
            {jd.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Sun and Moon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="cosmic-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">☀️</span>
            <div>
              <h3 className="font-semibold">Sun</h3>
              <div className="text-sm text-[#8b949e]">Ecliptic longitude: {bodies.sun.longitude.toFixed(2)}°</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{bodies.sun.sign.symbol}</span>
            <span className="font-medium">{bodies.sun.sign.sign}</span>
            <span className="badge badge-orange">{bodies.sun.sign.element}</span>
            <span className="text-xs text-[#484f58]">{bodies.sun.sign.degree.toFixed(1)}°</span>
          </div>
        </div>

        <div className="cosmic-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{moonPhase.emoji}</span>
            <div>
              <h3 className="font-semibold">Moon</h3>
              <div className="text-sm text-[#8b949e]">
                {moonPhase.phaseName} &middot; {Math.round(moonPhase.illumination * 100)}% illuminated
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{bodies.moon.sign.symbol}</span>
            <span className="font-medium">{bodies.moon.sign.sign}</span>
            <span className="badge badge-blue">{bodies.moon.sign.element}</span>
            <span className="text-xs text-[#484f58]">{bodies.moon.sign.degree.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      {/* Planets */}
      <div className="cosmic-card p-5">
        <h3 className="font-semibold mb-4">Planetary Positions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#8b949e] border-b border-[#30363d]">
                <th className="text-left py-2 pr-4">Planet</th>
                <th className="text-left py-2 pr-4">Longitude</th>
                <th className="text-left py-2 pr-4">Sign</th>
                <th className="text-left py-2 pr-4">Element</th>
                <th className="text-left py-2">Degree in Sign</th>
              </tr>
            </thead>
            <tbody>
              {bodies.planets.map((planet) => (
                <tr key={planet.name} className="border-b border-[#30363d]/50">
                  <td className="py-3 pr-4 font-medium">{planet.name}</td>
                  <td className="py-3 pr-4 font-mono text-[#58a6ff]">{planet.longitude.toFixed(2)}°</td>
                  <td className="py-3 pr-4">
                    <span className="mr-1">{planet.sign.symbol}</span>
                    {planet.sign.sign}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge ${
                      planet.sign.element === "Fire" ? "badge-orange" :
                      planet.sign.element === "Earth" ? "badge-green" :
                      planet.sign.element === "Air" ? "badge-cyan" : "badge-blue"
                    }`}>
                      {planet.sign.element}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{planet.sign.degree.toFixed(1)}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
