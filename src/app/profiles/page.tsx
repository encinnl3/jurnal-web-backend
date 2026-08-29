import React from "react";
import { ProfileCardsSection } from "@/components/sections/ProfileCardsSection";

export default function ProfilesPage() {
  return (
    <main className="min-h-screen bg-bg-primary pt-24">
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-teal">PROFIL PESERTA</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mt-2">Daftar Intern</h1>
      </section>
      <ProfileCardsSection />
    </main>
  );
}
