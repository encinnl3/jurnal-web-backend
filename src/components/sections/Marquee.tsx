"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const Marquee: React.FC = () => {
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    tweenRef.current = gsap.to(".ticker-track", {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    });
  }, []);

  const handleMouseEnter = () => tweenRef.current?.timeScale(0);
  const handleMouseLeave = () => tweenRef.current?.timeScale(1);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-12 border-y border-border flex items-center overflow-hidden bg-transparent cursor-pointer"
    >
      <div className="ticker-track flex whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="font-inter font-semibold uppercase tracking-[0.15em] text-xs text-text-muted mx-4">
            JURNAL PKL · <span className="text-accent-teal">JANANDRA</span> · <span className="text-accent-teal">AKMAL</span> · <span className="text-accent-teal">FARHAN</span> · 2025 · LAPORAN MAGANG ·
          </span>
        ))}
      </div>
    </div>
  );
};

