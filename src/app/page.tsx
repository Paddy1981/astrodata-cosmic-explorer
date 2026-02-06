"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMoonPhase } from "@/lib/astronomy";

const FEATURE_SECTIONS = [
  {
    title: "Explore the Sky",
    description: "Real-time tools for tonight's stargazing adventure",
    gradient: "from-[#1a73e8] to-[#58a6ff]",
    features: [
      { href: "/tonights-sky", icon: "🌃", label: "Tonight's Sky", desc: "What's visible right now from your location", badge: "Live" },
      { href: "/moon-phases", icon: "🌙", label: "Moon Phases", desc: "Current phase, calendar & lunar tracking", badge: null },
      { href: "/meteor-showers", icon: "☄️", label: "Meteor Showers", desc: "Upcoming showers with peak dates & tips", badge: null },
      { href: "/celestial-calendar", icon: "📅", label: "Celestial Calendar", desc: "Planetary positions for any date", badge: null },
      { href: "/cosmic-postcard", icon: "✉️", label: "Cosmic Postcard", desc: "How long would a message take to reach the stars?", badge: "Fun" },
    ],
  },
  {
    title: "Discover & Research",
    description: "Dive deep into real astronomical data and make discoveries",
    gradient: "from-[#bc8cff] to-[#f778ba]",
    features: [
      { href: "/exoplanet-explorer", icon: "🪐", label: "Exoplanet Explorer", desc: "Browse confirmed exoplanets from NASA data", badge: "Data" },
      { href: "/star-stories", icon: "🌟", label: "Star Stories", desc: "Mythology & science of famous stars across cultures", badge: "8 Stars" },
      { href: "/discovery-lab", icon: "🔬", label: "Discovery Lab", desc: "Analyze exoplanet atmospheres with spectroscopy", badge: "Lab" },
      { href: "/asteroid-tracker", icon: "☄️", label: "Asteroid Tracker", desc: "Track near-Earth objects and assess threats", badge: "Alerts" },
    ],
  },
  {
    title: "Play & Compete",
    description: "Games that teach you astronomy while you have fun",
    gradient: "from-[#f0883e] to-[#d4a853]",
    features: [
      { href: "/sky-bingo", icon: "🎯", label: "Sky Bingo", desc: "Check off celestial objects as you spot them", badge: "25 Goals" },
      { href: "/planet-hunter", icon: "🎮", label: "Planet Hunter", desc: "Discover procedurally generated exoplanets", badge: "Game" },
      { href: "/galaxy-quest", icon: "🌌", label: "Galaxy Quest", desc: "Learn to classify galaxies by shape and type", badge: "New" },
    ],
  },
  {
    title: "Learn & Grow",
    description: "Structured learning paths from beginner to expert",
    gradient: "from-[#3fb950] to-[#39d2c0]",
    features: [
      { href: "/learning-paths", icon: "📚", label: "Learning Paths", desc: "Structured courses in astronomy fundamentals", badge: "Courses" },
      { href: "/birth-chart", icon: "🗺️", label: "Cultural Astronomy", desc: "How different cultures mapped the same sky", badge: null },
    ],
  },
];

const QUICK_STATS = [
  { value: "5,000+", label: "Known Exoplanets", icon: "🪐" },
  { value: "100B+", label: "Stars in Milky Way", icon: "⭐" },
  { value: "13.8B", label: "Years Old (Universe)", icon: "🕐" },
  { value: "93B", label: "Light-Years Observable", icon: "🔭" },
];

export default function HomePage() {
  const [moonPhase, setMoonPhase] = useState({ emoji: "🌙", phaseName: "Loading...", illumination: 0 });
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const now = new Date();
    setMoonPhase(getMoonPhase(now));
    setCurrentTime(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="content-container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a73e8]/10 border border-[#1a73e8]/20 text-[#58a6ff] text-sm mb-6">
            <span className="text-lg">{moonPhase.emoji}</span>
            <span>{moonPhase.phaseName} &middot; {Math.round(moonPhase.illumination * 100)}% illuminated</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Explore the Cosmos,{" "}
            <span className="text-gradient">the Fun Way</span>
          </h1>

          <p className="text-lg md:text-xl text-[#8b949e] max-w-2xl mx-auto mb-4">
            Your interactive astronomy learning platform. Track tonight&apos;s sky,
            discover exoplanets, play space games, and earn achievements.
          </p>

          <p className="text-sm text-[#484f58] mb-8">{currentTime}</p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/tonights-sky" className="btn-primary text-base px-6 py-3 no-underline">
              Start Exploring
            </Link>
            <Link href="/sky-bingo" className="btn-secondary text-base px-6 py-3 no-underline">
              Play Sky Bingo
            </Link>
            <a
              href="https://larun.space"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-base px-6 py-3 no-underline"
            >
              Try Larun.space AI
            </a>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="border-y border-[#30363d] bg-[#161b22]/50 py-6">
        <div className="content-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {QUICK_STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-[#8b949e]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {FEATURE_SECTIONS.map((section, sIdx) => (
        <section key={section.title} className="py-12">
          <div className="content-container">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className={`bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
                  {section.title}
                </span>
              </h2>
              <p className="text-[#8b949e]">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.features.map((feature, fIdx) => (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="feature-card no-underline group"
                  style={{
                    animationDelay: `${(sIdx * 100) + (fIdx * 80)}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl group-hover:animate-float">
                      {feature.icon}
                    </span>
                    {feature.badge && (
                      <span className="badge badge-blue">{feature.badge}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-[#58a6ff] transition-colors">
                    {feature.label}
                  </h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    {feature.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          {sIdx < FEATURE_SECTIONS.length - 1 && (
            <div className="content-container">
              <div className="section-divider" />
            </div>
          )}
        </section>
      ))}

      {/* Larun Ecosystem CTA */}
      <section className="py-16 bg-[#161b22]/50 border-t border-[#30363d]">
        <div className="content-container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Part of the{" "}
            <span className="text-brand">Larun Engineering</span>{" "}
            Ecosystem
          </h2>
          <p className="text-[#8b949e] max-w-xl mx-auto mb-8">
            AstroData Cosmic Explorer is complementary to Larun.space&apos;s AI-powered
            exoplanet detection. Learn here, discover there.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a
              href="https://larun.space"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-card p-5 no-underline text-left hover:border-[#58a6ff]"
            >
              <div className="text-2xl mb-2">🔭</div>
              <h3 className="font-semibold text-white mb-1">Larun.space</h3>
              <p className="text-xs text-[#8b949e]">
                AI exoplanet detection with 98% accuracy on NASA TESS/Kepler data
              </p>
            </a>
            <div className="cosmic-card p-5 border-[#1a73e8] bg-[#1a73e8]/5">
              <div className="text-2xl mb-2">🌌</div>
              <h3 className="font-semibold text-[#58a6ff] mb-1">AstroData Explorer</h3>
              <p className="text-xs text-[#8b949e]">
                You are here! Interactive learning, games & stargazing tools
              </p>
            </div>
            <a
              href="https://laruneng.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cosmic-card p-5 no-underline text-left hover:border-[#58a6ff]"
            >
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="font-semibold text-white mb-1">LarunEng.com</h3>
              <p className="text-xs text-[#8b949e]">
                Engineering platform for Process, Energy & Space professionals
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
