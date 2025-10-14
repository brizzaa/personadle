import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  gameStatus: "won" | "lost";
}

const PersonaModal = ({
  persona,
  isOpen,
  onClose,
  gameStatus,
}: PersonaModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div
        className="relative backdrop-blur-sm border-4 sm:border-6 rounded-lg sm:rounded-xl p-4 sm:p-8 max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl"
        style={{
          borderColor: "#FFF424",
          backgroundColor: "#202020",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 text-xl sm:text-2xl transition-colors"
        >
          ×
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">
            {gameStatus === "won" ? "Congratulations!" : "Game Over"}
          </h2>
          <p className="font-bold text-white text-sm sm:text-base">
            {gameStatus === "won"
              ? `You guessed it! It was ${persona.name}!`
              : `The answer was: ${persona.name}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="mb-4">
              <PersonaImage
                src={persona.image}
                alt={persona.name}
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg border border-gray-200 shadow-md bg-gray-800 object-contain"
              />
            </div>
            <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[#FFF424] text-black font-medium text-xs sm:text-sm mb-2">
              {persona.arcana}
            </div>
            <p className="text-white text-xs sm:text-sm">
              Level {persona.level}
            </p>
          </div>

          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Description
            </h4>
            <p className="text-white text-sm sm:text-base leading-relaxed">
              {persona.description}
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="bg-[#FFF424] text-black font-medium py-2 px-4 sm:px-6 rounded-lg hover:bg-yellow-300 transition-colors text-sm sm:text-base"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;
