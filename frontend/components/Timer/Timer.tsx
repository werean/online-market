"use client";

import { useEffect, useState } from "react";
import styles from "./Timer.module.css";

interface TimerProps {
  targetDate: Date | null;
  onComplete?: () => void;
}

export default function Timer({ targetDate, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(0);
        onComplete?.();
        return;
      }

      setTimeLeft(Math.ceil(difference / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (timeLeft <= 0) return null;

  return (
    <div className={styles.container}>
      <span className={styles.text}>
        Aguarde <strong>{timeLeft}s</strong> para reenviar
      </span>
    </div>
  );
}
