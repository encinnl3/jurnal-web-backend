"use client";
import React, { useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { gsap } from "gsap";

export const ProfileCardsSection: React.FC = () => {
  const profiles = [
    { name: "Janandra", slug: "janandra", role: "Frontend Developer", company: "PT Tech Solution", preview: "Catatan proyek, kolaborasi, dan hasil kerja minggu ini.", count: 12 },
    { name: "Akmal", slug: "akmal", role: "Backend Developer", company: "CV Digital Kreasi", preview: "API, database, dan penyusunan sistem berjalan.", count: 10 },
    { name: "Farhan", slug: "farhan", role: "UI/UX Designer", company: "Studio Inovasi", preview: "Riset, wireframe, dan iterasi visual jurnal.", count: 11 },
  ];

  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".profile-card");
    cards?.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -8, duration: 0.3, ease: "power2.out" });
        gsap.to(card.querySelector(".card-border"), {
          borderColor: "#00B4A6",
          boxShadow: "0 0 0 1px #00B4A6, 0 12px 40px rgba(0,180,166,0.15)",
          duration: 0.3,
        });
        gsap.to(card.querySelector(".card-avatar"), { scale: 1.05, duration: 0.35, ease: "power2.out" });
        gsap.to(card.querySelector(".card-cta"), { x: 6, duration: 0.3, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(card.querySelector(".card-border"), {
          borderColor: "#2A2A2A",
          boxShadow: "none",
          duration: 0.4,
        });
        gsap.to(card.querySelector(".card-avatar"), { scale: 1, duration: 0.4 });
        gsap.to(card.querySelector(".card-cta"), { x: 0, duration: 0.35 });
      });
    });
  }, []);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-teal">PESERTA MAGANG</span>
        <h2 className="font-display text-4xl font-bold text-text-primary mt-2">Pilih Profil Jurnal</h2>
      </div>

      <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
        {profiles.map((p) => (
          <div
            key={p.slug}
            className="profile-card bg-bg-secondary card-border border border-border p-6 rounded-2xl flex flex-col items-center text-center relative mt-16 pt-16 transition-transform"
          >
            <div className="card-avatar absolute -top-14">
              <Avatar name={p.name} slug={p.slug} size="lg" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-orange bg-accent-orange/10 px-3 py-1 rounded-full mb-4">
              {p.role}
            </span>
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">{p.name}</h3>
            <p className="font-inter text-sm text-text-secondary mb-4">{p.company}</p>
            <p className="font-inter text-sm text-text-secondary line-clamp-3 mb-6">{p.preview}</p>
            <div className="font-mono text-xs text-text-muted mb-8">{p.count} entri</div>
            <Link href={`/profiles/${p.slug}`} className="mt-auto w-full">
              <Button variant="outline" size="md" className="w-full card-cta">
                Baca Jurnal →
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
