import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#30363d] bg-[#0d1117] mt-16">
      <div className="content-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
              Products
            </h4>
            <ul className="space-y-2 list-none">
              <li>
                <a href="https://larun.space" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  AstroTinyML
                </a>
              </li>
              <li>
                <Link href="/" className="text-sm text-[#58a6ff] no-underline">
                  AstroData Explorer
                </Link>
              </li>
              <li>
                <a href="https://laruneng.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  SafetyForge
                </a>
              </li>
              <li>
                <a href="https://laruneng.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Solarify
                </a>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 list-none">
              <li>
                <Link href="/learning-paths" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Learning Paths
                </Link>
              </li>
              <li>
                <Link href="/exoplanet-explorer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Exoplanet Explorer
                </Link>
              </li>
              <li>
                <Link href="/discovery-lab" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Discovery Lab
                </Link>
              </li>
              <li>
                <Link href="/sky-bingo" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 list-none">
              <li>
                <Link href="/tonights-sky" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Tonight&apos;s Sky
                </Link>
              </li>
              <li>
                <Link href="/star-stories" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Star Stories
                </Link>
              </li>
              <li>
                <Link href="/meteor-showers" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Meteor Showers
                </Link>
              </li>
              <li>
                <Link href="/moon-phases" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Moon Phases
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-3">
              Company
            </h4>
            <ul className="space-y-2 list-none">
              <li>
                <a href="https://laruneng.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Larun Engineering
                </a>
              </li>
              <li>
                <a href="https://larun.space" target="_blank" rel="noopener noreferrer" className="text-sm text-[#8b949e] hover:text-[#58a6ff] no-underline transition-colors">
                  Larun.space
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#1a73e8] to-[#58a6ff] flex items-center justify-center text-white font-bold text-[10px]">
              A
            </div>
            <span className="text-sm text-[#8b949e]">
              AstroData Cosmic Explorer
            </span>
          </div>
          <p className="text-xs text-[#484f58]">
            &copy; {new Date().getFullYear()} Larun Engineering. Federation of TinyML for Space Science.
          </p>
        </div>
      </div>
    </footer>
  );
}
