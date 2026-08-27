"use client";
import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";
import { gsap } from "gsap";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  fullScreen = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25 }
      );
      gsap.fromTo(
        panelRef.current,
        { yPercent: 4, opacity: 0, scale: 0.98 },
        { yPercent: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }
      );
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={cn(
          "bg-bg-secondary border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto relative",
          fullScreen ? "w-full h-full" : "w-full max-w-3xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-bg-tertiary border border-border text-text-secondary hover:text-accent-teal hover:border-accent-teal transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};
