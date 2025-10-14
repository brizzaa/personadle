import type { Persona } from "../types/Persona";

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: string[];
  currentPersona: Persona;
}

interface KeyProps {
  letter: string;
  status: "correct" | "present" | "absent" | "unused";
  onClick: () => void;
}

const Key = ({ letter, status, onClick }: KeyProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "correct":
        return "bg-green-600 hover:bg-green-700 border-2 border-yellow-400";
      case "present":
        return "bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-400";
      case "absent":
        return "bg-gray-600 hover:bg-gray-700 border-2 border-yellow-400";
      default:
        return "bg-gray-300 hover:bg-gray-400 border-2 border-yellow-400";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 sm:px-3 sm:py-2 m-0.5 sm:m-1 text-black font-bold text-xs sm:text-sm rounded-md sm:rounded-lg transition-colors ${getStatusColor()}`}
    >
      {letter}
    </button>
  );
};

const Keyboard = ({ onKeyPress, guesses, currentPersona }: KeyboardProps) => {
  const getKeyStatus = (
    letter: string
  ): "correct" | "present" | "absent" | "unused" => {
    const targetName = currentPersona.name.toLowerCase();
    let hasCorrect = false;
    let hasPresent = false;
    let hasAbsent = false;

    guesses.forEach((guess) => {
      const guessLower = guess.toLowerCase();
      const letterLower = letter.toLowerCase();

      if (guessLower.includes(letterLower)) {
        for (
          let i = 0;
          i < Math.min(guessLower.length, targetName.length);
          i++
        ) {
          if (guessLower[i] === letterLower && targetName[i] === letterLower) {
            hasCorrect = true;
          }
        }

        if (!hasCorrect && targetName.includes(letterLower)) {
          hasPresent = true;
        }

        if (!targetName.includes(letterLower)) {
          hasAbsent = true;
        }
      }
    });

    if (hasCorrect) return "correct";
    if (hasPresent) return "present";
    if (hasAbsent) return "absent";
    return "unused";
  };

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <div
        className="border-2 border-yellow-400 rounded-lg p-3 sm:p-6"
        style={{ backgroundColor: "#202020" }}
      >
        <h2 className="text-sm sm:text-xl font-bold mb-3 sm:mb-4 text-center text-white">
          Tastiera
        </h2>
        <div className="space-y-1 sm:space-y-2">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center">
              {row.map((letter) => (
                <Key
                  key={letter}
                  letter={letter}
                  status={getKeyStatus(letter)}
                  onClick={() => onKeyPress(letter)}
                />
              ))}
            </div>
          ))}
          <div className="flex justify-center mt-2 sm:mt-4">
            <Key
              letter="SPACE"
              status="unused"
              onClick={() => onKeyPress(" ")}
            />
            <Key
              letter="ENTER"
              status="unused"
              onClick={() => onKeyPress("ENTER")}
            />
            <Key
              letter="⌫"
              status="unused"
              onClick={() => onKeyPress("BACKSPACE")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;
