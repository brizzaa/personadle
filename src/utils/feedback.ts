// Logica di confronto condivisa tra GameBoard, PersonaModal e tastiera.
// I nomi vengono normalizzati (senza diacritici, lowercase) così "Arsène" è digitabile come "arsene".

export type TileStatus = "correct" | "present" | "absent";

export const normalizeName = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const getRowStatuses = (guess: string, target: string): TileStatus[] => {
  const guessChars = normalizeName(guess).split("");
  const targetChars = normalizeName(target).split("");
  const result: TileStatus[] = Array(guessChars.length).fill("absent");
  const targetUsed = Array(targetChars.length).fill(false);

  // Prima passata: posizioni corrette
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = "correct";
      targetUsed[i] = true;
    }
  }

  // Seconda passata: presenti ma in posizione sbagliata
  for (let i = 0; i < guessChars.length; i++) {
    if (result[i] === "correct") continue;
    for (let j = 0; j < targetChars.length; j++) {
      if (!targetUsed[j] && guessChars[i] === targetChars[j]) {
        result[i] = "present";
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
};

const statusEmoji: Record<TileStatus, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
};

export const getShareEmoji = (guess: string, target: string): string =>
  getRowStatuses(guess, target)
    .map((s) => statusEmoji[s])
    .join("");
