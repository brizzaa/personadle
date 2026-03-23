import type { Persona } from "../types/Persona";
import { useMemo } from "react";
import type React from "react";

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  maxAttempts: number;
  currentPersona: Persona;
  newGuessIndex?: number;
  shake?: boolean;
  bounceRow?: number;
}

interface GuessTileProps {
  letter: string;
  status: "correct" | "present" | "absent" | "empty";
  flipDelay?: number;
}

const statusToColor: Record<string, string> = {
  correct: "#16a34a",
  present: "#eab308",
  absent: "#4b5563",
  empty: "#d1d5db",
};

const tileBase = "min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-4 border-[#FFF424] flex-shrink-0";

const GuessTile = ({ letter, status, flipDelay }: GuessTileProps) => {
  if (flipDelay !== undefined) {
    return (
      <div
        className={`${tileBase} flip-reveal-animation`}
        style={{
          "--tile-color": statusToColor[status] ?? "#4b5563",
          animationDelay: `${flipDelay}ms`,
        } as React.CSSProperties}
      >
        {letter}
      </div>
    );
  }

  const getStatusBg = () => {
    switch (status) {
      case "correct": return "bg-green-600 text-white";
      case "present": return "bg-yellow-500 text-white";
      case "absent":  return "bg-gray-600 text-white";
      default:        return "bg-gray-300 text-black";
    }
  };

  return (
    <div className={`${tileBase} ${getStatusBg()}`}>
      {letter}
    </div>
  );
};

const GameBoard = ({
  guesses,
  currentGuess,
  maxAttempts,
  currentPersona,
  newGuessIndex,
  shake,
  bounceRow,
}: GameBoardProps) => {
  const targetName = useMemo(
    () => currentPersona.name.toLowerCase(),
    [currentPersona.name]
  );

  const getRowStatuses = (
    guess: string
  ): Array<"correct" | "present" | "absent"> => {
    const guessChars = guess.toLowerCase().split("");
    const targetChars = targetName.split("");
    const result: Array<"correct" | "present" | "absent"> = Array(guessChars.length).fill("absent");
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

  const renderRow = (guess: string, index: number, isCurrent = false, isNew = false, shake = false, bounce = false) => {
    const letters = guess.split("");
    const targetLength = currentPersona.name.length;
    const paddedLetters = [
      ...letters,
      ...Array(targetLength - letters.length).fill(""),
    ];
    const statuses = !isCurrent && guess ? getRowStatuses(guess) : null;

    return (
      <div key={index} className={`flex gap-1 sm:gap-2 justify-center flex-wrap ${shake ? "shake-animation" : ""} ${bounce ? "bounce-win" : ""}`} style={bounce ? { animationDelay: `${(guess.length - 1) * 100 + 300}ms` } : undefined}>
        {paddedLetters.map((letter, letterIndex) => (
          <GuessTile
            key={letterIndex}
            letter={letter}
            status={
              isCurrent
                ? "empty"
                : statuses
                ? statuses[letterIndex]
                : "empty"
            }
            flipDelay={isNew ? letterIndex * 100 : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-sm sm:text-lg font-bold mb-4 sm:mb-6 text-center text-white">
        Your attempts
      </h2>
      <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
        {guesses.map((guess, index) => renderRow(guess, index, false, index === newGuessIndex, false, index === bounceRow))}
        {renderRow(currentGuess, guesses.length, true, false, shake)}
        {Array.from(
          { length: maxAttempts - guesses.length - 1 },
          (_, index) => renderRow("", guesses.length + index + 1)
        )}
      </div>
    </div>
  );
};

export default GameBoard;
