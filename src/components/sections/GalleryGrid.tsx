"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { cn } from "@/utils";

interface GalleryGridProps {
  images?: string[];
  onSelectImage: (url: string) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ images, onSelectImage }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(Observer);
  }, []);

  const items = images || [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800",
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const startX = e.clientX;
    const startScroll = trackRef.current?.scrollLeft || 0;
    const moveHandler = (ev: MouseEvent) => {
      if (trackRef.current) {
        trackRef.current.scrollLeft = startScroll - (ev.clientX - startX);
      }
    };
    const upHandler = () => {
      setDragging(false);
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
    };
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
  };

  return (
    <div ref={containerRef} className="relative group">
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "flex overflow-x-auto gap-4 py-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]",
          dragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((img, i) => (
          <div
            key={i}
            className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden border border-border hover:border-accent-teal transition-colors bg-bg-secondary"
            onClick={() => !dragging && onSelectImage(img)}
          >
            <img src={img} alt={`gallery-${i}`} className="w-full h-full object-cover" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
};
