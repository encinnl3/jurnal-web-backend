import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="h-64 bg-gradient-to-r from-bg-secondary to-bg-tertiary border-b border-border relative flex items-end px-12 pb-6">
        <Avatar name={params.slug} slug={params.slug} size="xl" className="absolute -bottom-10 border-4 border-accent-teal" />
      </div>

      <div className="max-w-7xl mx-auto px-12 pt-16 pb-24">
        <h1 className="font-display text-4xl font-extrabold text-text-primary capitalize">{params.slug}</h1>
        <Badge variant="orange" className="mt-2">Intern</Badge>

        <div className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-6">Jurnal Activity</h2>
          <p className="text-text-secondary">Belum ada entri jurnal yang dibuat.</p>
        </div>
      </div>
    </div>
  );
}
