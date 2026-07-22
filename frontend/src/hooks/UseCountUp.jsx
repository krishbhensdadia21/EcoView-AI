// /frontend/src/hooks/useCountUp.js
import { useEffect, useState } from "react";

// Animates a number counting up from 0 to `value` over `duration` ms.
// Used to give stat cards on Impact/Leaderboard a bit of life instead of
// numbers just appearing flat the instant data loads.
export default function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : parseFloat(value) || 0;
    if (target === 0) {
      setDisplay(0);
      return;
    }

    let start = null;
    let frame;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}