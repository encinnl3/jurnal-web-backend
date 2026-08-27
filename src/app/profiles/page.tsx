"use client";
import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function ProfilesPage() {
  const profiles = [
    { name: "Janandra", slug: "janandra", role: "Intern" },
    { name: "Akmal", slug: "akmal", role: "Intern" },
    { name: "Farhan", slug: "farhan", role: "Intern" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest text-accent-teal uppercase">Peserta Magang</span>
        <h1 className="font-display text-5xl font-extrabold text-text-primary mt-2">Daftar Interns</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {profiles.map((p) => (
          <div key={p.slug} className="bg-bg-secondary border border-border p-8 rounded-2xl flex flex-col items-center text-center">
            <Avatar name={p.name} slug={p.slug} size="lg" className="-mt-14 mb-4" />
            <h3 className="font-display text-2xl font-bold text-text-primary">{p.name}</h3>
            <Link href={`/profiles/${p.slug}`} className="mt-6 font-inter text-sm text-accent-teal font-semibold hover:underline">Lihat Jurnal →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
