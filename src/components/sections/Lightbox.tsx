"use client";
import React, { useEffect } from "react";
import { gsap } from "gsap";
import { X } from "lucide-react";

interface LightboxProps {
  image: string;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ image, onClose }) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".lightbox-overlay", { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        ".lightbox-image",
        { scale: 0.88, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    });
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      ctx.revert();
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleClose = () => {
    gsap.to(".lightbox-image", { scale: 0.92, opacity: 0, duration: 0.25 });
    gsap.to(".lightbox-overlay", { opacity: 0, duration: 0.3, onComplete: onClose });
  };

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-bg-tertiary border border-border text-text-primary hover:text-accent-teal hover:border-accent-teal transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <img
        src={image}
        alt="lightbox"
        className="lightbox-image max-w-full max-h-[90vh] object-contain rounded-lg"
      />
    </div>
  );
};
