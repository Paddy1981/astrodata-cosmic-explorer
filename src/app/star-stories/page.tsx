"use client";
import { useState } from "react";
import { STAR_STORIES } from "@/lib/data";

export default function StarStoriesPage() {
  const [selectedStar, setSelectedStar] = useState(0);
  const [selectedCulture, setSelectedCulture] = useState(0);

  const star = STAR_STORIES[selectedStar];
  const culture = star.cultures[selectedCulture];

  return (
    <div className="content-container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">🌟 Star Stories</h1>
      <p className="text-[#8b949e] mb-8">
        How different cultures saw the same stars - mythology meets science
      </p>

      {/* Star selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {STAR_STORIES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => { setSelectedStar(i); setSelectedCulture(0); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === selectedStar
                ? "bg-[#1a73e8] text-white"
                : "bg-[#1c2333] text-[#8b949e] hover:text-white border border-[#30363d]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Star info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Star data */}
        <div className="cosmic-card p-5">
          <div className="text-center mb-4">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3"
              style={{
                background: `radial-gradient(circle at 40% 40%, #fff8e0, ${
                  star.spectralType.startsWith("M") ? "#ff6644" :
                  star.spectralType.startsWith("K") ? "#ffaa44" :
                  star.spectralType.startsWith("G") ? "#ffdd44" :
                  star.spectralType.startsWith("F") ? "#ffffcc" :
                  star.spectralType.startsWith("A") ? "#ccddff" :
                  star.spectralType.startsWith("B") ? "#88aaff" : "#ffffff"
                })`,
                boxShadow: `0 0 30px ${
                  star.spectralType.startsWith("M") ? "rgba(255,100,68,0.3)" :
                  star.spectralType.startsWith("A") ? "rgba(150,180,255,0.3)" :
                  "rgba(255,220,100,0.3)"
                }`,
              }}
            />
            <h2 className="text-xl font-bold">{star.name}</h2>
            <p className="text-sm text-[#8b949e]">{star.scientificName}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Constellation</span>
              <span className="font-medium">{star.constellation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Magnitude</span>
              <span className="font-medium">{star.magnitude}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Distance</span>
              <span className="font-medium">{star.distance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b949e]">Spectral Type</span>
              <span className="font-mono badge badge-blue">{star.spectralType}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#30363d]">
            <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Scientific Facts
            </h4>
            <ul className="space-y-2">
              {star.scientificFacts.map((fact, i) => (
                <li key={i} className="text-xs text-[#c9d1d9] flex gap-2">
                  <span className="text-[#58a6ff] flex-shrink-0">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Cultural stories */}
        <div className="lg:col-span-2">
          {/* Culture tabs */}
          <div className="tab-nav overflow-x-auto">
            {star.cultures.map((c, i) => (
              <button
                key={c.culture}
                onClick={() => setSelectedCulture(i)}
                className={`tab-btn whitespace-nowrap ${i === selectedCulture ? "active" : ""}`}
              >
                {c.culture}
              </button>
            ))}
          </div>

          {/* Story content */}
          <div className="cosmic-card p-6 animate-fade-in" key={`${selectedStar}-${selectedCulture}`}>
            <div className="mb-4">
              <span className="badge badge-gold mb-2 inline-block">{culture.culture} Tradition</span>
              <h3 className="text-2xl font-bold mb-1">
                &ldquo;{culture.name}&rdquo;
              </h3>
              <p className="text-sm text-[#8b949e]">
                {culture.culture} name for {star.name}
              </p>
            </div>

            <p className="text-[#c9d1d9] leading-relaxed text-base">
              {culture.story}
            </p>

            <div className="mt-6 pt-4 border-t border-[#30363d]">
              <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                Cultural Context
              </h4>
              <p className="text-xs text-[#8b949e]">
                The same star was known by different names across civilizations, reflecting each culture&apos;s
                unique relationship with the night sky. These stories were used for navigation, agriculture,
                spirituality, and passing down knowledge through generations.
              </p>
            </div>
          </div>

          {/* All cultures quick view */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {star.cultures.map((c, i) => (
              <button
                key={c.culture}
                onClick={() => setSelectedCulture(i)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  i === selectedCulture
                    ? "border-[#1a73e8]/50 bg-[#1a73e8]/5"
                    : "border-[#30363d] hover:border-[#30363d]"
                }`}
              >
                <div className="text-xs text-[#58a6ff] font-medium">{c.culture}</div>
                <div className="font-medium text-sm">{c.name}</div>
                <p className="text-xs text-[#8b949e] mt-1 line-clamp-2">{c.story.slice(0, 100)}...</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
