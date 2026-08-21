import { Lightbulb } from "lucide-react";
import type { Persona } from "../types/Persona";
import { getTileSizeClass, getTileGapClass } from "./GameBoard";

interface HintBoxProps {
  persona: Persona;
  progressiveHint: string;
  gameStatus: "playing" | "won" | "lost";
}

const HintBox = ({ progressiveHint, gameStatus }: HintBoxProps) => {
  if (!progressiveHint || gameStatus !== "playing") return null;

  const hintLetters = progressiveHint.split("");
  const sizeClass = getTileSizeClass(progressiveHint.length);
  const gapClass = getTileGapClass(progressiveHint.length);

  return (
    <div className="mb-4 sm:mb-6">
      <div
        className="backdrop-blur-sm border-4 border-brand rounded-lg sm:rounded-xl p-3 sm:p-4"
        style={{ backgroundColor: "#202020" }}
      >
        <h3 className="flex justify-center mb-2 sm:mb-3 text-brand" aria-label="Revealed letters">
          <Lightbulb size={18} aria-hidden />
        </h3>
        <div className={`flex ${gapClass} justify-center`}>
          {hintLetters.map((letter, index) => {
            if (letter === " ") {
              return <div key={`hint-${index}`} aria-hidden className="w-2 sm:w-3 flex-shrink-0" />;
            }
            return letter !== "_" ? (
              <div
                key={`hint-${index}`}
                className={`${sizeClass} flex items-center justify-center text-black font-bold rounded-md sm:rounded-lg border-brand bg-brand flex-shrink-0`}
              >
                {letter}
              </div>
            ) : (
              <div
                key={`hint-${index}`}
                className={`${sizeClass} flex items-center justify-center text-gray-400 font-bold rounded-md sm:rounded-lg border-gray-500 bg-gray-700 flex-shrink-0`}
              >
                _
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HintBox;
