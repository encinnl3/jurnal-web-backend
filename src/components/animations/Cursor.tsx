"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";

export const Cursor: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.querySelector(".cursor-dot") as HTMLElement;
    const ring = document.querySelector(".cursor-ring") as HTMLElement;
    
    const move = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.05 });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.18, ease: "power2.out" });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div className="cursor-dot fixed top-0 left-0 w-2 h-2 rounded-full bg-accent-teal pointer-events-none z-[1000]" />
      <div className="cursor-ring fixed top-0 left-0 w-9 h-9 rounded-full border-2 border-accent-teal pointer-events-none z-[1000]" />
    </>
  );
};
