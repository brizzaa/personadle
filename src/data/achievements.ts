import type { GameStats } from "../types/GameStats";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  check: (stats: GameStats) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: "fools-gambit",
    name: "Fool's Gambit",
    description: "Win on the first attempt.",
    icon: "zap",
    check: (s) => s.guessDistribution[0] >= 1,
  },
  {
    id: "junes-hero",
    name: "Junes Hero",
    description: "Reach a 5-game win streak.",
    icon: "flame",
    check: (s) => s.maxStreak >= 5,
  },
  {
    id: "investigation-team",
    name: "Investigation Team",
    description: "Win 10 games total.",
    icon: "search",
    check: (s) => s.gamesWon >= 10,
  },
  {
    id: "the-killer",
    name: "The Killer",
    description: "Lose 5 games.",
    icon: "skull",
    check: (s) => s.gamesPlayed - s.gamesWon >= 5,
  },
  {
    id: "midnight-channel",
    name: "Midnight Channel",
    description: "Collect 10 Personas in your Compendium.",
    icon: "tv-2",
    check: (s) => s.unlockedPersonaIds.length >= 10,
  },
  {
    id: "rainy-season",
    name: "Rainy Season",
    description: "Play 20 games.",
    icon: "cloud-rain",
    check: (s) => s.gamesPlayed >= 20,
  },
  {
    id: "velvet-room",
    name: "Velvet Room",
    description: "Reach 5,000 total score.",
    icon: "gem",
    check: (s) => s.totalScore >= 5000,
  },
  {
    id: "true-ending",
    name: "True Ending",
    description: "Unlock all other achievements.",
    icon: "eye",
    check: (s) =>
      achievements
        .filter((a) => a.id !== "true-ending")
        .every((a) => s.unlockedAchievements.includes(a.id)),
  },
];
