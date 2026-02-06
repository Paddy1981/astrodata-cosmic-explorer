"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: {
    title: string;
    description: string;
    link?: string;
    quiz?: { question: string; options: string[]; correct: number; explanation: string }[];
  }[];
}

const PATHS: LearningPath[] = [
  {
    id: "stargazing-101",
    title: "Stargazing 101",
    description: "Start your journey into astronomy. Learn to navigate the night sky with your naked eye.",
    icon: "🌟",
    level: "Beginner",
    modules: [
      {
        title: "Understanding the Night Sky",
        description: "The sky appears as a dome rotating around us. Stars rise in the east and set in the west, just like the Sun. The key is learning patterns (constellations) that help you navigate.",
        quiz: [
          { question: "Why do stars appear to move across the sky?", options: ["Stars orbit Earth", "Earth rotates on its axis", "The Moon pushes them", "Wind moves them"], correct: 1, explanation: "Earth rotates once every ~24 hours, making stars appear to move from east to west." },
          { question: "What is the North Star?", options: ["The brightest star", "The star closest to Earth", "The star aligned with Earth's north pole", "A planet"], correct: 2, explanation: "Polaris (the North Star) sits very close to the north celestial pole, so it appears nearly stationary while other stars rotate around it." },
        ],
      },
      {
        title: "Constellations & Patterns",
        description: "Constellations are patterns of stars we've named. There are 88 official constellations. Start with easy ones: Orion (winter), the Big Dipper (year-round in the north), and Scorpius (summer).",
        link: "/star-stories",
        quiz: [
          { question: "How many official constellations are there?", options: ["12", "48", "88", "100"], correct: 2, explanation: "The International Astronomical Union recognizes 88 constellations that cover the entire sky." },
          { question: "Which constellation contains the famous 'belt' of three stars?", options: ["Ursa Major", "Cassiopeia", "Scorpius", "Orion"], correct: 3, explanation: "Orion's Belt is one of the most recognizable star patterns - three bright stars in a line." },
        ],
      },
      {
        title: "Moon Phases & What They Mean",
        description: "The Moon goes through a complete cycle of phases in about 29.5 days. Understanding phases helps you plan observations: new moon = best deep sky, full moon = worst for faint objects.",
        link: "/moon-phases",
        quiz: [
          { question: "How long is one complete Moon phase cycle?", options: ["7 days", "14 days", "29.5 days", "365 days"], correct: 2, explanation: "The synodic month (new moon to new moon) is about 29.53 days." },
          { question: "When is the best time for deep sky observation?", options: ["Full Moon", "New Moon", "First Quarter", "Any time"], correct: 1, explanation: "During New Moon, the sky is darkest because there's no moonlight to wash out faint objects." },
        ],
      },
      {
        title: "Planets vs Stars",
        description: "Planets don't twinkle (they show steady light), they move relative to the stars over days/weeks, and they're always found near the ecliptic (the Sun's path across the sky).",
        link: "/tonights-sky",
        quiz: [
          { question: "How can you tell a planet from a star with naked eyes?", options: ["Planets are always brighter", "Planets twinkle more", "Planets don't twinkle", "You can't tell"], correct: 2, explanation: "Stars twinkle because they're point sources of light affected by atmospheric turbulence. Planets are close enough to appear as tiny disks, so their light is steadier." },
        ],
      },
      {
        title: "Meteor Showers",
        description: "Meteors are bits of space dust burning up in our atmosphere. During a shower, Earth passes through a comet's debris trail. The Perseids (August) and Geminids (December) are the best annual showers.",
        link: "/meteor-showers",
        quiz: [
          { question: "What causes a meteor shower?", options: ["Asteroids colliding", "Earth passing through comet debris", "Solar flares", "Satellite re-entries"], correct: 1, explanation: "Comets leave trails of dust and debris in their orbits. When Earth passes through these trails, the particles burn up in our atmosphere as meteors." },
        ],
      },
    ],
  },
  {
    id: "exoplanet-science",
    title: "Exoplanet Science",
    description: "How we find planets around other stars and what makes some potentially habitable.",
    icon: "🪐",
    level: "Intermediate",
    modules: [
      {
        title: "What is an Exoplanet?",
        description: "An exoplanet is any planet outside our solar system. The first confirmed discovery around a Sun-like star was 51 Pegasi b in 1995 (Nobel Prize 2019). As of 2024, we've confirmed over 5,500 exoplanets.",
        link: "/exoplanet-explorer",
        quiz: [
          { question: "When was the first exoplanet around a Sun-like star discovered?", options: ["1969", "1985", "1995", "2009"], correct: 2, explanation: "51 Pegasi b was discovered in 1995 by Michel Mayor and Didier Queloz, who won the 2019 Nobel Prize for this work." },
        ],
      },
      {
        title: "Transit Method",
        description: "When a planet passes in front of its star (from our perspective), it blocks a tiny amount of light. By measuring this dip, we can determine the planet's size. Kepler and TESS use this method.",
        quiz: [
          { question: "What does the transit method measure?", options: ["Gravitational pull", "Light dip from the star", "Radio signals", "Planet color"], correct: 1, explanation: "When a planet transits (crosses in front of) its host star, it blocks a small fraction of the star's light. The size of the dip tells us the planet's radius." },
          { question: "Which mission found the most exoplanets using transits?", options: ["Hubble", "Voyager", "Kepler", "Apollo"], correct: 2, explanation: "NASA's Kepler mission (2009-2018) discovered over 2,600 confirmed exoplanets - more than any other mission." },
        ],
      },
      {
        title: "The Habitable Zone",
        description: "The habitable zone is the range of distances from a star where liquid water could exist on a planet's surface. Too close = too hot (water boils). Too far = too cold (water freezes). Also called the 'Goldilocks zone'.",
        quiz: [
          { question: "What is the habitable zone?", options: ["Where aliens live", "Where water can be liquid", "Where humans can breathe", "The center of a galaxy"], correct: 1, explanation: "The habitable zone is the range of orbital distances where a planet could maintain liquid water on its surface - a key ingredient for life as we know it." },
        ],
      },
      {
        title: "Spectroscopy & Atmospheres",
        description: "By analyzing the spectrum of light passing through a planet's atmosphere during transit, we can identify gases present. JWST has detected CO2, H2O, and even potential biosignatures this way.",
        link: "/discovery-lab",
        quiz: [
          { question: "How do we detect gases in an exoplanet's atmosphere?", options: ["Send a probe", "Take a photo", "Analyze light spectrum during transit", "Listen for radio waves"], correct: 2, explanation: "When starlight passes through a planet's atmosphere during transit, different molecules absorb specific wavelengths. This 'absorption spectrum' reveals the atmospheric composition." },
        ],
      },
    ],
  },
  {
    id: "stellar-evolution",
    title: "Life Cycle of Stars",
    description: "From stellar nurseries to supernovae - how stars are born, live, and die.",
    icon: "⭐",
    level: "Advanced",
    modules: [
      {
        title: "Star Formation",
        description: "Stars form in giant molecular clouds (nebulae) when gravity causes a region to collapse. As the gas compresses, it heats up until nuclear fusion ignites - a new star is born. This process takes about 10 million years for a Sun-like star.",
        quiz: [
          { question: "Where do stars form?", options: ["In empty space", "Inside other stars", "In molecular clouds/nebulae", "On planets"], correct: 2, explanation: "Stars are born in giant molecular clouds - vast regions of gas and dust. Gravity causes dense regions to collapse, eventually igniting nuclear fusion." },
        ],
      },
      {
        title: "The Main Sequence",
        description: "Once fusion begins, a star enters the 'main sequence' - its longest life phase. Our Sun has been on the main sequence for 4.6 billion years and will continue for about 5 billion more. Massive stars burn faster and die younger.",
        link: "/star-stories",
        quiz: [
          { question: "Why do massive stars die sooner than small stars?", options: ["They have less fuel", "They burn fuel much faster", "They get hit by asteroids", "Gravity destroys them"], correct: 1, explanation: "While massive stars have more fuel (hydrogen), they burn through it at a drastically higher rate. A star 10x the Sun's mass lasts only ~20 million years vs the Sun's 10 billion." },
        ],
      },
      {
        title: "Red Giants & Supergiants",
        description: "When a star exhausts its core hydrogen, it expands enormously. Sun-like stars become red giants (Aldebaran). Massive stars become red supergiants (Betelgeuse) - some so large they would engulf Jupiter's orbit.",
        quiz: [
          { question: "What happens when a star runs out of hydrogen in its core?", options: ["It immediately explodes", "It expands into a red giant", "It turns into a planet", "Nothing"], correct: 1, explanation: "When core hydrogen fusion stops, the core contracts and heats up, while the outer layers expand dramatically. The surface cools and turns red - hence 'red giant'." },
        ],
      },
      {
        title: "Stellar Deaths",
        description: "Sun-like stars shed their outer layers as planetary nebulae, leaving white dwarfs. Massive stars explode as supernovae, leaving neutron stars or black holes. A supernova can briefly outshine an entire galaxy.",
        quiz: [
          { question: "What remains after a massive star goes supernova?", options: ["Nothing", "A white dwarf", "A neutron star or black hole", "A new star"], correct: 2, explanation: "Depending on the core mass after the supernova, either a neutron star (1.4-3 solar masses) or a black hole (>3 solar masses) remains." },
        ],
      },
    ],
  },
];

interface ProgressState {
  completedModules: Record<string, number[]>; // pathId -> array of completed module indices
  quizScores: Record<string, number[]>;
}

const INITIAL_PROGRESS: ProgressState = {
  completedModules: {},
  quizScores: {},
};

export default function LearningPathsPage() {
  const [progress, setProgress, isLoaded] = useLocalStorage<ProgressState>("learning-progress", INITIAL_PROGRESS);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<number>(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const path = PATHS.find((p) => p.id === activePath);

  function completeModule(pathId: string, moduleIdx: number) {
    const completed = progress.completedModules[pathId] || [];
    if (!completed.includes(moduleIdx)) {
      setProgress({
        ...progress,
        completedModules: {
          ...progress.completedModules,
          [pathId]: [...completed, moduleIdx],
        },
      });
    }
  }

  function submitQuiz() {
    setQuizSubmitted(true);
    if (path) {
      completeModule(path.id, activeModule);
    }
  }

  const levelColors: Record<string, string> = {
    Beginner: "badge-green",
    Intermediate: "badge-blue",
    Advanced: "badge-purple",
  };

  if (!isLoaded) return null;

  // Path selection view
  if (!activePath || !path) {
    return (
      <div className="content-container py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">📚 Learning Paths</h1>
        <p className="text-[#8b949e] mb-8">
          Structured courses from beginner to advanced. Complete quizzes to track your progress.
        </p>

        <div className="space-y-4">
          {PATHS.map((p) => {
            const completed = (progress.completedModules[p.id] || []).length;
            const total = p.modules.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <button
                key={p.id}
                onClick={() => { setActivePath(p.id); setActiveModule(0); setQuizMode(false); setQuizSubmitted(false); setQuizAnswers({}); }}
                className="w-full text-left cosmic-card p-6 hover:border-[#1a73e8]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <span className={`badge ${levelColors[p.level]}`}>{p.level}</span>
                    </div>
                    <p className="text-sm text-[#8b949e] mb-3">{p.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 xp-bar">
                        <div className="xp-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[#8b949e]">{completed}/{total} modules</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Active path view
  const module = path.modules[activeModule];
  const isCompleted = (progress.completedModules[path.id] || []).includes(activeModule);

  return (
    <div className="content-container py-8 animate-fade-in">
      <button
        onClick={() => setActivePath(null)}
        className="text-sm text-[#58a6ff] hover:underline mb-4 inline-block"
      >
        &larr; Back to all paths
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{path.icon}</span>
        <div>
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <span className={`badge ${levelColors[path.level]}`}>{path.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Module list */}
        <div>
          <h3 className="text-sm font-semibold text-[#8b949e] mb-3">Modules</h3>
          <div className="space-y-2">
            {path.modules.map((m, i) => {
              const done = (progress.completedModules[path.id] || []).includes(i);
              return (
                <button
                  key={i}
                  onClick={() => { setActiveModule(i); setQuizMode(false); setQuizSubmitted(false); setQuizAnswers({}); }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    i === activeModule
                      ? "bg-[#1a73e8]/10 border border-[#1a73e8]"
                      : "border border-[#30363d] hover:border-[#30363d]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${done ? "text-[#3fb950]" : "text-[#484f58]"}`}>
                      {done ? "✅" : `${i + 1}.`}
                    </span>
                    <span className={done ? "text-[#8b949e]" : ""}>{m.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="cosmic-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-[#8b949e]">Module {activeModule + 1} of {path.modules.length}</span>
                <h2 className="text-xl font-bold mt-1">{module.title}</h2>
              </div>
              {isCompleted && <span className="badge badge-green">Completed</span>}
            </div>

            {!quizMode ? (
              <>
                <p className="text-[#c9d1d9] leading-relaxed mb-6">{module.description}</p>

                {module.link && (
                  <Link href={module.link} className="btn-secondary mb-4 inline-flex no-underline">
                    Try it out →
                  </Link>
                )}

                <div className="flex gap-3 mt-4">
                  {module.quiz && module.quiz.length > 0 && (
                    <button onClick={() => setQuizMode(true)} className="btn-primary">
                      Take Quiz ({module.quiz.length} questions)
                    </button>
                  )}
                  {!module.quiz && (
                    <button onClick={() => completeModule(path.id, activeModule)} className="btn-primary">
                      Mark as Complete
                    </button>
                  )}
                  {activeModule < path.modules.length - 1 && (
                    <button
                      onClick={() => { setActiveModule(activeModule + 1); setQuizMode(false); setQuizSubmitted(false); setQuizAnswers({}); }}
                      className="btn-secondary"
                    >
                      Next Module →
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {module.quiz?.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-medium mb-3">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        let className = "quiz-option";
                        if (quizSubmitted) {
                          if (oi === q.correct) className += " correct";
                          else if (quizAnswers[qi] === oi) className += " wrong";
                        }
                        return (
                          <button
                            key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            className={`${className} w-full text-left text-sm ${
                              !quizSubmitted && quizAnswers[qi] === oi ? "border-[#1a73e8] bg-[#1a73e8]/5" : ""
                            }`}
                          >
                            <span className="mr-2 text-[#8b949e]">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-sm text-[#8b949e] mt-2 p-2 rounded bg-[#0d1117]">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < (module.quiz?.length || 0)}
                    className={`btn-primary ${Object.keys(quizAnswers).length < (module.quiz?.length || 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Submit Answers
                  </button>
                ) : (
                  <div className="p-4 rounded-lg border border-[#3fb950]/30 bg-[#3fb950]/5">
                    <p className="font-medium text-[#3fb950]">
                      Score: {module.quiz?.filter((q, i) => quizAnswers[i] === q.correct).length}/{module.quiz?.length}
                    </p>
                    {activeModule < path.modules.length - 1 && (
                      <button
                        onClick={() => { setActiveModule(activeModule + 1); setQuizMode(false); setQuizSubmitted(false); setQuizAnswers({}); }}
                        className="btn-primary mt-3"
                      >
                        Next Module →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
