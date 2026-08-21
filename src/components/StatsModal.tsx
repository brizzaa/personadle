import {
  BarChart2,
  Flame,
  Medal,
  X,
  Zap,
  Search,
  Skull,
  Tv2,
  CloudRain,
  Gem,
  Eye,
  Check,
  Lock,
} from "lucide-react";
import type { GameStats } from "../types/GameStats";
import { achievements } from "../data/achievements";
import type { LucideIcon } from "lucide-react";
import useCountUp from "../hooks/useCountUp";
import { useModal } from "../hooks/useModal";

interface StatsModalProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  zap: Zap,
  flame: Flame,
  search: Search,
  skull: Skull,
  "tv-2": Tv2,
  "cloud-rain": CloudRain,
  gem: Gem,
  eye: Eye,
};

const winRate = (s: GameStats) =>
  s.gamesPlayed === 0 ? 0 : Math.round((s.gamesWon / s.gamesPlayed) * 100);

const avgAttempts = (s: GameStats) => {
  const total = s.guessDistribution.reduce((a, b, i) => a + b * (i + 1), 0);
  return s.gamesWon === 0 ? "-" : (total / s.gamesWon).toFixed(1);
};

const CountUpNumber = ({ value, isOpen, suffix = "" }: { value: number; isOpen: boolean; suffix?: string }) => {
  const animated = useCountUp(value, 900, isOpen);
  return <>{animated.toLocaleString()}{suffix}</>;
};

const StatsModal = ({ stats, isOpen, onClose }: StatsModalProps) => {
  useModal(isOpen, onClose);
  if (!isOpen) return null;

  const maxDist = Math.max(...stats.guessDistribution, 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Statistics"
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

        {/* header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <BarChart2 className="text-brand" size={22} />
            <span className="font-cinzel text-brand text-xl font-bold tracking-widest">
              STATISTICS
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* stat boxes */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { node: <CountUpNumber value={stats.gamesPlayed} isOpen={isOpen} />, label: "PLAYED" },
              { node: <CountUpNumber value={winRate(stats)} isOpen={isOpen} suffix="%" />, label: "WIN RATE" },
              { node: <span>{avgAttempts(stats)}</span>, label: "AVG" },
              { node: <CountUpNumber value={stats.totalScore} isOpen={isOpen} />, label: "SCORE" },
            ].map(({ node, label }) => (
              <div
                key={label}
                className="text-center border-2 border-brand rounded-lg py-4 px-2"
                style={{ backgroundColor: "#111" }}
              >
                <div className="font-cinzel text-brand text-2xl font-black leading-none">
                  {node}
                </div>
                <div className="text-gray-400 text-xs tracking-widest mt-2 font-barlow font-bold">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* streak */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: Flame, value: stats.currentStreak, label: "CURRENT STREAK", color: "#DC2626" },
              { Icon: Medal, value: stats.maxStreak, label: "BEST", color: "#DC2626" },
            ].map(({ Icon, value, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center py-4 rounded-lg border-2"
                style={{ backgroundColor: "#111", borderColor: color }}
              >
                <div className="flex items-center gap-2" style={{ color }}>
                  <Icon size={24} />
                  <span className="font-cinzel text-3xl font-black">
                    <CountUpNumber value={value} isOpen={isOpen} />
                  </span>
                </div>
                <div className="text-gray-400 text-xs tracking-widest mt-2 font-barlow font-bold">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* guess distribution */}
          <div>
            <div className="text-brand text-sm tracking-widest font-barlow font-bold mb-3">
              GUESS DISTRIBUTION
            </div>
            <div className="space-y-2">
              {stats.guessDistribution.map((count, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-cinzel text-brand text-base font-bold w-4 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 rounded overflow-hidden" style={{ background: "#1a1a1a" }}>
                    <div
                      className="h-6 flex items-center px-2.5 transition-all duration-500"
                      style={{
                        width: count === 0 ? "6%" : `${Math.max((count / maxDist) * 100, 8)}%`,
                        background:
                          count === Math.max(...stats.guessDistribution) && count > 0
                            ? "#DC2626"
                            : "#4b5563",
                      }}
                    >
                      <span className="text-white text-sm font-barlow font-black">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* achievements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-brand text-sm tracking-widest font-barlow font-bold">
                ACHIEVEMENT
              </span>
              <span className="text-gray-400 text-sm font-barlow font-bold">
                {stats.unlockedAchievements.length}/{achievements.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {achievements.map((ach) => {
                const unlocked = stats.unlockedAchievements.includes(ach.id);
                const Icon = iconMap[ach.icon] ?? Zap;
                return (
                  <div
                    key={ach.id}
                    tabIndex={0}
                    className="group relative flex flex-col items-center text-center rounded-lg py-3 px-2 border-2 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand"
                    style={{
                      backgroundColor: "#111",
                      borderColor: unlocked ? "#FFF424" : "#2a2a2a",
                      opacity: unlocked ? 1 : 0.4,
                    }}
                  >
                    {unlocked && (
                      <div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border border-black"
                        style={{ background: "#22c55e" }}
                      >
                        <Check size={11} color="white" />
                      </div>
                    )}
                    {!unlocked && (
                      <div
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border border-black"
                        style={{ background: "#2a2a2a" }}
                      >
                        <Lock size={11} color="#555" />
                      </div>
                    )}
                    <Icon
                      size={26}
                      className="mb-2"
                      color={unlocked ? "#FFF424" : "#444"}
                    />
                    <span
                      className="text-[0.65rem] font-barlow font-black leading-tight tracking-wide"
                      style={{ color: unlocked ? "#FFF424" : "#444" }}
                    >
                      {ach.name.toUpperCase()}
                    </span>
                    {/* popover al posto del title nativo (funziona anche su touch/focus) */}
                    <div
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 rounded-lg border-2 border-brand px-3 py-2 text-xs font-barlow text-gray-200 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-10"
                      style={{ backgroundColor: "#111" }}
                      role="tooltip"
                    >
                      <span className="block font-black text-brand mb-0.5">
                        {ach.name}
                      </span>
                      {ach.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
