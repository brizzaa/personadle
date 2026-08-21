import { Delete, CornerDownLeft } from "lucide-react";
import type { Persona } from "../types/Persona";
import { normalizeName, getRowStatuses } from "../utils/feedback";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: string[];
  currentPersona: Persona;
}

type KeyStatus = "correct" | "present" | "absent" | "unused";

interface KeyProps {
  label: React.ReactNode;
  ariaLabel: string;
  status: KeyStatus;
  wide?: boolean;
  onClick: () => void;
}

const Key = ({ label, ariaLabel, status, wide, onClick }: KeyProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "correct":
        return "bg-green-600 text-white";
      case "present":
        return "bg-yellow-500 text-white";
      case "absent":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${
        wide ? "flex-[1.5] max-w-14" : "flex-1 max-w-10"
      } min-w-0 flex items-center justify-center py-2 sm:py-2.5 font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 border-brand transition-colors active:scale-95 ${getStatusColor()}`}
    >
      {label}
    </button>
  );
};

const Keyboard = ({ onKeyPress, guesses, currentPersona }: KeyboardProps) => {
  // Stato per tasto derivato dalla stessa logica di feedback della griglia;
  // priorità: correct > present > absent
  const rank = { absent: 0, present: 1, correct: 2 } as const;
  const keyStatuses = new Map<string, "correct" | "present" | "absent">();
  guesses.forEach((guess) => {
    const statuses = getRowStatuses(guess, currentPersona.name);
    normalizeName(guess).split("").forEach((char, i) => {
      if (char === " ") return;
      const prev = keyStatuses.get(char);
      if (!prev || rank[statuses[i]] > rank[prev]) {
        keyStatuses.set(char, statuses[i]);
      }
    });
  });

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  return (
    <div className="mt-4">
      <div className="space-y-1">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full">
            {rowIndex === 2 && (
              <Key
                label={<CornerDownLeft size={16} />}
                ariaLabel="Submit guess"
                status="unused"
                wide
                onClick={() => onKeyPress("ENTER")}
              />
            )}
            {row.map((letter) => (
              <Key
                key={letter}
                label={letter}
                ariaLabel={letter}
                status={keyStatuses.get(letter.toLowerCase()) ?? "unused"}
                onClick={() => onKeyPress(letter)}
              />
            ))}
            {rowIndex === 2 && (
              <Key
                label={<Delete size={16} />}
                ariaLabel="Delete letter"
                status="unused"
                wide
                onClick={() => onKeyPress("BACKSPACE")}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
