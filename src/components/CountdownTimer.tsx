"use client";

import { useEffect, useState } from "react";

function getParts(ms: number) {
  const clamped = Math.max(0, ms);
  const h = Math.floor(clamped / 3600000);
  const m = Math.floor((clamped % 3600000) / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  return { h, m, s, done: clamped <= 0 };
}

export function CountdownTimer({ endsAt, onComplete }: { endsAt: string; onComplete?: () => void }) {
  const [parts, setParts] = useState(() => getParts(new Date(endsAt).getTime() - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getParts(new Date(endsAt).getTime() - Date.now());
      setParts(next);
      if (next.done) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt, onComplete]);

  if (parts.done) {
    return <span className="font-semibold text-ink-500">Auction ended</span>;
  }

  return (
    <span className="font-mono text-base font-bold tabular-nums">
      {parts.h}h {String(parts.m).padStart(2, "0")}m {String(parts.s).padStart(2, "0")}s
    </span>
  );
}
