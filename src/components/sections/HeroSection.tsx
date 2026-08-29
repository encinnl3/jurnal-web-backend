"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CountdownTimer } from "@/components/animations/CountdownTimer";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const handleMouse = (e: MouseEvent) => {
      const { innerWidth: W, innerHeight: H } = window;
      const xNorm = (e.clientX / W - 0.5) * 2;
      const yNorm = (e.clientY / H - 0.5) * 2;
      const layers = document.querySelectorAll(".hero-layer");
      layers.forEach((layer) => {
        const depth = parseFloat((layer as HTMLElement).dataset.depth || "0.1");
        gsap.to(layer, {
          x: xNorm * depth * 60,
          y: yNorm * depth * 40,
          duration: 1.2,
          ease: "power2.out",
        });
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" })
        .from(".hero-headline .word", { yPercent: 110, duration: 0.75, stagger: 0.08, ease: "power4.out" }, "-=0.2")
        .from(".hero-subtext", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(".hero-stat", { opacity: 0, y: 24, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 16, stagger: 0.12, duration: 0.5, ease: "power2.out" }, "-=0.2");

      gsap.to(".scroll-line", {
        yPercent: 100,
        duration: 1.0,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.2,
      });

      ScrollTrigger.create({
        start: "top -15%",
        onEnter: () => gsap.to(".scroll-indicator", { opacity: 0, y: 10, duration: 0.4 }),
        onLeaveBack: () => gsap.to(".scroll-indicator", { opacity: 1, y: 0, duration: 0.4 }),
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const renderHeadline = () => {
    const words = ["Jurnal", "Magang", "Kami"];
    return words.map((w, i) => (
      <span key={i} className="word-wrapper inline-block overflow-hidden align-bottom mr-3">
        <span className="word inline-block">{w}</span>
      </span>
    ));
  };

  return (
    <section
      ref={heroRef}
      className="h-screen relative overflow-hidden flex flex-col items-center justify-center px-6"
    >
      <div className="hero-layer absolute inset-0 bg-bg-primary" data-depth="0.05" />
      <div
        className="hero-layer absolute inset-0 opacity-30"
        data-depth="0.12"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,180,166,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(249,115,22,0.1), transparent 40%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/80 to-[#0A0A0A] z-10" />

      <div
        className="hero-layer relative z-20 max-w-3xl mx-auto flex flex-col items-center text-center"
        data-depth="0.22"
      >
        <span className="hero-eyebrow text-xs font-semibold tracking-[0.12em] text-accent-teal uppercase mb-6">
          Laporan Praktik Kerja Lapangan
        </span>

        <h1 className="hero-headline font-display text-5xl md:text-7xl font-bold leading-[0.9] tracking-[-0.04em] text-text-primary mb-8">
          {renderHeadline()}
        </h1>

        <p className="hero-subtext font-inter text-lg text-text-secondary mb-12 max-w-md leading-relaxed">
          Dokumentasi perjalanan 10 minggu PKL di industri.
        </p>

        <div className="hero-stat-row flex items-stretch gap-6 md:gap-12 mb-16 border-y border-border py-6">
          <div className="hero-stat flex flex-col items-center px-4 md:px-8 border-r border-border">
            <span className="font-display text-4xl md:text-5xl font-bold text-accent-teal leading-none mb-2">3</span>
            <span className="font-inter text-xs md:text-sm text-text-secondary uppercase tracking-wider">Peserta Magang</span>
          </div>
          <div className="hero-stat flex flex-col items-center px-4 md:px-8 border-r border-border">
            <span className="font-display text-4xl md:text-5xl font-bold text-accent-teal leading-none mb-2">10</span>
            <span className="font-inter text-xs md:text-sm text-text-secondary uppercase tracking-wider">Minggu PKL</span>
          </div>
          <div className="hero-stat flex flex-col items-center px-4 md:px-8">
            <span className="font-display text-4xl md:text-5xl font-bold text-accent-teal leading-none mb-2">2025</span>
            <span className="font-inter text-xs md:text-sm text-text-secondary uppercase tracking-wider">Tahun Pelaksanaan</span>
          </div>
        </div>

        <CountdownTimer />

        <div className="flex flex-col sm:flex-row gap-4 hero-cta mt-12">
          <Link href="/profiles">
            <Button size="lg">Lihat Profil</Button>
          </Link>
          <Link href="/profiles/janandra">
            <Button variant="outline" size="lg">Baca Jurnal</Button>
          </Link>
        </div>
      </div>

      <div className="scroll-indicator fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
        <span className="text-text-muted text-xs tracking-[0.2em] uppercase font-inter">Scroll</span>
        <div className="scroll-arrow w-px h-8 bg-text-muted relative overflow-hidden">
          <div className="scroll-line absolute top-0 left-0 w-full h-full bg-accent-teal" />
        </div>
      </div>
    </section>
  );
};
