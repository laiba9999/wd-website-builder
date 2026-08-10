"use client";
import { useEffect, useState } from "react";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

export default function Countdown({ date }: { date: string }) {
  const [parts, setParts] = useState<number[] | null>(null);

  useEffect(() => {
    const target = new Date(`${date}T12:00:00`).getTime();
    if (Number.isNaN(target)) return;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setParts([
        Math.floor(diff / 86400000),
        Math.floor(diff / 3600000) % 24,
        Math.floor(diff / 60000) % 60,
        Math.floor(diff / 1000) % 60,
      ]);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [date]);

  // Rendered only after hydration so the server and client never disagree.
  if (!parts) return null;
  if (parts.every((p) => p === 0)) return null;

  return (
    <div className="count" aria-label="Time until the wedding">
      {parts.map((value, i) => (
        <div key={UNITS[i]}>
          <b>{String(value).padStart(2, "0")}</b>
          <span>{UNITS[i]}</span>
        </div>
      ))}
    </div>
  );
}
