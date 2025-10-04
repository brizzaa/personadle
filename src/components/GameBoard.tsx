import type { Persona } from "../types/Persona";

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  maxAttempts: number;
  currentPersona: Persona;
}

interface GuessTileProps {
  letter: string;
  status: "correct" | "present" | "absent" | "empty";
}

const GuessTile = ({ letter, status }: GuessTileProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "correct":
        return "bg-green-600 border-2 border-[#FFF424]";
      case "present":
        return "bg-yellow-500 border-2 border-[#FFF424]";
      case "absent":
        return "bg-gray-600 border-2 border-[#FFF424]";
      default:
        return "bg-gray-300 border-2 border-[#FFF424]";
    }
  };

  return (
    <div
      className={`min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 ${getStatusColor()} transition-all duration-500 transform hover:scale-105 flex-shrink-0`}
    >
      {letter}
    </div>
  );
};

const GameBoard = ({
  guesses,
  currentGuess,
  maxAttempts,
  currentPersona,
}: GameBoardProps) => {
  const getLetterStatus = (
    letter: string,
    position: number,
    _guess: string
  ): "correct" | "present" | "absent" => {
    const targetName = currentPersona.name.toLowerCase();
    const letterLower = letter.toLowerCase();

    if (targetName[position] === letterLower) {
      return "correct";
    } else if (targetName.includes(letterLower)) {
      return "present";
    } else {
      return "absent";
    }
  };

  const renderRow = (guess: string, index: number, isCurrent = false) => {
    const letters = guess.split("");
    const targetLength = currentPersona.name.length;
    const paddedLetters = [
      ...letters,
      ...Array(targetLength - letters.length).fill(""),
    ];

    return (
      <div key={index} className="flex gap-1 sm:gap-2 justify-center flex-wrap">
        {paddedLetters.map((letter, letterIndex) => (
          <GuessTile
            key={letterIndex}
            letter={letter}
            status={
              isCurrent
                ? "empty"
                : letter
                ? getLetterStatus(letter, letterIndex, guess)
                : "empty"
            }
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
        {guesses.map((guess, index) => renderRow(guess, index))}
        {currentGuess && renderRow(currentGuess, guesses.length, true)}
        {Array.from(
          { length: maxAttempts - guesses.length - (currentGuess ? 1 : 0) },
          (_, index) => renderRow("", guesses.length + index + 1)
        )}
      </div>
    </div>
  );
};

export default GameBoard;
