import type { Persona } from "../types/Persona";
import PersonaImage from "./PersonaImage";

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard = ({ persona }: PersonaCardProps) => {
  return (
    <div className="bg-black border-2 border-yellow-400 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">
        Persona Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center">
          <div className="mb-4">
            <PersonaImage
              src={persona.image}
              alt={persona.name}
              className="w-32 h-32 mx-auto rounded-lg border-2 border-white"
            />
          </div>
          <h3 className="text-xl font-bold mb-2">{persona.name}</h3>
          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#FFF424] to-yellow-600 text-white font-semibold">
            {persona.arcana}
          </div>
          <p className="text-sm text-gray-300 mt-2">Level {persona.level}</p>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-3">Statistics</h4>
          <div className="space-y-2">
            {[
              { label: "Strength", value: persona.strength },
              { label: "Magic", value: persona.magic },
              { label: "Endurance", value: persona.endurance },
              { label: "Agility", value: persona.agility },
              { label: "Luck", value: persona.luck },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span>{label}:</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-bold mb-2">Description</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {persona.description}
        </p>
      </div>

      {(() => {
        const resistances = [
          {
            title: "Weaknesses",
            items: persona.weak,
            titleClass: "text-red-400",
            itemClass: "bg-red-600",
          },
          {
            title: "Resists",
            items: persona.resists,
            titleClass: "text-yellow-400",
            itemClass: "bg-yellow-600",
          },
          {
            title: "Reflects",
            items: persona.reflects,
            titleClass: "text-blue-400",
            itemClass: "bg-blue-600",
          },
          {
            title: "Absorbs",
            items: persona.absorbs,
            titleClass: "text-green-400",
            itemClass: "bg-green-600",
          },
          {
            title: "Nullifies",
            items: persona.nullifies,
            titleClass: "text-purple-400",
            itemClass: "bg-purple-600",
          },
        ].filter((r) => r.items.length > 0);

        if (resistances.length === 0) return null;

        return (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {resistances.map(({ title, items, titleClass, itemClass }) => (
              <div key={title}>
                <h5 className={`font-bold ${titleClass} mb-1`}>{title}</h5>
                <div className="flex flex-wrap gap-1">
                  {items.map((element, index) => (
                    <span
                      key={index}
                      className={`${itemClass} text-white px-2 py-1 rounded text-xs`}
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};

export default PersonaCard;
