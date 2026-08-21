export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // index 0 = vinto al 1° tentativo, ecc.
  totalScore: number;
  unlockedPersonaIds: number[];
  unlockedAchievements: string[];
  lastPlayedDay: number | null; // giorno UTC dell'ultimo daily giocato (per la streak)
}
