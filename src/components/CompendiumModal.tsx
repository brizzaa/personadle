import { useState } from "react";
import { BookOpen, Lock, X, ChevronLeft, Swords, ShieldCheck } from "lucide-react";
import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface CompendiumModalProps {
  personas: Persona[];
  unlockedIds: number[];
  isOpen: boolean;
  onClose: () => void;
}

const CompendiumModal = ({
  personas,
  unlockedIds,
  isOpen,
  onClose,
}: CompendiumModalProps) => {
  const [selected, setSelected] = useState<Persona | null>(null);

  if (!isOpen) return null;

  const sorted = [...personas].sort(
    (a, b) => a.arcana.localeCompare(b.arcana) || a.name.localeCompare(b.name)
  );

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative border-4 border-[#FFF424] rounded-xl w-full max-w-2xl mx-3 shadow-2xl animate-slideUp overflow-hidden"
        style={{ backgroundColor: "#202020", maxHeight: "90vh" }}
      >
        {/* stripe top */}
        <div
          className="h-1 w-full flex-shrink-0"
          style={{
            background:
              "repeating-linear-gradient(90deg,#FFF424 0,#FFF424 14px,#DC2626 14px,#DC2626 28px)",
          }}
        />

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {selected ? (
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-[#FFF424] hover:text-white transition-colors font-barlow font-bold text-sm tracking-widest"
              >
                <ChevronLeft size={18} /> BACK
              </button>
            ) : (
              <>
                <BookOpen className="text-[#FFF424]" size={20} />
                <span className="font-cinzel text-[#FFF424] text-lg font-bold tracking-widest">
                  COMPENDIUM
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!selected && (
              <span className="font-barlow text-gray-500 text-sm tracking-wide">
                <span className="text-[#FFF424] font-bold font-cinzel">
                  {unlockedIds.length}
                </span>{" "}
                / {personas.length}
              </span>
            )}
            {selected && (
              <span className="font-cinzel text-[#FFF424] font-bold tracking-widest text-base">
                {selected.name.toUpperCase()}
              </span>
            )}
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* progress bar — solo nella griglia */}
        {!selected && (
          <div className="px-5 pb-3 flex-shrink-0">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ background: "#111", height: 5 }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(unlockedIds.length / Math.max(personas.length, 1)) * 100}%`,
                  background: "linear-gradient(90deg,#FFF424,#DC2626)",
                }}
              />
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {!selected && (
          <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: "calc(90vh - 110px)" }}>
            <div className="grid grid-cols-4 gap-3">
              {sorted.map((persona) => {
                const unlocked = unlockedIds.includes(persona.id);
                return (
                  <button
                    key={persona.id}
                    onClick={() => unlocked && setSelected(persona)}
                    className="relative rounded-lg border-2 overflow-hidden flex flex-col group transition-transform duration-150 focus:outline-none"
                    style={{
                      borderColor: unlocked ? "#FFF424" : "#1e1e1e",
                      backgroundColor: unlocked ? "#111" : "#0d0d0d",
                      aspectRatio: "3/4",
                      cursor: unlocked ? "pointer" : "default",
                    }}
                  >
                    {unlocked ? (
                      <>
                        {/* immagine */}
                        <div className="flex-1 flex items-center justify-center p-1 relative overflow-hidden">
                          <img
                            src={persona.image}
                            alt={persona.name}
                            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
                            style={{ filter: "saturate(0) brightness(1.1)" }}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          {/* overlay giallo P4G al hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                            style={{ background: "#FFF424" }}
                          />
                        </div>
                        {/* label */}
                        <div
                          className="font-barlow font-black text-center py-1.5 px-1 text-sm tracking-wide leading-tight transition-colors duration-150 group-hover:bg-[#FFF424] group-hover:text-black"
                          style={{ background: "rgba(255,244,36,0.9)", color: "#000" }}
                        >
                          {persona.name.toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Lock size={20} color="#2a2a2a" />
                        <span className="font-barlow font-black text-xs text-[#2a2a2a] tracking-widest">
                          ???
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {selected && (
          <div
            className="overflow-y-auto px-5 pb-6 animate-fadeIn"
            style={{ maxHeight: "calc(90vh - 90px)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* immagine + badge */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-full rounded-xl border-4 border-[#FFF424] overflow-hidden relative"
                  style={{ backgroundColor: "#111", aspectRatio: "4/5", maxWidth: 220 }}
                >
                  <PersonaImage
                    src={selected.image}
                    alt={selected.name}
                    className="w-full h-full object-contain"
                    style={{ filter: "saturate(0)" }}
                  />
                  {/* yellow blend overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: "#FFF424", mixBlendMode: "darken" }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <span
                    className="font-barlow font-black text-xs tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: "#FFF424", color: "#000" }}
                  >
                    {selected.arcana.toUpperCase()}
                  </span>
                  <span
                    className="font-barlow font-bold text-xs tracking-widest px-3 py-1.5 rounded-full border-2 border-[#FFF424] text-[#FFF424]"
                    style={{ background: "#111" }}
                  >
                    LV. {selected.level}
                  </span>
                </div>
              </div>

              {/* info */}
              <div className="flex flex-col gap-4">
                {/* nome */}
                <div>
                  <div className="font-barlow text-gray-400 text-xs tracking-widest font-bold mb-1">
                    PERSONA
                  </div>
                  <div className="font-cinzel text-[#FFF424] text-3xl font-black tracking-wide leading-tight">
                    {selected.name}
                  </div>
                </div>

                {/* descrizione */}
                <div>
                  <div className="font-barlow text-gray-400 text-xs tracking-widest font-bold mb-2">
                    DESCRIPTION
                  </div>
                  <p className="font-barlow text-white text-base leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* stats */}
                <div>
                  <div className="font-barlow text-gray-400 text-xs tracking-widest font-bold mb-2">
                    BASE STATS
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: "STR", val: selected.strength },
                      { label: "MAG", val: selected.magic },
                      { label: "END", val: selected.endurance },
                      { label: "AGI", val: selected.agility },
                      { label: "LCK", val: selected.luck },
                    ].map(({ label, val }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center rounded-lg py-2.5 border border-gray-700"
                        style={{ backgroundColor: "#111" }}
                      >
                        <span className="font-cinzel text-[#FFF424] text-base font-black leading-none">
                          {val}
                        </span>
                        <span className="font-barlow text-white text-xs tracking-wider mt-1.5 font-bold">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* weaknesses & resists */}
                {(selected.weak.length > 0 || selected.resists.length > 0) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selected.weak.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Swords size={14} color="#ef4444" />
                          <span className="font-barlow text-red-400 text-sm tracking-widest font-bold">
                            WEAK
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.weak.map((w) => (
                            <span
                              key={w}
                              className="font-barlow font-black text-xs tracking-wide px-2.5 py-1 rounded border border-red-700 text-red-300"
                              style={{ background: "#1a0000" }}
                            >
                              {w.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.resists.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <ShieldCheck size={14} color="#FFF424" />
                          <span className="font-barlow text-[#FFF424] text-sm tracking-widest font-bold">
                            RESISTS
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.resists.map((r) => (
                            <span
                              key={r}
                              className="font-barlow font-black text-xs tracking-wide px-2.5 py-1 rounded border border-yellow-700 text-[#FFF424]"
                              style={{ background: "#1a1a00" }}
                            >
                              {r.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompendiumModal;
