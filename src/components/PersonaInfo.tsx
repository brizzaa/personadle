import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaInfoProps {
  persona: Persona;
}

const PersonaInfo = ({ persona }: PersonaInfoProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative border-10 border-[#FFF424] rounded-2xl overflow-hidden w-full max-w-sm lg:max-w-md xl:max-w-lg aspect-[3/5] max-h-150"
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
