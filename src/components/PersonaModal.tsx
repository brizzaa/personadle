import { Star, Share2, X, RefreshCw } from "lucide-react";
import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  gameStatus: "won" | "lost";
  attempts: number;
  maxAttempts: number;
  guesses: string[];
  scoreEarned: number;
  totalScore: number;
  streak: number;
}

const getShareEmoji = (guess: string, target: string): string => {
  const guessChars = guess.toLowerCase().split("");
  const targetChars = target.toLowerCase().split("");
  const result: string[] = Array(guessChars.length).fill("⬜");
  const targetUsed = Array(targetChars.length).fill(false);

  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = "🟩";
      targetUsed[i] = true;
    }
  }
  for (let i = 0; i < guessChars.length; i++) {
    if (result[i] === "🟩") continue;
    for (let j = 0; j < targetChars.length; j++) {
      if (!targetUsed[j] && guessChars[i] === targetChars[j]) {
        result[i] = "🟨";
        targetUsed[j] = true;
        break;
      }
    }
  }
  return result.join("");
};

const PersonaModal = ({
  persona,
  isOpen,
  onClose,
  onNewGame,
  gameStatus,
  attempts,
  maxAttempts,
  guesses,
  scoreEarned,
  totalScore,
  streak,
}: PersonaModalProps) => {
  if (!isOpen) return null;

  const handleShare = () => {
    const grid = guesses.map((g) => getShareEmoji(g, persona.name)).join("\n");
    const result = gameStatus === "won" ? `${attempts}/${maxAttempts}` : "X/6";
    navigator.clipboard
      .writeText(`Personadle ${result}\n\n${grid}\npersonadle.vercel.app`)
      .catch(() => {});
  };

  const baseScore = scoreEarned - Math.max(streak - 1, 0) * 30;
  const streakBonus = Math.max(streak - 1, 0) * 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative border-4 border-[#FFF424] rounded-xl w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        style={{ backgroundColor: "#202020" }}
      >
        {/* stripe top */}
        <div
          className="h-1 w-full rounded-t-xl"
          style={{
            background:
              "repeating-linear-gradient(90deg,#FFF424 0,#FFF424 14px,#DC2626 14px,#DC2626 28px)",
          }}
        />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* title */}
        <div className="text-center pt-5 pb-4 px-6">
          {gameStatus === "won" ? (
            <h2 className="font-cinzel text-[#FFF424] text-xl font-black tracking-widest mb-1 char-stagger">
              {"EXCELLENT!".split("").map((char, i) => (
                <span key={i} style={{ animationDelay: `${i * 55}ms` }}>
                  {char}
                </span>
              ))}
            </h2>
          ) : (
            <h2
              className="font-cinzel text-[#FFF424] text-xl font-black tracking-widest mb-1 glitch"
              data-text="GAME OVER"
            >
              GAME OVER
            </h2>
          )}
          <p className="font-barlow text-gray-300 text-sm tracking-wide">
            {gameStatus === "won"
              ? `You guessed it — ${persona.name}!`
              : `The answer was: ${persona.name}`}
          </p>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* persona info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2">
              <PersonaImage
                src={persona.image}
                alt={persona.name}
                className="w-28 h-28 rounded-lg border-2 border-[#FFF424] bg-gray-900 object-contain"
              />
              <div
                className="px-3 py-1 rounded-full font-barlow font-black text-xs tracking-widest"
                style={{ background: "#FFF424", color: "#000" }}
              >
                {persona.arcana.toUpperCase()}
              </div>
              <span className="font-barlow text-gray-500 text-xs tracking-wide">
                LEVEL {persona.level}
              </span>
            </div>
            <div>
              <div className="font-barlow text-gray-400 text-xs tracking-widest mb-1 font-bold">
                DESCRIPTION
              </div>
              <p className="font-barlow text-gray-300 text-sm leading-relaxed">
                {persona.description}
              </p>
            </div>
          </div>

          {/* score — solo se si è vinto */}
          {gameStatus === "won" && scoreEarned > 0 && (
            <div
              className="border-2 border-[#FFF424] rounded-lg p-4 relative overflow-hidden"
              style={{ backgroundColor: "#111" }}
            >
              {/* diagonal deco */}
              <div
                className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(-45deg,transparent,transparent 4px,rgba(255,244,36,0.06) 4px,rgba(255,244,36,0.06) 8px)",
                }}
              />
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-[#FFF424]" />
                <span className="font-barlow text-[#FFF424] text-xs tracking-widest font-bold">
                  PUNTEGGIO
                </span>
              </div>
              <div className="font-cinzel text-[#FFF424] text-4xl font-black text-center mb-3" style={{ textShadow: "2px 2px 0 #000" }}>
                +{scoreEarned}
              </div>
              <div className="space-y-1 text-xs font-barlow">
                <div className="flex justify-between text-gray-500 tracking-wide">
                  <span>Base ({attempts} {attempts === 1 ? "attempt" : "attempts"})</span>
                  <span className="text-gray-300">{baseScore}</span>
                </div>
                {streakBonus > 0 && (
                  <div className="flex justify-between text-gray-500 tracking-wide">
                    <span>Streak bonus (×{streak})</span>
                    <span className="text-[#FFF424] font-bold">+{streakBonus}</span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2 mt-1 border-t border-gray-700 tracking-wide"
                  style={{ color: "#aaa" }}
                >
                  <span>Total score</span>
                  <span className="font-cinzel text-[#FFF424] font-bold">
                    {totalScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#FFF424] font-barlow font-bold text-[#FFF424] text-sm tracking-widest hover:bg-[#FFF424] hover:text-black transition-colors"
              style={{ backgroundColor: "#111" }}
            >
              <Share2 size={15} />
              SHARE
            </button>
            <button
              onClick={onNewGame}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-barlow font-black text-black text-sm tracking-widest hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#FFF424" }}
            >
              <RefreshCw size={15} />
              NEW GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;
