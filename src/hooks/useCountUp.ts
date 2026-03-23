import { useState, useEffect } from "react";

const useCountUp = (target: number, duration = 900, isActive = true) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setValue(0);
      return;
    }

    const start = performance.now();
    let frameId: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, isActive]);

  return value;
};

export default useCountUp;
