"use client";
import { useState, useEffect, useMemo } from "react";
import { SKY_BINGO_OBJECTIVES } from "@/lib/data";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface BingoState {
  card: string[]; // 25 objective IDs
  marked: string[];
  score: number;
  gamesPlayed: number;
}

const INITIAL_BINGO: BingoState = {
  card: [],
  marked: [],
  score: 0,
  gamesPlayed: 0,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SkyBingoPage() {
  const [bingo, setBingo, isLoaded] = useLocalStorage<BingoState>("sky-bingo", INITIAL_BINGO);
  const [showHint, setShowHint] = useState<string | null>(null);

  const card = useMemo(() => {
    if (bingo.card.length === 25) return bingo.card;
    return shuffleArray(SKY_BINGO_OBJECTIVES.map((o) => o.id)).slice(0, 25);
  }, [bingo.card]);

  useEffect(() => {
    if (isLoaded && bingo.card.length !== 25) {
      setBingo({ ...bingo, card });
    }
  }, [isLoaded, card]);

  const objectiveMap = useMemo(() => {
    const map: Record<string, typeof SKY_BINGO_OBJECTIVES[0]> = {};
    SKY_BINGO_OBJECTIVES.forEach((o) => { map[o.id] = o; });
    return map;
  }, []);

  function toggleMark(id: string) {
    const obj = objectiveMap[id];
    if (!obj) return;

    const isMarked = bingo.marked.includes(id);
    const newMarked = isMarked
      ? bingo.marked.filter((m) => m !== id)
      : [...bingo.marked, id];
    const scoreDelta = isMarked ? -obj.points : obj.points;

    setBingo({
      ...bingo,
      marked: newMarked,
      score: bingo.score + scoreDelta,
    });
  }

  function newGame() {
    const newCard = shuffleArray(SKY_BINGO_OBJECTIVES.map((o) => o.id)).slice(0, 25);
    setBingo({
      card: newCard,
      marked: [],
      score: 0,
      gamesPlayed: bingo.gamesPlayed + 1,
    });
  }

  // Check for bingo lines
  const hasBingo = useMemo(() => {
    const grid = card.map((id) => bingo.marked.includes(id));
    // Rows
    for (let r = 0; r < 5; r++) {
      if (grid.slice(r * 5, r * 5 + 5).every(Boolean)) return true;
    }
    // Columns
    for (let c = 0; c < 5; c++) {
      if ([0, 1, 2, 3, 4].every((r) => grid[r * 5 + c])) return true;
    }
    // Diagonals
    if ([0, 6, 12, 18, 24].every((i) => grid[i])) return true;
    if ([4, 8, 12, 16, 20].every((i) => grid[i])) return true;
    return false;
  }, [card, bingo.marked]);

  const difficultyColor: Record<string, string> = {
    Easy: "badge-green",
    Medium: "badge-blue",
    Hard: "badge-orange",
    Expert: "badge-red",
  };

  if (!isLoaded) return null;

  return (
    <div className="content-container py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🎯 Sky Bingo</h1>
          <p className="text-[#8b949e]">
            Spot celestial objects and mark them off your bingo card!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-[#d4a853]">{bingo.score}</div>
            <div className="text-xs text-[#8b949e]">Points</div>
          </div>
          <button onClick={newGame} className="btn-primary">
            New Card
          </button>
        </div>
      </div>

      {hasBingo && (
        <div className="cosmic-card p-6 mb-6 border-[#d4a853]/30 bg-[#d4a853]/5 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-gold mb-2">BINGO!</h2>
          <p className="text-[#8b949e]">You completed a line! Score: {bingo.score} points</p>
          <button onClick={newGame} className="btn-gold mt-4">
            Play Again
          </button>
        </div>
      )}

      {/* Bingo Grid */}
      <div className="cosmic-card p-4 mb-6">
        <div className="grid grid-cols-5 gap-2">
          {["S", "K", "Y", "⭐", "!"].map((letter, i) => (
            <div key={i} className="text-center text-lg font-bold text-[#58a6ff] py-1">
              {letter}
            </div>
          ))}

          {card.map((id, idx) => {
            const obj = objectiveMap[id];
            if (!obj) return <div key={idx} />;
            const isMarked = bingo.marked.includes(id);

            return (
              <button
                key={idx}
                onClick={() => toggleMark(id)}
                onContextMenu={(e) => { e.preventDefault(); setShowHint(showHint === id ? null : id); }}
                className={`bingo-cell relative ${isMarked ? "marked" : ""}`}
              >
                <span className="text-lg mb-0.5">
                  {isMarked ? "✅" : obj.category === "Stars" ? "⭐" :
                    obj.category === "Planets" ? "🪐" :
                    obj.category === "Moon" ? "🌙" :
                    obj.category === "Deep Sky" ? "🌌" :
                    obj.category === "Events" ? "💫" :
                    obj.category === "Satellites" ? "🛰️" :
                    obj.category === "Constellations" ? "⭐" :
                    obj.category === "Small Bodies" ? "☄️" : "🔭"}
                </span>
                <span className="font-medium">{obj.name}</span>
                <span className={`badge mt-0.5 ${difficultyColor[obj.difficulty]}`} style={{ fontSize: "0.55rem", padding: "0.1rem 0.3rem" }}>
                  {obj.points}pt
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint display */}
      {showHint && objectiveMap[showHint] && (
        <div className="cosmic-card p-4 mb-6 border-[#58a6ff]/30">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{objectiveMap[showHint].name}</h4>
              <p className="text-sm text-[#8b949e] mt-1">{objectiveMap[showHint].description}</p>
              <p className="text-sm text-[#58a6ff] mt-2">💡 Hint: {objectiveMap[showHint].hint}</p>
            </div>
            <button onClick={() => setShowHint(null)} className="text-[#8b949e] hover:text-white">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Objectives list */}
      <div className="cosmic-card p-5">
        <h3 className="font-semibold mb-4">All Objectives ({bingo.marked.length}/{card.length} completed)</h3>
        <div className="xp-bar mb-4">
          <div className="xp-fill" style={{ width: `${(bingo.marked.length / card.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {card.map((id) => {
            const obj = objectiveMap[id];
            if (!obj) return null;
            const isMarked = bingo.marked.includes(id);
            return (
              <button
                key={id}
                onClick={() => setShowHint(showHint === id ? null : id)}
                className={`text-left p-2 rounded-lg border text-sm transition-colors ${
                  isMarked
                    ? "border-[#3fb950]/30 bg-[#3fb950]/5"
                    : "border-[#30363d] hover:border-[#30363d]"
                }`}
              >
                <span className="mr-2">{isMarked ? "✅" : "⬜"}</span>
                <span className={isMarked ? "line-through text-[#8b949e]" : ""}>{obj.name}</span>
                <span className={`badge ml-2 ${difficultyColor[obj.difficulty]}`}>
                  {obj.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
