"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { cn } from "@/utils";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxImageProps {
  src: string;
  alt: string;
  depth?: number;
  className?: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt, depth = 0.15, className }) => {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(imgRef.current, {
      y: `-${depth * 100}%`,
      ease: "none",
      scrollTrigger: { trigger: imgRef.current, scrub: true },
    });
  }, [depth]);

  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={imgRef} className="h-[120%]">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    </div>
  );
};
