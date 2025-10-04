import type { Persona } from "../types/Persona";

interface HintBoxProps {
  persona: Persona;
  progressiveHint: string;
  gameStatus: "playing" | "won" | "lost";
}

const HintBox = ({ persona, progressiveHint, gameStatus }: HintBoxProps) => {
  if (!progressiveHint || gameStatus !== "playing") return null;

  const targetLength = persona.name.length;
  const hintLetters = progressiveHint.split("");
  const remainingLength = targetLength - progressiveHint.length;

  return (
    <div className="mb-6">
      <div
        className="backdrop-blur-sm border-4 border-yellow-400 rounded-xl p-4"
        style={{ backgroundColor: "#202020" }}
      >
        <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">
          💡
        </h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {hintLetters.map((letter, index) => (
            <div
              key={`hint-${index}`}
              className="min-w-10 w-10 h-10 flex items-center justify-center text-black font-bold text-sm rounded-lg border-2 border-yellow-400 bg-yellow-400 transition-all duration-500 transform hover:scale-105 flex-shrink-0"
            >
              {letter}
            </div>
          ))}
          {Array.from({ length: remainingLength }, (_, index) => (
            <div
              key={`hint-empty-${index}`}
              className="min-w-10 w-10 h-10 flex items-center justify-center text-white font-bold text-sm rounded-lg border-2 border-yellow-400 bg-gray-300 transition-all duration-500 flex-shrink-0"
            >
              _
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HintBox;
