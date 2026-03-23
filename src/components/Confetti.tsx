import { useEffect, useState } from "react";

interface Piece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  width: number;
  height: number;
  round: boolean;
}

const COLORS = ["#FFF424", "#DC2626", "#ffffff", "#FFF424", "#DC2626", "#FFF424"];
let uid = 0;

const Confetti = ({ active }: { active: boolean }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;

    const next: Piece[] = Array.from({ length: 45 }, () => {
      const size = 7 + Math.random() * 9;
      const wide = Math.random() > 0.65;
      return {
        id: uid++,
        left: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 1.4,
        duration: 1.3 + Math.random() * 1.1,
        width: wide ? size * 2 : size,
        height: wide ? size * 0.45 : size,
        round: Math.random() > 0.6,
      };
    });

    setPieces(next);
    const t = setTimeout(() => setPieces([]), 3500);
    return () => clearTimeout(t);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-fall"
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
