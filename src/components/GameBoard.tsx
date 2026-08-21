import type { Persona } from "../types/Persona";
import type React from "react";
import { getRowStatuses, type TileStatus } from "../utils/feedback";

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
  status: TileStatus | "empty";
  sizeClass: string;
  flipDelay?: number;
}

const statusToColor: Record<string, string> = {
  correct: "#16a34a",
  present: "#eab308",
  absent: "#4b5563",
  empty: "#d1d5db",
};

const statusLabel: Record<string, string> = {
  correct: "correct position",
  present: "wrong position",
  absent: "not in the name",
};

const tileBase =
  "flex items-center justify-center font-bold rounded-md sm:rounded-lg flex-shrink-0";

// Tile più piccole per nomi lunghi, così la riga resta su una sola linea.
// Dimensionate sul caso peggiore (16 caratteri) dentro max-w-xs / max-w-sm / max-w-lg.
export const getTileSizeClass = (nameLength: number): string => {
  if (nameLength <= 8)
    return "w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm border-4";
  if (nameLength <= 11)
    return "w-6 h-7 sm:w-8 sm:h-9 text-[10px] sm:text-xs border-2";
  return "w-4 h-6 sm:w-5 sm:h-7 text-[8px] sm:text-[10px] border-2";
};

export const getTileGapClass = (nameLength: number): string =>
  nameLength <= 8 ? "gap-1 sm:gap-2" : "gap-0.5";

// Oltre al colore, lo stato è distinguibile dal bordo (daltonismo):
// correct = bordo pieno giallo, present = bordo tratteggiato, absent = bordo grigio
const statusBorder: Record<string, string> = {
  correct: "border-brand",
  present: "border-brand border-dashed",
  absent: "border-gray-500",
  empty: "border-brand",
};

const GuessTile = ({ letter, status, sizeClass, flipDelay }: GuessTileProps) => {
  const label = letter
    ? `${letter.toUpperCase()}${statusLabel[status] ? `, ${statusLabel[status]}` : ""}`
    : "empty";

  if (flipDelay !== undefined) {
    return (
      <div
        aria-label={label}
        className={`${tileBase} ${sizeClass} ${statusBorder[status]} flip-reveal-animation`}
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
    <div aria-label={label} className={`${tileBase} ${sizeClass} ${statusBorder[status]} ${getStatusBg()}`}>
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
  const targetName = currentPersona.name;

  const renderRow = (
    guess: string,
    index: number,
    isCurrent = false,
    isNew = false,
    shake = false,
    bounce = false
  ) => {
    const letters = guess.split("");
    const targetLength = targetName.length;
    const paddedLetters = [
      ...letters,
      ...Array(Math.max(targetLength - letters.length, 0)).fill(""),
    ];
    const statuses = !isCurrent && guess ? getRowStatuses(guess, targetName) : null;

    return (
      <div
        key={index}
        role="group"
        aria-label={
          isCurrent ? "Current guess" : guess ? `Guess ${index + 1}` : `Empty row ${index + 1}`
        }
        className={`flex ${getTileGapClass(targetName.length)} justify-center ${
          shake ? "shake-animation" : ""
        } ${bounce ? "bounce-win" : ""}`}
        style={
          bounce
            ? { animationDelay: `${(guess.length - 1) * 100 + 300}ms` }
            : undefined
        }
      >
        {paddedLetters.map((letter, letterIndex) => {
          // Gli spazi del nome sono separatori fissi, non lettere da indovinare
          if (targetName[letterIndex] === " ") {
            return (
              <div
                key={letterIndex}
                aria-hidden
                className="w-2 sm:w-3 flex-shrink-0"
              />
            );
          }
          return (
            <GuessTile
              key={letterIndex}
              letter={letter}
              status={
                isCurrent ? "empty" : statuses ? statuses[letterIndex] : "empty"
              }
              sizeClass={getTileSizeClass(targetName.length)}
              flipDelay={isNew ? letterIndex * 100 : undefined}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-sm sm:text-lg font-bold mb-4 sm:mb-6 text-center text-white">
        Your attempts
      </h2>
      <div className="space-y-2 sm:space-y-3 flex flex-col items-center">
        {guesses.map((guess, index) =>
          renderRow(guess, index, false, index === newGuessIndex, false, index === bounceRow)
        )}
        {guesses.length < maxAttempts &&
          renderRow(currentGuess, guesses.length, true, false, shake)}
        {Array.from(
          { length: Math.max(maxAttempts - guesses.length - 1, 0) },
          (_, index) => renderRow("", guesses.length + index + 1)
        )}
      </div>
    </div>
  );
};

export default GameBoard;
