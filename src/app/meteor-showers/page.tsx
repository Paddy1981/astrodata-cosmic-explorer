"use client";
import { useMemo } from "react";
import { METEOR_SHOWERS } from "@/lib/data";

export default function MeteorShowersPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const sortedShowers = useMemo(() => {
    return [...METEOR_SHOWERS].sort((a, b) => {
      const aMonth = a.peakDate[0];
      const bMonth = b.peakDate[0];
      const aDay = a.peakDate[1];
      const bDay = b.peakDate[1];
      return aMonth !== bMonth ? aMonth - bMonth : aDay - bDay;
    });
  }, []);

  const nextShower = useMemo(() => {
    return sortedShowers.find((s) => {
      const [m, d] = s.peakDate;
      return m > currentMonth || (m === currentMonth && d >= currentDay);
    }) || sortedShowers[0];
  }, [sortedShowers, currentMonth, currentDay]);

  function daysUntil(shower: typeof METEOR_SHOWERS[0]) {
    const [m, d] = shower.peakDate;
    let target = new Date(now.getFullYear(), m - 1, d);
    if (target < now) target = new Date(now.getFullYear() + 1, m - 1, d);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  function getIntensityColor(zhr: number): string {
    if (zhr >= 100) return "badge-gold";
    if (zhr >= 50) return "badge-orange";
    if (zhr >= 20) return "badge-blue";
    return "badge-purple";
  }

  function getIntensityLabel(zhr: number): string {
    if (zhr >= 100) return "Spectacular";
    if (zhr >= 50) return "Strong";
    if (zhr >= 20) return "Moderate";
    return "Gentle";
  }

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">☄️ Meteor Showers</h1>
      <p className="text-[#8b949e] mb-8">
        Your complete guide to this year&apos;s meteor showers with peak dates and viewing tips
      </p>

      {/* Next shower highlight */}
      {nextShower && (
        <div className="cosmic-card p-6 mb-8 border-[#d4a853]/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="badge badge-gold mb-2 inline-block">Up Next</span>
              <h2 className="text-2xl font-bold mb-1">{nextShower.name}</h2>
              <p className="text-[#8b949e] text-sm mb-2">{nextShower.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-[#8b949e]">
                  Peak: <span className="text-white font-medium">{nextShower.peak}</span>
                </span>
                <span className="text-[#8b949e]">
                  Rate: <span className="text-white font-medium">{nextShower.zhr}/hr</span>
                </span>
                <span className="text-[#8b949e]">
                  Speed: <span className="text-white font-medium">{nextShower.speed} km/s</span>
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-4xl font-bold text-[#d4a853]">{daysUntil(nextShower)}</div>
              <div className="text-sm text-[#8b949e]">days away</div>
            </div>
          </div>
        </div>
      )}

      {/* All showers */}
      <div className="space-y-3">
        {sortedShowers.map((shower) => {
          const days = daysUntil(shower);
          const isPast = shower.peakDate[0] < currentMonth ||
            (shower.peakDate[0] === currentMonth && shower.peakDate[1] < currentDay);
          const isActive = days <= 3 && days >= 0;

          return (
            <div
              key={shower.name}
              className={`cosmic-card p-5 ${
                isActive ? "border-[#3fb950]/30" : isPast ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{shower.name}</h3>
                    <span className={`badge ${getIntensityColor(shower.zhr)}`}>
                      {getIntensityLabel(shower.zhr)}
                    </span>
                    {isActive && <span className="badge badge-green">Active Now!</span>}
                    {isPast && <span className="badge badge-red">Passed</span>}
                  </div>

                  <p className="text-sm text-[#8b949e] mb-3">{shower.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#484f58]">Peak</span>
                      <div className="font-medium text-white">{shower.peak}</div>
                    </div>
                    <div>
                      <span className="text-[#484f58]">Rate (ZHR)</span>
                      <div className="font-medium text-white">{shower.zhr} meteors/hr</div>
                    </div>
                    <div>
                      <span className="text-[#484f58]">Speed</span>
                      <div className="font-medium text-white">{shower.speed} km/s</div>
                    </div>
                    <div>
                      <span className="text-[#484f58]">Parent</span>
                      <div className="font-medium text-white">{shower.parentBody}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#8b949e]">
                    <span className="text-[#58a6ff]">Radiant:</span> {shower.radiant} &middot;{" "}
                    <span className="text-[#58a6ff]">Best viewing:</span> {shower.bestViewing}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  {!isPast && (
                    <>
                      <div className="text-2xl font-bold text-white">{days}</div>
                      <div className="text-xs text-[#8b949e]">days</div>
                    </>
                  )}
                  {/* ZHR visual bar */}
                  <div className="mt-2 w-24 ml-auto">
                    <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1a73e8] to-[#d4a853]"
                        style={{ width: `${Math.min(100, (shower.zhr / 150) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewing tips */}
      <div className="cosmic-card p-5 mt-8">
        <h3 className="font-semibold mb-4">Meteor Viewing Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: "🌑", title: "Dark skies", tip: "Get away from city lights. Even a short drive helps enormously." },
            { icon: "👁️", title: "Let eyes adapt", tip: "Give your eyes 20-30 minutes to adapt to darkness. Avoid phone screens." },
            { icon: "🛋️", title: "Get comfortable", tip: "Lie on a blanket or reclining chair. Meteors can appear anywhere in the sky." },
            { icon: "⏰", title: "Timing matters", tip: "Most showers peak after midnight when your location faces into the debris stream." },
          ].map((tip) => (
            <div key={tip.title} className="flex gap-3">
              <span className="text-2xl flex-shrink-0">{tip.icon}</span>
              <div>
                <div className="font-medium text-sm mb-0.5">{tip.title}</div>
                <p className="text-xs text-[#8b949e]">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
