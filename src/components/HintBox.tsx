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
    <div className="mb-4 sm:mb-6">
      <div
        className="backdrop-blur-sm border-4 border-[#FFF424] rounded-lg sm:rounded-xl p-3 sm:p-4"
        style={{ backgroundColor: "#202020" }}
      >
        <h3 className="text-sm sm:text-lg font-bold text-[#FFF424] mb-2 sm:mb-3 text-center">
          💡
        </h3>
        <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
          {hintLetters.map((letter, index) => (
            <div
              key={`hint-${index}`}
              className="min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center text-black font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 border-[#FFF424] bg-[#FFF424] transition-all duration-500 transform hover:scale-105 flex-shrink-0"
            >
              {letter}
            </div>
          ))}
          {Array.from({ length: remainingLength }, (_, index) => (
            <div
              key={`hint-empty-${index}`}
              className="min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center text-white font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 border-[#FFF424] bg-gray-300 transition-all duration-500 flex-shrink-0"
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
