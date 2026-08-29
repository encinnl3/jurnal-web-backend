"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/utils";

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className, ...props }) => {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const handleMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      
      gsap.to(btn, { x: dx * 0.35, y: dy * 0.25, duration: 0.4, ease: "power2.out" });
      // Inner text moves slightly more for depth
      gsap.to(btn.querySelector(".btn-label"), {
        x: dx * 0.12, y: dy * 0.1, duration: 0.4, ease: "power2.out",
      });
    };
    const handleLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      gsap.to(btn.querySelector(".btn-label"), {
        x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)",
      });
    };
    btn.addEventListener("mousemove", handleMove);
    btn.addEventListener("mouseleave", handleLeave);
    return () => {
      btn.removeEventListener("mousemove", handleMove);
      btn.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div ref={btnRef} className={cn("inline-block", className)} {...props}>
      {children}
    </div>
  );
};
