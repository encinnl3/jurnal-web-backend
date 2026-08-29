"use client";
import React, { useEffect, useState } from "react";

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const target = new Date("2025-12-31T23:59:59").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 font-mono text-text-primary text-2xl mt-8">
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="text-xs text-text-muted font-inter uppercase">hari</span>
      </div>
      <span className="text-accent-teal">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-xs text-text-muted font-inter uppercase">jam</span>
      </div>
      <span className="text-accent-teal">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-xs text-text-muted font-inter uppercase">menit</span>
      </div>
      <span className="text-accent-teal">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-xs text-text-muted font-inter uppercase">detik</span>
      </div>
    </div>
  );
};
