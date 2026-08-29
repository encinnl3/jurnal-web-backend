"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const RevealSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section-eyebrow", {
        scrollTrigger: { trigger: ".section-eyebrow", start: "top 88%" },
        opacity: 0,
        y: 14,
        duration: 0.45,
        ease: "power2.out",
      });

      gsap.from(".section-title .line", {
        scrollTrigger: { trigger: ".section-title", start: "top 85%" },
        yPercent: 105,
        duration: 0.7,
        stagger: 0.1,
        ease: "power4.out",
      });

      gsap.from(".section-body", {
        scrollTrigger: { trigger: ".section-body", start: "top 88%" },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.15,
      });
    });
    return () => ctx.revert();
  }, []);

  return <div className={className}>{children}</div>;
};
