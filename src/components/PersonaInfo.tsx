import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaInfoProps {
  persona: Persona;
  attempts: number;
  gameStatus: "playing" | "won" | "lost";
}

// Durante la partita l'artwork è una silhouette scura su fondo giallo
// che si schiarisce ad ogni tentativo; a fine partita si rivela a colori.
const PersonaInfo = ({ persona, attempts, gameStatus }: PersonaInfoProps) => {
  const revealed = gameStatus !== "playing";
  const brightness = Math.min(attempts * 0.15, 0.75);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative border-6 sm:border-10 border-brand rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg aspect-[4/5] transition-colors duration-700"
        style={{ backgroundColor: revealed ? "#202020" : "#FFF424" }}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          <PersonaImage
            src={persona.image}
            alt={revealed ? persona.name : "Mystery Persona silhouette"}
            className="w-full h-full object-contain"
            style={
              revealed
                ? undefined
                : {
                    filter: `saturate(0) brightness(${brightness})`,
                    transition: "filter 0.7s ease",
                  }
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PersonaInfo;
