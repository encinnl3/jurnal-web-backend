"use client";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const TimelineSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const milestones = [
    { title: "Minggu 1: Orientasi", desc: "Pengenalan lingkungan, setup SDK, dan eksplorasi paket styling." },
    { title: "Minggu 3: First Project", desc: "Pembangunan modul autentikasi dan manajemen sesi berbasis cookie." },
    { title: "Minggu 6: Mid-Review", desc: "Pemeriksaan performa Lighthouse, optimasi gambar, dan mock API." },
    { title: "Minggu 8: Main Project", desc: "Implementasi fitur utama Jurnal PKL dan integrasi Supabase." },
    { title: "Minggu 10: Final Presentation", desc: "Deploy ke Vercel, dokumentasi kode, dan presentasi portofolio." },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      milestones.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: `.milestone-zone-${i}`,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-12 relative">
      <div className="w-full md:w-1/3 flex flex-col gap-6 md:sticky top-32 h-fit">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-teal">LINIMASA</span>
        <h2 className="font-display text-4xl font-bold text-text-primary mt-2 mb-8">Perjalanan 10 Minggu</h2>

        {milestones.map((m, i) => (
          <div key={i} className="flex flex-col gap-2">
            <button
              className={`text-left font-display text-xl md:text-2xl font-bold transition-all duration-300 ${
                active === i ? "text-accent-teal opacity-100" : "text-text-primary opacity-30"
              }`}
            >
              0{i + 1}. {m.title.split(":")[1]?.trim() || m.title}
            </button>
          </div>
        ))}
      </div>

      <div className="w-full md:w-2/3 relative min-h-[50vh]">
        {milestones.map((m, i) => (
          <div key={i} className={`milestone-zone-${i} min-h-[50vh] flex items-center`}>
            <div className={`bg-bg-secondary p-8 md:p-12 rounded-2xl border border-border transition-all duration-300 w-full ${
              active === i ? "opacity-100 translate-x-0" : "opacity-30 -translate-x-4"
            }`}>
              <h3 className="font-display text-3xl text-accent-teal mb-6">Minggu ke-{i + 1}</h3>
              <p className="font-inter text-text-secondary text-lg leading-relaxed">
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
