"use client";

import { useEffect, useState } from "react";

interface ExamTimerProps {
  totalMinutes: number;
  onTimeUp: () => void;
}

export function ExamTimer({ totalMinutes, onTimeUp }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const urgent = secondsLeft < 300;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
        urgent ? "bg-red-100 text-red-700 animate-pulse" : "bg-gray-100 text-gray-700"
      }`}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
