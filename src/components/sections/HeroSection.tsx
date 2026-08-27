"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/Button";

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.6 })
      .from(".hero-headline", { opacity: 0, y: 40, duration: 0.8 }, "-=0.2")
      .from(".hero-subtext", { opacity: 0, y: 20, duration: 0.5 }, "-=0.3");
  }, []);

  return (
    <section ref={heroRef} className="h-screen flex flex-col items-center justify-center text-center px-6">
      <span className="hero-eyebrow text-xs font-semibold tracking-widest text-accent-teal uppercase">Laporan Praktik Kerja Lapangan</span>
      <h1 className="hero-headline font-display text-7xl font-extrabold mt-4 text-text-primary">Jurnal Magang Kami</h1>
      <p className="hero-subtext text-lg text-text-secondary mt-6 max-w-md">Dokumentasi perjalanan 10 minggu PKL di industri.</p>
      <div className="flex gap-4 mt-10">
        <Button>Lihat Profil</Button>
        <Button variant="outline">Baca Jurnal</Button>
      </div>
    </section>
  );
};
