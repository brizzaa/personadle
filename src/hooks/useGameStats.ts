import { useState, useEffect, useCallback } from "react";
import type { GameStats } from "../types/GameStats";
import { achievements } from "../data/achievements";
import { calculateScore } from "../utils/score";

const STORAGE_KEY = "personadle_stats";

const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  totalScore: 0,
  unlockedPersonaIds: [],
  unlockedAchievements: [],
};

function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

function computeAchievements(stats: GameStats): string[] {
  const current = new Set(stats.unlockedAchievements);
  for (const ach of achievements) {
    if (!current.has(ach.id) && ach.check(stats)) {
      current.add(ach.id);
    }
  }
  return Array.from(current);
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(loadStats);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  const recordGame = useCallback(
    (won: boolean, attempts: number, personaId: number): number => {
      // Calcola il punteggio fuori da setStats per evitare problemi con StrictMode
      const nextStreak = won ? stats.currentStreak + 1 : 0;
      const scoreEarned = won ? calculateScore(attempts, nextStreak) : 0;

      setStats((prev) => {
        const next: GameStats = {
          ...prev,
          guessDistribution: [...prev.guessDistribution],
          unlockedPersonaIds: [...prev.unlockedPersonaIds],
        };
        next.gamesPlayed++;
        if (won) {
          next.gamesWon++;
          next.currentStreak = nextStreak;
          next.maxStreak = Math.max(next.maxStreak, nextStreak);
          next.guessDistribution[Math.min(attempts - 1, 5)]++;
          next.totalScore += scoreEarned;
          if (!next.unlockedPersonaIds.includes(personaId)) {
            next.unlockedPersonaIds.push(personaId);
          }
        } else {
          next.currentStreak = 0;
        }
        next.unlockedAchievements = computeAchievements(next);
        return next;
      });

      return scoreEarned;
    },
    [stats.currentStreak]
  );

  return { stats, recordGame };
}
