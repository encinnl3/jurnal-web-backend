"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const Preloader: React.FC = () => {
  const preloaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("visited")) {
      preloaderRef.current?.remove();
      return;
    }
    const tl = gsap.timeline();
    tl.to(".preloader-word", { opacity: 1, letterSpacing: "-0.04em", duration: 0.9, ease: "power4.out" })
      .to(".preloader-word", { opacity: 0, y: -40, duration: 0.5, ease: "power2.in", delay: 0.3 })
      .to(preloaderRef.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut", onComplete: () => {
        sessionStorage.setItem("visited", "true");
        preloaderRef.current?.remove();
      }});
  }, []);

  return (
    <div ref={preloaderRef} className="fixed inset-0 z-[999] bg-bg-primary flex items-center justify-center">
      <span className="preloader-word opacity-0 font-display font-extrabold text-8xl text-text-primary">PKL</span>
    </div>
  );
};
