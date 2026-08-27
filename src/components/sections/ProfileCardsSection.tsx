import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const ProfileCardsSection: React.FC = () => {
  const profiles = [
    { name: "Janandra", slug: "janandra", role: "Frontend" },
    { name: "Akmal", slug: "akmal", role: "Backend" },
    { name: "Farhan", slug: "farhan", role: "UI/UX" },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
      {profiles.map((p) => (
        <div key={p.slug} className="bg-bg-secondary border border-border p-8 rounded-2xl flex flex-col items-center text-center">
          <Avatar name={p.name} slug={p.slug} size="lg" className="-mt-20 mb-4" />
          <h3 className="font-display text-xl font-bold text-text-primary">{p.name}</h3>
          <Badge variant="orange" className="mt-2 mb-4">{p.role}</Badge>
          <Button variant="outline" size="sm" className="mt-auto">Baca Jurnal →</Button>
        </div>
      ))}
    </section>
  );
};
