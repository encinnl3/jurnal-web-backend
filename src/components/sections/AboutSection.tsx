"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AboutSection: React.FC = () => {
  const imgRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapperRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 75%",
            end: "top 30%",
            scrub: 0.8,
          },
        }
      );

      gsap.fromTo(
        imgRef.current,
        { x: "30%" },
        {
          x: "0%",
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 75%",
            end: "top 30%",
            scrub: 0.8,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-teal">TENTANG PKL</span>
          <h2 className="font-display text-4xl font-bold text-text-primary mt-4 mb-6 border-l-4 border-accent-teal pl-6">
            Pengalaman Nyata di Dunia Industri
          </h2>
          <p className="font-inter text-base text-text-secondary leading-[1.8] mb-6">
            Program Praktik Kerja Lapangan (PKL) memberikan kesempatan kepada kami untuk belajar langsung dari
            lingkungan profesional. Selama 10 minggu, kami terlibat dalam proyek nyata, berkolaborasi dengan tim,
            dan mengembangkan keterampilan teknis maupun soft skill.
          </p>
          <p className="font-inter text-base text-text-secondary leading-[1.8]">
            Jurnal ini merupakan dokumentasi perjalanan kami, dari minggu pertama hingga presentasi akhir. Setiap
            entri mencerminkan pembelajaran, tantangan, dan pencapaian yang kami raih.
          </p>
        </div>
        <div ref={wrapperRef} className="overflow-hidden rounded-2xl">
          <div ref={imgRef} className="w-full aspect-video bg-bg-tertiary"></div>
        </div>
      </div>
    </section>
  );
};
