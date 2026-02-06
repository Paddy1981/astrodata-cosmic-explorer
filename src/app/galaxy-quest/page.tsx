"use client";
import { useState, useCallback } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Galaxy {
  id: number;
  type: "Spiral" | "Elliptical" | "Irregular" | "Lenticular";
  description: string;
  features: string[];
  funFact: string;
  visualShape: string;
  color: string;
}

const GALAXY_TYPES = [
  {
    type: "Spiral" as const,
    description: "Flat disk with curved arms radiating from a central bulge. Contains gas, dust, and young blue stars in the arms.",
    features: ["Disk shape", "Spiral arms", "Central bulge", "Active star formation", "Blue regions in arms"],
    funFact: "The Milky Way is a barred spiral galaxy. About 77% of observed galaxies are spirals.",
    visualShape: "🌀",
    color: "#58a6ff",
  },
  {
    type: "Elliptical" as const,
    description: "Smooth, featureless ellipsoidal shape. Contains mostly old red/yellow stars with very little gas and dust.",
    features: ["Smooth shape", "No arms or disk", "Old stars", "Little star formation", "Red/yellow color"],
    funFact: "The largest known galaxies are ellipticals. IC 1101 is 6 million light-years across!",
    visualShape: "🔴",
    color: "#f0883e",
  },
  {
    type: "Irregular" as const,
    description: "No distinct shape. Often result from gravitational interactions. Rich in gas and young stars.",
    features: ["No regular shape", "Chaotic structure", "Lots of gas", "Active star formation", "Often interacting"],
    funFact: "The Large and Small Magellanic Clouds (visible from the Southern Hemisphere) are irregular galaxies orbiting the Milky Way.",
    visualShape: "💠",
    color: "#bc8cff",
  },
  {
    type: "Lenticular" as const,
    description: "A lens-shaped galaxy between spiral and elliptical. Has a disk and bulge but no spiral arms.",
    features: ["Disk + bulge", "No spiral arms", "Little gas/dust", "Aging star population", "Transition type"],
    funFact: "Lenticular galaxies are thought to be 'used up' spirals that have consumed most of their gas.",
    visualShape: "🔵",
    color: "#39d2c0",
  },
];

function generateGalaxy(seed: number): Galaxy {
  const idx = seed % GALAXY_TYPES.length;
  const template = GALAXY_TYPES[idx];
  return { id: seed, ...template };
}

interface QuestState {
  score: number;
  streak: number;
  bestStreak: number;
  total: number;
  correct: number;
}

const INITIAL_QUEST: QuestState = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  total: 0,
  correct: 0,
};

export default function GalaxyQuestPage() {
  const [state, setState, isLoaded] = useLocalStorage<QuestState>("galaxy-quest", INITIAL_QUEST);
  const [currentGalaxy, setCurrentGalaxy] = useState<Galaxy | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [showLearn, setShowLearn] = useState(true);

  const nextGalaxy = useCallback(() => {
    const seed = Date.now() + Math.floor(Math.random() * 1000);
    setCurrentGalaxy(generateGalaxy(seed));
    setFeedback(null);
  }, []);

  const guess = useCallback((type: string) => {
    if (!currentGalaxy || feedback) return;
    const isCorrect = type === currentGalaxy.type;
    setFeedback({ correct: isCorrect, answer: currentGalaxy.type });

    setState((prev) => ({
      score: prev.score + (isCorrect ? 10 + prev.streak * 2 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));
  }, [currentGalaxy, feedback, setState]);

  if (!isLoaded) return null;

  return (
    <div className="content-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🌌 Galaxy Quest</h1>
          <p className="text-[#8b949e]">Learn to classify galaxies by their shape and features</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-[#d4a853]">{state.score}</div>
            <div className="text-xs text-[#8b949e]">Score</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#3fb950]">{state.streak}</div>
            <div className="text-xs text-[#8b949e]">Streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#58a6ff]">
              {state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0}%
            </div>
            <div className="text-xs text-[#8b949e]">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Learning section toggle */}
      <button
        onClick={() => setShowLearn(!showLearn)}
        className="btn-secondary mb-6 text-sm"
      >
        {showLearn ? "Hide" : "Show"} Galaxy Types Guide
      </button>

      {showLearn && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {GALAXY_TYPES.map((g) => (
            <div key={g.type} className="cosmic-card p-4">
              <div className="text-center text-4xl mb-2">{g.visualShape}</div>
              <h3 className="font-semibold text-center mb-2" style={{ color: g.color }}>
                {g.type}
              </h3>
              <p className="text-xs text-[#8b949e] mb-3">{g.description}</p>
              <div className="space-y-1">
                {g.features.map((f) => (
                  <div key={f} className="text-xs flex gap-1.5">
                    <span className="text-[#58a6ff]">•</span>
                    <span className="text-[#c9d1d9]">{f}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#d4a853] mt-3 italic">{g.funFact}</p>
            </div>
          ))}
        </div>
      )}

      {/* Game area */}
      <div className="cosmic-card p-8 mb-6 text-center min-h-[280px] flex flex-col items-center justify-center">
        {!currentGalaxy ? (
          <div>
            <div className="text-6xl mb-4">🌌</div>
            <h2 className="text-xl font-semibold mb-2">Ready to Classify Galaxies?</h2>
            <p className="text-[#8b949e] mb-6 max-w-md mx-auto">
              You&apos;ll be shown a galaxy with its features. Classify it as Spiral, Elliptical, Irregular, or Lenticular.
            </p>
            <button onClick={nextGalaxy} className="btn-primary text-base px-8 py-3">
              Start Classifying
            </button>
          </div>
        ) : (
          <div className="animate-slide-up w-full max-w-lg">
            {/* Galaxy display */}
            <div className="text-6xl mb-3">{currentGalaxy.visualShape}</div>
            <h3 className="text-lg font-semibold mb-2">Galaxy #{currentGalaxy.id.toString().slice(-4)}</h3>

            <div className="text-left bg-[#0d1117] rounded-lg p-4 mb-4">
              <div className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Observed Features</div>
              <ul className="space-y-1">
                {currentGalaxy.features.map((f, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-[#58a6ff]">→</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Choices */}
            {!feedback ? (
              <div className="grid grid-cols-2 gap-3">
                {GALAXY_TYPES.map((g) => (
                  <button
                    key={g.type}
                    onClick={() => guess(g.type)}
                    className="p-3 rounded-lg border border-[#30363d] hover:border-[#1a73e8] transition-colors text-left"
                  >
                    <span className="text-2xl mr-2">{g.visualShape}</span>
                    <span className="font-medium">{g.type}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${feedback.correct ? "border-[#3fb950] bg-[#3fb950]/10" : "border-[#f85149] bg-[#f85149]/10"}`}>
                <div className="text-2xl mb-2">{feedback.correct ? "✅" : "❌"}</div>
                <p className="font-medium">
                  {feedback.correct ? "Correct!" : `Incorrect - it was ${feedback.answer}`}
                </p>
                <p className="text-sm text-[#8b949e] mt-2">{currentGalaxy.description}</p>
                <p className="text-sm text-[#d4a853] mt-1 italic">{currentGalaxy.funFact}</p>
                <button onClick={nextGalaxy} className="btn-primary mt-4">
                  Next Galaxy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
