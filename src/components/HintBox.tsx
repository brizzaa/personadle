import type { Persona } from "../types/Persona";

interface HintBoxProps {
  persona: Persona;
  progressiveHint: string;
  gameStatus: "playing" | "won" | "lost";
}

const HintBox = ({ progressiveHint, gameStatus }: HintBoxProps) => {
  if (!progressiveHint || gameStatus !== "playing") return null;

  const hintLetters = progressiveHint.split("");

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
          {hintLetters.map((letter, index) =>
            letter !== "_" ? (
              <div
                key={`hint-${index}`}
                className="min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center text-black font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 border-[#FFF424] bg-[#FFF424] transition-all duration-200 transform hover:scale-105 flex-shrink-0"
              >
                {letter}
              </div>
            ) : (
              <div
                key={`hint-${index}`}
                className="min-w-8 w-8 h-8 sm:min-w-10 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 font-bold text-xs sm:text-sm rounded-md sm:rounded-lg border-2 border-gray-500 bg-gray-700 flex-shrink-0"
              >
                _
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HintBox;
