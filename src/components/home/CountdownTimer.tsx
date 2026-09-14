"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const STORAGE_KEY = "auric-flash-offer-deadline";
const DURATION_MS = 12 * 60 * 60 * 1000; // each flash offer window runs 12 hours

function getDeadline() {
  if (typeof window === "undefined") return Date.now() + DURATION_MS;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const storedTime = stored ? parseInt(stored, 10) : NaN;

  // Reuse the stored deadline if it's still in the future, otherwise start
  // a fresh countdown window — this is what makes it "roll over" so there's
  // always an active flash offer ticking down whenever someone opens the site.
  if (!Number.isNaN(storedTime) && storedTime > Date.now()) {
    return storedTime;
  }

  const next = Date.now() + DURATION_MS;
  window.localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

function splitDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Deadline + ticking clock are only meaningful in the browser, so both
  // are set after mount to avoid a server/client markup mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating client-only time values on mount to avoid an SSR/CSR markup mismatch
    setDeadline(getDeadline());
    setNow(Date.now());

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (deadline === null || now === null) return;
    if (now >= deadline) {
      const next = Date.now() + DURATION_MS;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- rolling over to a fresh countdown window once the current one expires
      setDeadline(next);
    }
  }, [now, deadline]);

  if (deadline === null || now === null) {
    // Reserve the layout space so the section doesn't jump once the client mounts.
    return <div className="h-[52px] w-full max-w-[220px] sm:w-auto" />;
  }

  const { hours, minutes, seconds } = splitDuration(deadline - now);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brass/30 bg-white px-4 py-3">
      <Clock size={16} className="shrink-0 text-rust" />
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/70">
        Offer ends in:
      </span>
      <div className="flex items-center gap-1.5 font-[family-name:var(--font-display)]">
        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-ink px-1.5 text-sm font-bold text-cream">
          {pad(hours)}
        </span>
        <span className="text-sm font-bold text-ink/40">:</span>
        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-ink px-1.5 text-sm font-bold text-cream">
          {pad(minutes)}
        </span>
        <span className="text-sm font-bold text-ink/40">:</span>
        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-rust px-1.5 text-sm font-bold text-white">
          {pad(seconds)}
        </span>
      </div>
    </div>
  );
}