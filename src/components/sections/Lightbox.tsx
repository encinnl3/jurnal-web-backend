"use client";
import React, { useState } from "react";
import { cn } from "@/utils";

interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6" onClick={onClose}>
      <img src={images[index]} alt="Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
      <button className="absolute top-6 right-6 text-white text-xl" onClick={onClose}>✕</button>
    </div>
  );
};
