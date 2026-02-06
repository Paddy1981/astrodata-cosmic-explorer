"use client";
import { useState, useMemo } from "react";
import { getMoonPhase } from "@/lib/astronomy";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MoonVisual({ illumination, phase }: { illumination: number; phase: number }) {
  const isWaxing = phase < 0.5;
  const displayIllum = illumination * 100;

  return (
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full bg-[#1c2333] shadow-inner overflow-hidden">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at ${isWaxing ? 60 - displayIllum * 0.3 : 40 + displayIllum * 0.3}% 50%, #f5d799 0%, #d4a853 ${displayIllum}%, transparent ${displayIllum + 5}%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function MoonPhasesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number; phase: ReturnType<typeof getMoonPhase> }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d, 12);
      days.push({ day: d, phase: getMoonPhase(date) });
    }

    return { firstDay, days };
  }, [year, month]);

  const today = useMemo(() => getMoonPhase(now), []);
  const nextFull = useMemo(() => {
    for (let i = 0; i < 35; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const p = getMoonPhase(d);
      if (p.phaseName === "Full Moon") return { date: d, daysAway: i };
    }
    return null;
  }, []);

  const nextNew = useMemo(() => {
    for (let i = 0; i < 35; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const p = getMoonPhase(d);
      if (p.phaseName === "New Moon") return { date: d, daysAway: i };
    }
    return null;
  }, []);

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🌙 Moon Phases</h1>
      <p className="text-[#8b949e] mb-8">Track the lunar cycle and plan your observations</p>

      {/* Current Moon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="cosmic-card p-6 flex items-center gap-4">
          <MoonVisual illumination={today.illumination} phase={today.phase} />
          <div>
            <div className="text-sm text-[#8b949e]">Tonight</div>
            <div className="text-lg font-semibold">{today.emoji} {today.phaseName}</div>
            <div className="text-xs text-[#484f58]">{Math.round(today.illumination * 100)}% illuminated</div>
          </div>
        </div>

        {nextFull && (
          <div className="cosmic-card p-6 flex items-center gap-4">
            <div className="text-4xl">🌕</div>
            <div>
              <div className="text-sm text-[#8b949e]">Next Full Moon</div>
              <div className="text-lg font-semibold">
                {nextFull.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-[#484f58]">{nextFull.daysAway} days away</div>
            </div>
          </div>
        )}

        {nextNew && (
          <div className="cosmic-card p-6 flex items-center gap-4">
            <div className="text-4xl">🌑</div>
            <div>
              <div className="text-sm text-[#8b949e]">Next New Moon</div>
              <div className="text-lg font-semibold">
                {nextNew.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-xs text-[#484f58]">{nextNew.daysAway} days away</div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (month === 0) { setMonth(11); setYear(year - 1); }
            else setMonth(month - 1);
          }}
          className="btn-secondary px-3 py-1.5 text-sm"
        >
          &larr; Prev
        </button>
        <h2 className="text-xl font-semibold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={() => {
            if (month === 11) { setMonth(0); setYear(year + 1); }
            else setMonth(month + 1);
          }}
          className="btn-secondary px-3 py-1.5 text-sm"
        >
          Next &rarr;
        </button>
      </div>

      {/* Calendar grid */}
      <div className="cosmic-card p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[500px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs text-[#8b949e] font-medium py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for first day offset */}
          {Array.from({ length: calendarDays.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {calendarDays.days.map(({ day, phase }) => {
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <div
                key={day}
                className={`text-center p-2 rounded-lg border transition-colors ${
                  isToday
                    ? "border-[#1a73e8] bg-[#1a73e8]/10"
                    : "border-transparent hover:bg-[#161b22]"
                }`}
              >
                <div className={`text-xs mb-1 ${isToday ? "text-[#58a6ff] font-bold" : "text-[#8b949e]"}`}>
                  {day}
                </div>
                <div className="text-xl">{phase.emoji}</div>
                <div className="text-[10px] text-[#484f58] mt-0.5">
                  {Math.round(phase.illumination * 100)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Moon phase guide */}
      <div className="mt-8 cosmic-card p-5">
        <h3 className="font-semibold mb-4">Moon Phase Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🌑", name: "New Moon", tip: "Best for deep-sky observation - no moonlight interference" },
            { emoji: "🌓", name: "First Quarter", tip: "Excellent for viewing lunar craters along the terminator line" },
            { emoji: "🌕", name: "Full Moon", tip: "Worst for stargazing but great for admiring the Moon itself" },
            { emoji: "🌗", name: "Last Quarter", tip: "Good for early-morning deep sky and the Moon rises at midnight" },
          ].map((p) => (
            <div key={p.name} className="text-center">
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className="font-medium text-sm mb-1">{p.name}</div>
              <p className="text-xs text-[#8b949e]">{p.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
