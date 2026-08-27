import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const ProfileCardsSection: React.FC = () => {
  const profiles = [
    { name: "Janandra", slug: "janandra" },
    { name: "Akmal", slug: "akmal" },
    { name: "Farhan", slug: "farhan" },
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
      {profiles.map((p) => (
        <div key={p.slug} className="bg-bg-secondary border border-border p-8 rounded-2xl flex flex-col items-center text-center">
          <Avatar name={p.name} slug={p.slug} size="lg" className="-mt-20 mb-4" />
          <h3 className="font-display text-xl font-bold text-text-primary mb-6">{p.name}</h3>
          <Link href={`/profiles/${p.slug}`}>
            <Button variant="outline" size="sm" className="mt-auto">Baca Jurnal →</Button>
          </Link>
        </div>
      ))}
    </section>
  );
};
