const ColorStripes = () => {
  const colors = [
    "bg-yellow-300",
    "bg-green-300",
    "bg-cyan-300",
    "bg-blue-300",
    "bg-red-300",
    "bg-orange-300",
    "bg-purple-300",
    "bg-pink-300",
  ];

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-8 -z-0">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`${color} h-1/8 w-full`}
            style={{ height: `${100 / colors.length}%` }}
          />
        ))}
      </div>
    </>
  );
};

export default ColorStripes;
