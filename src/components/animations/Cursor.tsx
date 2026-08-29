"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";

export const Cursor: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return;
    
    document.documentElement.classList.add("cursor-none");

    const dot = document.querySelector(".cursor-dot") as HTMLElement;
    const ring = document.querySelector(".cursor-ring") as HTMLElement;
    const ringText = document.querySelector(".cursor-ring-text") as HTMLElement;
    
    const move = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX - 4, y: e.clientY - 4, duration: 0.05, ease: "none" });
      gsap.to(ring, { x: e.clientX - 18, y: e.clientY - 18, duration: 0.18, ease: "power2.out" });
    };

    const handleEnterLink = () => {
      gsap.to(dot, { scale: 0, duration: 0.2 });
      gsap.to(ring, { scale: 2.2, backgroundColor: "rgba(0,180,166,0.2)", duration: 0.3 });
      if (ringText) ringText.textContent = "VER →";
      gsap.to(ringText, { opacity: 1, scale: 1, duration: 0.3 });
    };

    const handleLeaveLink = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(ring, { scale: 1, backgroundColor: "transparent", duration: 0.3 });
      gsap.to(ringText, { opacity: 0, scale: 0, duration: 0.3 });
    };

    const handleEnterEntry = () => {
      gsap.to(dot, { scale: 0, duration: 0.2 });
      gsap.to(ring, { scale: 2, backgroundColor: "rgba(0,180,166,0.2)", duration: 0.3 });
      if (ringText) ringText.textContent = "BACA";
      gsap.to(ringText, { opacity: 1, scale: 1, duration: 0.3 });
    };

    const handleEnterGallery = () => {
      gsap.to(dot, { scale: 0, duration: 0.2 });
      gsap.to(ring, { scale: 2.5, backgroundColor: "rgba(0,180,166,0.2)", duration: 0.3 });
      if (ringText) ringText.textContent = "DRAG";
      gsap.to(ringText, { opacity: 1, scale: 1, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    const handleMouseEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => handleEnterLink());
      el.addEventListener("mouseleave", handleLeaveLink);
    });
    document.querySelectorAll(".profile-card, .entry-card").forEach((el) => {
      el.addEventListener("mouseenter", () => handleEnterEntry());
      el.addEventListener("mouseleave", handleLeaveLink);
    });
    document.querySelectorAll(".gallery-item").forEach((el) => {
      el.addEventListener("mouseenter", () => handleEnterGallery());
      el.addEventListener("mouseleave", handleLeaveLink);
    });
    
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.classList.remove("cursor-none");
    };
  }, []);

  return (
    <>
      <div className="cursor-dot fixed top-0 left-0 w-2 h-2 rounded-full bg-accent-teal pointer-events-none z-[1000] mix-blend-difference" />
      <div className="cursor-ring fixed top-0 left-0 w-9 h-9 rounded-full border-2 border-accent-teal pointer-events-none z-[1000] flex items-center justify-center">
        <span className="cursor-ring-text text-[10px] font-bold text-white opacity-0 pointer-events-none uppercase tracking-wider leading-none"></span>
      </div>
    </>
  );
};
