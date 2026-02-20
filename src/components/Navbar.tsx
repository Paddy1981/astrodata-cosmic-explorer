"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "Explore",
    items: [
      { href: "/tonights-sky", label: "Tonight's Sky", icon: "🌃" },
      { href: "/moon-phases", label: "Moon Phases", icon: "🌙" },
      { href: "/meteor-showers", label: "Meteor Showers", icon: "☄️" },
      { href: "/celestial-calendar", label: "Celestial Calendar", icon: "📅" },
      { href: "/cosmic-postcard", label: "Cosmic Postcard", icon: "✉️" },
    ],
  },
  {
    label: "Discover",
    items: [
      { href: "/exoplanet-explorer", label: "Exoplanet Explorer", icon: "🪐" },
      { href: "/star-stories", label: "Star Stories", icon: "🌟" },
      { href: "/discovery-lab", label: "Discovery Lab", icon: "🔬" },
      { href: "/asteroid-tracker", label: "Asteroid Tracker", icon: "☄️" },
      { href: "/space-infrastructure", label: "Space Infrastructure", icon: "🌍" },
    ],
  },
  {
    label: "Play",
    items: [
      { href: "/sky-bingo", label: "Sky Bingo", icon: "🎯" },
      { href: "/planet-hunter", label: "Planet Hunter", icon: "🎮" },
      { href: "/galaxy-quest", label: "Galaxy Quest", icon: "🌌" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/learning-paths", label: "Learning Paths", icon: "📚" },
      { href: "/birth-chart", label: "Cultural Astronomy", icon: "🗺️" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md">
      <div className="content-container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#58a6ff] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-white font-semibold text-lg">
              AstroData
            </span>
            <span className="text-[#58a6ff] text-xs font-medium hidden sm:inline">
              by Larun
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map((section) => (
              <div
                key={section.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(section.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="px-3 py-2 text-sm text-[#8b949e] hover:text-white transition-colors rounded-md hover:bg-[#161b22]">
                  {section.label}
                </button>
                {openDropdown === section.label && (
                  <div className="absolute top-full left-0 mt-1 py-2 bg-[#161b22] border border-[#30363d] rounded-12 shadow-xl min-w-[220px] rounded-xl">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm no-underline transition-colors ${
                          pathname === item.href
                            ? "text-[#58a6ff] bg-[#1a73e8]/10"
                            : "text-[#c9d1d9] hover:text-white hover:bg-[#1c2333]"
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://larun.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex btn-secondary text-xs px-3 py-1.5 no-underline"
            >
              Larun.space
            </a>
            <a
              href="https://laruneng.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex btn-primary text-xs px-3 py-1.5 no-underline"
            >
              LarunEng.com
            </a>
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-[#8b949e] hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#30363d] bg-[#0d1117] max-h-[70vh] overflow-y-auto">
          <div className="content-container py-4 space-y-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
                  {section.label}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline ${
                        pathname === item.href
                          ? "text-[#58a6ff] bg-[#1a73e8]/10"
                          : "text-[#c9d1d9] hover:text-white hover:bg-[#1c2333]"
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2 border-t border-[#30363d]">
              <a
                href="https://larun.space"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs flex-1 justify-center no-underline"
              >
                Larun.space
              </a>
              <a
                href="https://laruneng.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs flex-1 justify-center no-underline"
              >
                LarunEng.com
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
