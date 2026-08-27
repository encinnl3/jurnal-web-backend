"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatDate } from "@/utils";

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (prof) {
        setProfile(prof);
        const { data: ents } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("profile_id", prof.id)
          .order("entry_date", { ascending: false });
        setEntries(ents || []);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="h-64 bg-gradient-to-r from-bg-secondary to-bg-tertiary border-b border-border relative flex items-end px-12 pb-6 mt-16">
        <Avatar name={profile?.full_name || params.slug} slug={params.slug} size="xl" className="absolute -bottom-10 border-4 border-accent-teal" />
      </div>

      <div className="max-w-7xl mx-auto px-12 pt-16 pb-24 w-full flex-1">
        <h1 className="font-display text-4xl font-extrabold text-text-primary capitalize">{profile?.full_name || params.slug}</h1>
        <Badge variant="orange" className="mt-2">{profile?.role_title || "Intern"}</Badge>
        <p className="font-inter text-text-secondary mt-4 max-w-2xl">{profile?.bio || "Belum ada bio."}</p>

        <div className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-8">Jurnal Activity</h2>
          {entries.length === 0 ? (
            <p className="text-text-secondary font-inter">Belum ada entri jurnal yang dibuat.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-bg-secondary border border-border rounded-2xl p-6">
                  <span className="font-mono text-xs text-accent-orange">Minggu {entry.week_number} · {formatDate(entry.entry_date)}</span>
                  <h3 className="font-display text-xl font-bold text-text-primary mt-1">{entry.title}</h3>
                  <div className="prose prose-invert prose-sm max-w-none mt-4 text-text-secondary" dangerouslySetInnerHTML={{ __html: entry.content }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
