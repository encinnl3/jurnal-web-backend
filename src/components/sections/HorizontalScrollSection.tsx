"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export const HorizontalScrollSection: React.FC = () => {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const panels = [
    { num: "01", name: "Janandra", slug: "janandra", title: "Setup Architecture & System Design", excerpt: "Integrasi dasar Supabase auth, layouting Next.js App Router, dan visual theme.", week: "Minggu 1" },
    { num: "02", name: "Akmal", slug: "akmal", title: "Building Core REST APIs & Database Trigger", excerpt: "Penyusunan RLS schema, trigger max 3 profiles, dan sinkronisasi real-time.", week: "Minggu 1" },
    { num: "03", name: "Farhan", slug: "farhan", title: "Designing Industrial Design System", excerpt: "Merancang visual identity, typography scale, palette teal-orange, dan animasi GSAP.", week: "Minggu 1" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = gsap.to(trackRef.current, {
        xPercent: -((100 / 3) * 2),
        ease: "none",
        scrollTrigger: {
          trigger: pinRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=200%",
          snap: { snapTo: 1 / 2, duration: 0.5, ease: "power2.inOut" },
          onUpdate: (self) => {
            const idx = Math.round(self.progress * 2);
            setActiveIdx(idx);
          },
        },
      });
    }, pinRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={pinRef} className="h-screen overflow-hidden relative bg-bg-primary">
      <div ref={trackRef} className="flex h-full w-[300vw]">
        {panels.map((p, i) => (
          <div key={i} className="w-screen h-full flex items-center px-12 md:px-24 relative">
            {/* Watermark panel number */}
            <span className="absolute top-1/2 left-12 -translate-y-1/2 font-display text-[14rem] md:text-[20rem] font-bold text-text-primary opacity-5 select-none pointer-events-none">
              {p.num}
            </span>

            <div className="relative z-10 max-w-xl">
              <span className="font-mono text-xs text-accent-orange uppercase tracking-wider mb-2 block">{p.week}</span>
              <h3 className="font-display text-3xl md:text-5xl font-bold text-text-primary mb-4">{p.name}</h3>
              <h4 className="font-display text-xl text-accent-teal mb-4">{p.title}</h4>
              <p className="font-inter text-text-secondary text-base leading-relaxed mb-8">{p.excerpt}</p>
              <Link href={`/profiles/${p.slug}`} className="font-inter font-medium text-accent-teal hover:underline inline-flex items-center gap-2">
                Baca →
              </Link>
            </div>

            <div className="hidden md:block ml-auto w-[400px] h-[500px] bg-bg-secondary border border-border rounded-2xl overflow-hidden relative">
              <div className="w-full h-full bg-gradient-to-br from-bg-tertiary to-bg-secondary flex items-center justify-center font-mono text-xs text-text-muted">
                Cover Entri {p.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {panels.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIdx === i ? "bg-accent-teal w-8" : "border border-border bg-transparent"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
