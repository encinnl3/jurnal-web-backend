"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/utils";

gsap.registerPlugin(ScrollTrigger);

export const HorizontalScrollSection: React.FC = () => {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalWidth = trackRef.current?.offsetWidth || 0;
    const containerWidth = window.innerWidth;

    gsap.to(trackRef.current, {
      x: -(totalWidth - containerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: pinRef.current,
        pin: true,
        scrub: 1,
        start: "top top",
        end: `+=${totalWidth}`,
      },
    });
  }, []);

  return (
    <section ref={pinRef} className="h-screen overflow-hidden">
      <div ref={trackRef} className="flex h-full w-[300vw]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-screen h-full flex items-center px-24">
            <h2 className="font-display text-9xl font-extrabold opacity-5 text-text-primary">0{i}</h2>
            <div className="ml-12">
              <h3 className="font-display text-5xl font-bold text-text-primary">Intern {i}</h3>
              <p className="text-secondary text-base mt-4 max-w-sm">Latest weekly entry highlight...</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
