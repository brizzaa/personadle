interface TypeIconProps {
  type: string;
  size?: number;
}

const TypeIcon = ({ type, size = 24 }: TypeIconProps) => {
  const iconPaths: { [key: string]: string } = {
    physical: "/icons/Physical.png",
    fire: "/icons/Fire.png",
    wind: "/icons/Wind.png",
    nuclear: "/icons/Nuclar.png",
    heal: "/icons/Healing.png",
    ranged: "/icons/Gun.png",
    ice: "/icons/Ice.png",
    electric: "/icons/Electric.png",
    psychic: "/icons/Psi.png",
    support: "/icons/Assist.png",
    passive: "/icons/Passive.png",
    light: "/icons/Bless.png",
    dark: "/icons/Curse.png",
    divine: "/icons/Almighty.png",
    status: "/icons/Ailment.png",
  };

  const iconPath = iconPaths[type.toLowerCase()];

  if (!iconPath) {
    return null;
  }

  return (
    <img
      src={iconPath}
      alt={type}
      className="inline-block"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        imageRendering: "pixelated",
      }}
    />
  );
};

export default TypeIcon;
