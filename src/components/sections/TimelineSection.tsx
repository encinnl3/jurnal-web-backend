"use client";
import React, { useState } from "react";
import { cn } from "@/utils";

export const TimelineSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const milestones = ["Orientasi", "Proyek 1", "Review 1", "Proyek Utama", "Final"];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto flex gap-24">
      <div className="w-1/3 flex flex-col gap-6">
        {milestones.map((m, i) => (
          <button 
            key={m} 
            onClick={() => setActive(i)}
            className={cn("text-left font-display text-2xl font-bold transition-all", active === i ? "text-accent-teal" : "text-text-primary opacity-30")}
          >
            0{i+1}. {m}
          </button>
        ))}
      </div>
      <div className="w-2/3 bg-bg-secondary p-12 rounded-2xl border border-border">
        <h3 className="font-display text-4xl text-text-primary">{milestones[active]}</h3>
        <p className="text-text-secondary mt-6">Detail aktivitas minggu {active + 1}...</p>
      </div>
    </section>
  );
};
