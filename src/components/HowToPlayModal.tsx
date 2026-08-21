import { HelpCircle, X } from "lucide-react";
import { useModal } from "../hooks/useModal";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  useModal(isOpen, onClose);
  if (!isOpen) return null;

  const tile = (color: string, letter: string) => (
    <span
      className="inline-flex w-7 h-7 items-center justify-center font-bold text-sm rounded-md border-2 border-brand text-white mr-1 align-middle"
      style={{ backgroundColor: color }}
    >
      {letter}
    </span>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative border-4 border-brand rounded-xl w-full max-w-lg mx-3 max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        style={{ backgroundColor: "#202020" }}
      >
        <div
          className="h-1 w-full rounded-t-xl"
          style={{
            background:
              "repeating-linear-gradient(90deg,#FFF424 0,#FFF424 14px,#DC2626 14px,#DC2626 28px)",
          }}
        />

        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-brand" size={22} />
            <span id="howto-title" className="font-cinzel text-brand text-xl font-bold tracking-widest">
              HOW TO PLAY
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white transition-colors"
            autoFocus
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4 font-barlow text-gray-300 text-sm leading-relaxed">
          <p>
            Guess the daily <span className="text-brand font-bold">Persona</span> in 6
            tries. Type a Persona name and press Enter — only real Persona names count.
          </p>
          <div>
            <p className="mb-2">After each guess, the tiles show how close you are:</p>
            <p className="mb-1">
              {tile("#16a34a", "A")} letter is in the <b className="text-white">right spot</b>
            </p>
            <p className="mb-1">
              {tile("#eab308", "R")} letter is in the name, <b className="text-white">wrong spot</b>
            </p>
            <p>
              {tile("#4b5563", "S")} letter is <b className="text-white">not in the name</b>
            </p>
          </div>
          <p>
            The artwork starts dark and gets brighter with every guess. Elemental{" "}
            <span className="text-red-400 font-bold">weaknesses</span> unlock at guess 2 and{" "}
            <span className="text-brand font-bold">resistances</span> at guess 3, and some
            letters get revealed along the way.
          </p>
          <p>
            A new Persona drops every day at midnight UTC. Keep your{" "}
            <span className="text-red-400 font-bold">streak</span> going by winning every
            day — or grind the full Compendium in Practice mode.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg font-barlow font-black text-black text-sm tracking-widest hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#FFF424" }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
