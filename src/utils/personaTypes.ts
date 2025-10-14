
// serve per le icone delle persone
export interface PersonaType {
  name: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const personaTypes: { [key: string]: PersonaType } = {
  Physical: {
    name: "Physical",
    color: "#8B4513",
    bgColor: "#D2B48C",
    icon: "Strike",
  },
  Fire: {
    name: "Fire",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    icon: "Fire",
  },
  Wind: {
    name: "Wind",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "Wind",
  },
  Nuclear: {
    name: "Nuclear",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    icon: "Nuclear",
  },
  Ice: {
    name: "Ice",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    icon: "Ice",
  },
  Electric: {
    name: "Electric",
    color: "#D97706",
    bgColor: "#FEF3C7",
    icon: "Electric",
  },
  Psychic: {
    name: "Psychic",
    color: "#BE185D",
    bgColor: "#FCE7F3",
    icon: "Psi",
  },
  Light: {
    name: "Light",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    icon: "Light",
  },
  Dark: {
    name: "Dark",
    color: "#1F2937",
    bgColor: "#F3F4F6",
    icon: "Dark",
  },
  Divine: {
    name: "Divine",
    color: "#7C2D12",
    bgColor: "#FEF3C7",
    icon: "Almighty",
  },

  Heal: {
    name: "Heal",
    color: "#059669",
    bgColor: "#D1FAE5",
    icon: "Healing",
  },
  Ranged: {
    name: "Ranged",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    icon: "Pierce",
  },
  Support: {
    name: "Support",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    icon: "Assist",
  },
  Passive: {
    name: "Passive",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    icon: "Passive",
  },
  Status: {
    name: "Status",
    color: "#BE185D",
    bgColor: "#FCE7F3",
    icon: "Ailment",
  },
};

export const getPersonaType = (typeName: string): PersonaType => {
  return (
    personaTypes[typeName] || {
      name: typeName,
      color: "#6B7280",
      bgColor: "#F3F4F6",
      icon: "Unknown",
    }
  );
};

export const getTypeColor = (typeName: string): string => {
  const type = getPersonaType(typeName);
  return type.color;
};

export const getTypeIcon = (typeName: string): string => {
  const type = getPersonaType(typeName);
  return type.icon;
};
