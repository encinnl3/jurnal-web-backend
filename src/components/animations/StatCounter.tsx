"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StatCounterProps {
  target: number;
  label: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({ target, label }) => {
  useEffect(() => {
    const el = document.querySelector(`[data-stat="${label}"]`);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 1.6,
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate() {
              el.textContent = Math.floor(parseFloat(el.textContent || "0")).toString();
            },
          }
        );
        gsap.fromTo(
          `[data-underline="${label}"]`,
          { scaleX: 0, transformOrigin: "left" },
          { scaleX: 1, duration: 0.4, ease: "power2.out", delay: 1.5 }
        );
      },
    });
  }, [target, label]);

  return (
    <div data-stat={label} className="font-display text-5xl font-bold text-accent-teal">
      {target}
      <div data-underline={label} className="h-1 bg-accent-teal mt-2"></div>
    </div>
  );
};
