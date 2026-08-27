"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      toastRef.current,
      { xPercent: 110, opacity: 0 },
      { xPercent: 0, opacity: 1, duration: 0.4, ease: "expo.out" }
    );

    const timer = setTimeout(() => {
      gsap.to(toastRef.current, {
        xPercent: 110,
        opacity: 0,
        duration: 0.3,
        ease: "expo.in",
        onComplete: onClose,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      ref={toastRef}
      className={cn(
        "fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl border shadow-lg font-inter text-sm flex items-center gap-2",
        type === "success" ? "bg-bg-secondary border-accent-teal text-accent-teal" : "bg-bg-secondary border-accent-orange text-accent-orange"
      )}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
};
