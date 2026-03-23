const BASE_SCORES = [1000, 850, 700, 550, 400, 250];

export const calculateScore = (attempts: number, streak: number): number => {
  const base = BASE_SCORES[Math.min(attempts - 1, 5)] ?? 0;
  const streakBonus = Math.max(streak - 1, 0) * 30;
  return base + streakBonus;
};
