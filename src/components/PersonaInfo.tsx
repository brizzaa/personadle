import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaInfoProps {
  persona: Persona;
}

const PersonaInfo = ({ persona }: PersonaInfoProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative border-6 sm:border-10 border-[#FFF424] rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg aspect-[3/5] max-h-32 sm:max-h-40 lg:max-h-90 xl:max-h-180"
        style={{ backgroundColor: "#202020" }}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          <PersonaImage
            src={persona.image}
            alt={persona.name}
            className="w-full h-full object-contain"
            style={{ filter: "saturate(0)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#FFF424",
              mixBlendMode: "darken",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonaInfo;
