import { useState, useEffect, useCallback } from "react";
import type { GameStats } from "../types/GameStats";
import { achievements, type Achievement } from "../data/achievements";
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
  lastPlayedDay: null,
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

export interface GameRecordResult {
  scoreEarned: number;
  newAchievements: Achievement[];
  personaWasNew: boolean;
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(loadStats);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // day = giorno UTC del daily; null = practice (non tocca streak né score)
  const recordGame = useCallback(
    (
      won: boolean,
      attempts: number,
      personaId: number,
      day: number | null
    ): GameRecordResult => {
      const isDaily = day !== null;
      // Calcola fuori da setStats per evitare doppie esecuzioni in StrictMode
      let nextStreak = stats.currentStreak;
      if (isDaily) {
        nextStreak = won ? (stats.lastPlayedDay === day - 1 ? stats.currentStreak + 1 : 1) : 0;
      }
      const scoreEarned = won && isDaily ? calculateScore(attempts, nextStreak) : 0;
      const personaWasNew = won && !stats.unlockedPersonaIds.includes(personaId);

      let newAchievements: Achievement[] = [];
      setStats((prev) => {
        const next: GameStats = {
          ...prev,
          guessDistribution: [...prev.guessDistribution],
          unlockedPersonaIds: [...prev.unlockedPersonaIds],
        };
        next.gamesPlayed++;
        if (won) {
          next.gamesWon++;
          next.guessDistribution[Math.min(attempts - 1, 5)]++;
          if (!next.unlockedPersonaIds.includes(personaId)) {
            next.unlockedPersonaIds.push(personaId);
          }
        }
        if (isDaily) {
          next.currentStreak = nextStreak;
          next.maxStreak = Math.max(next.maxStreak, nextStreak);
          next.totalScore += scoreEarned;
          next.lastPlayedDay = day;
        }
        const before = new Set(prev.unlockedAchievements);
        next.unlockedAchievements = computeAchievements(next);
        newAchievements = achievements.filter(
          (a) => next.unlockedAchievements.includes(a.id) && !before.has(a.id)
        );
        return next;
      });

      return { scoreEarned, newAchievements, personaWasNew };
    },
    [stats.currentStreak, stats.lastPlayedDay, stats.unlockedPersonaIds]
  );

  return { stats, recordGame };
}
