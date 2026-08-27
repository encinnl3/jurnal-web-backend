"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/utils";

gsap.registerPlugin(ScrollTrigger);

export const Marquee: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(".ticker-track", {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    });
  }, []);

  return (
    <div className="w-full h-12 border-y border-border flex items-center overflow-hidden bg-transparent">
      <div className="ticker-track flex whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="font-inter font-semibold uppercase tracking-[0.15em] text-xs text-text-muted mx-4">
            JURNAL PKL · JANANDRA · AKMAL · FARHAN · 2025 · LAPORAN MAGANG ·
          </span>
        ))}
      </div>
    </div>
  );
};
