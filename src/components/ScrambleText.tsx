import { useEffect, useRef, useState } from "react";
import type React from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%*&?";

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  delay?: number;
}

const ScrambleText = ({
  text,
  className,
  style,
  duration = 1200,
  delay = 0,
}: ScrambleTextProps) => {
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((c) =>
        c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]
      )
      .join("")
  );
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime - delay;

      if (elapsed < 0) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * text.length);

      const result = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedCount) return char;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplay(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, duration, delay]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
};

export default ScrambleText;
