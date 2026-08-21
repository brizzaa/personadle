import { useEffect, useState } from "react";
import {
  Star,
  Share2,
  X,
  RefreshCw,
  BookOpen,
  Award,
  Zap,
  Flame,
  Search,
  Skull,
  Tv2,
  CloudRain,
  Gem,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Persona } from "../types/Persona";
import type { GameRecordResult } from "../hooks/useGameStats";
import PersonaImage from "./PersonaImage";
import { getShareEmoji } from "../utils/feedback";
import { msUntilNextDay } from "../utils/daily";
import { useModal } from "../hooks/useModal";

interface PersonaModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  gameStatus: "won" | "lost";
  attempts: number;
  maxAttempts: number;
  guesses: string[];
  gameResult: GameRecordResult | null;
  totalScore: number;
  streak: number;
  mode: "daily" | "practice";
  day: number;
  compendiumCount: number;
  compendiumTotal: number;
  onOpenCompendium: () => void;
}

const achievementIcons: Record<string, LucideIcon> = {
  zap: Zap,
  flame: Flame,
  search: Search,
  skull: Skull,
  "tv-2": Tv2,
  "cloud-rain": CloudRain,
  gem: Gem,
  eye: Eye,
};

const formatCountdown = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

const Countdown = () => {
  const [remaining, setRemaining] = useState(msUntilNextDay());
  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilNextDay()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center">
      <div className="font-barlow text-gray-400 text-xs tracking-widest font-bold mb-1">
        NEXT PERSONA IN
      </div>
      <div className="font-cinzel text-brand text-2xl font-black tabular-nums">
        {formatCountdown(remaining)}
      </div>
    </div>
  );
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
  gameResult,
  totalScore,
  streak,
  mode,
  day,
  compendiumCount,
  compendiumTotal,
  onOpenCompendium,
}: PersonaModalProps) => {
  const [copied, setCopied] = useState(false);
  useModal(isOpen, onClose);

  if (!isOpen) return null;

  const scoreEarned = gameResult?.scoreEarned ?? 0;
  const newAchievements = gameResult?.newAchievements ?? [];
  const personaWasNew = gameResult?.personaWasNew ?? false;

  const handleShare = () => {
    const grid = guesses.map((g) => getShareEmoji(g, persona.name)).join("\n");
    const result =
      gameStatus === "won" ? `${attempts}/${maxAttempts}` : `X/${maxAttempts}`;
    const title =
      mode === "daily" ? `Personadle #${day} ${result}` : `Personadle (practice) ${result}`;
    const streakLine = mode === "daily" && streak > 1 ? ` 🔥${streak}` : "";
    const text = `${title}${streakLine}\n\n${grid}\npersonadle.vercel.app`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const baseScore = scoreEarned - Math.max(streak - 1, 0) * 30;
  const streakBonus = Math.max(streak - 1, 0) * 30;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative border-4 border-brand rounded-xl w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
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
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* title */}
        <div className="text-center pt-5 pb-4 px-6">
          {gameStatus === "won" ? (
            <h2
              id="result-title"
              className="font-cinzel text-brand text-xl font-black tracking-widest mb-1 char-stagger"
            >
              {"EXCELLENT!".split("").map((char, i) => (
                <span key={i} style={{ animationDelay: `${i * 55}ms` }}>
                  {char}
                </span>
              ))}
            </h2>
          ) : (
            <h2
              id="result-title"
              className="font-cinzel text-brand text-xl font-black tracking-widest mb-1 glitch"
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
                className="w-28 h-28 rounded-lg border-2 border-brand bg-gray-900 object-contain"
              />
              <div
                className="px-3 py-1 rounded-full font-barlow font-black text-xs tracking-widest"
                style={{ background: "#FFF424", color: "#000" }}
              >
                {persona.arcana.toUpperCase()}
              </div>
              <span className="font-barlow text-gray-400 text-xs tracking-wide">
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

          {/* new persona unlocked */}
          {personaWasNew && (
            <button
              onClick={onOpenCompendium}
              className="w-full border-2 border-brand rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-brand/10 transition-colors"
              style={{ backgroundColor: "#111" }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-brand" />
                <span className="font-barlow text-brand text-xs tracking-widest font-bold">
                  NEW PERSONA UNLOCKED
                </span>
              </div>
              <span className="font-cinzel text-brand text-sm font-bold">
                {compendiumCount}/{compendiumTotal}
              </span>
            </button>
          )}

          {/* new achievements */}
          {newAchievements.length > 0 && (
            <div
              className="border-2 border-brand rounded-lg p-3 space-y-2"
              style={{ backgroundColor: "#111" }}
            >
              {newAchievements.map((ach) => {
                const Icon = achievementIcons[ach.icon] ?? Award;
                return (
                  <div key={ach.id} className="flex items-center gap-3">
                    <Icon size={20} className="text-brand flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-barlow text-brand text-xs tracking-widest font-bold">
                        ACHIEVEMENT — {ach.name.toUpperCase()}
                      </div>
                      <div className="font-barlow text-gray-300 text-xs">
                        {ach.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* score — solo daily vinto */}
          {gameStatus === "won" && scoreEarned > 0 && (
            <div
              className="border-2 border-brand rounded-lg p-4 relative overflow-hidden"
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
                <Star size={16} className="text-brand" />
                <span className="font-barlow text-brand text-xs tracking-widest font-bold">
                  SCORE
                </span>
              </div>
              <div
                className="font-cinzel text-brand text-4xl font-black text-center mb-3"
                style={{ textShadow: "2px 2px 0 #000" }}
              >
                +{scoreEarned}
              </div>
              <div className="space-y-1 text-xs font-barlow">
                <div className="flex justify-between text-gray-400 tracking-wide">
                  <span>
                    Base ({attempts} {attempts === 1 ? "attempt" : "attempts"})
                  </span>
                  <span className="text-gray-300">{baseScore}</span>
                </div>
                {streakBonus > 0 && (
                  <div className="flex justify-between text-gray-400 tracking-wide">
                    <span>Streak bonus (×{streak})</span>
                    <span className="text-brand font-bold">+{streakBonus}</span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2 mt-1 border-t border-gray-700 tracking-wide"
                  style={{ color: "#aaa" }}
                >
                  <span>Total score</span>
                  <span className="font-cinzel text-brand font-bold">
                    {totalScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* countdown al prossimo daily */}
          {mode === "daily" && (
            <div
              className="border-2 border-brand rounded-lg p-3"
              style={{ backgroundColor: "#111" }}
            >
              <Countdown />
            </div>
          )}

          {/* buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-brand font-barlow font-bold text-brand text-sm tracking-widest hover:bg-brand hover:text-black transition-colors"
              style={{ backgroundColor: "#111" }}
            >
              <Share2 size={15} />
              {copied ? "COPIED!" : "SHARE"}
            </button>
            <button
              onClick={onNewGame}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-barlow font-black text-black text-sm tracking-widest hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#FFF424" }}
            >
              <RefreshCw size={15} />
              {mode === "daily" ? "PRACTICE" : "NEW GAME"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaModal;
