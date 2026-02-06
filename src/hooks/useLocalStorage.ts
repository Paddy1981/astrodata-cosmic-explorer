"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}

// XP and Achievement system
export interface UserProgress {
  xp: number;
  level: number;
  achievements: string[];
  discoveredPlanets: number;
  bingoCompleted: number;
  quizzesCompleted: number;
  storiesRead: string[];
  spectroscopyDiscoveries: string[];
}

export const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  achievements: [],
  discoveredPlanets: 0,
  bingoCompleted: 0,
  quizzesCompleted: 0,
  storiesRead: [],
  spectroscopyDiscoveries: [],
};

export function getLevel(xp: number): { level: number; xpInLevel: number; xpForNext: number } {
  // Each level requires progressively more XP
  const levelThresholds = [0, 50, 150, 300, 500, 800, 1200, 1700, 2500, 3500, 5000];
  let level = 1;
  for (let i = 1; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  const currentThreshold = levelThresholds[Math.min(level - 1, levelThresholds.length - 1)] || 0;
  const nextThreshold = levelThresholds[Math.min(level, levelThresholds.length - 1)] || currentThreshold + 1000;
  return {
    level,
    xpInLevel: xp - currentThreshold,
    xpForNext: nextThreshold - currentThreshold,
  };
}

export const LEVEL_TITLES = [
  "Stargazer",
  "Sky Watcher",
  "Cosmic Cadet",
  "Asteroid Spotter",
  "Nebula Navigator",
  "Planet Pioneer",
  "Galaxy Scout",
  "Star Commander",
  "Cosmic Sage",
  "Universe Master",
  "Celestial Legend",
];
