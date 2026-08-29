"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JournalFeed } from "@/components/sections/JournalFeed";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Lightbox } from "@/components/sections/Lightbox";
import { formatDate } from "@/utils";
import { Search } from "lucide-react";

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      } else {
        setProfile({ full_name: params.slug, role_title: "Intern", bio: "Menjalani praktik kerja lapangan." });
        setEntries([
          { id: "1", title: "Minggu Pertama PKL", content: "<p>Pengenalan lingkungan kerja.</p>", week_number: 1, entry_date: "2025-01-10" }
        ]);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  const filteredEntries = entries.filter((e) => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">Memuat...</div>;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      
      {/* Profile Hero */}
      <section className="relative h-[70vh] min-h-[400px] flex items-end px-6 md:px-12 overflow-hidden bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent pt-16">
        <div className="absolute inset-0 bg-bg-secondary -z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent -z-10"></div>
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center md:items-start mb-24">
          <Avatar name={profile?.full_name || params.slug} slug={params.slug} size="xl" className="mb-8 shadow-[0_0_0_8px_rgba(0,180,166,0.15)] border-4 border-accent-teal" />
          <h1 className="font-display text-5xl font-bold text-text-primary mb-4">{profile?.full_name || params.slug}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="font-inter text-lg text-accent-orange">{profile?.role_title || "Intern"}</span>
            {profile?.company && <span className="font-inter text-lg text-text-secondary">at {profile.company}</span>}
          </div>
          <p className="font-inter text-text-secondary mb-8 max-w-2xl leading-relaxed">{profile?.bio}</p>
          <div className="flex gap-6 font-mono text-sm text-text-muted">
            <span>Mulai: {formatDate(profile?.start_date)}</span>
            <span>Selesai: {formatDate(profile?.end_date)}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex-1 py-16 flex gap-12 relative">
        {/* Sidebar Filters */}
        <aside className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          fixed md:sticky top-24 left-0 z-40 h-[calc(100vh-100px)] w-[280px] md:w-[240px] lg:w-[280px] bg-bg-secondary md:bg-transparent border-r border-border md:border-0 p-6 transition-transform
        `}>
          <h3 className="font-display text-lg font-bold text-text-primary mb-6">Filter</h3>
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Cari entri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-tertiary border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:border-accent-teal outline-none"
            />
          </div>
          
          <div className="space-y-4">
            <h4 className="font-inter text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">Minggu</h4>
            {Array.from(new Set(entries.map((e) => e.week_number))).sort((a, b) => b - a).map((week) => (
              <div key={week} className="px-4 py-2 rounded-lg hover:bg-bg-tertiary text-text-secondary text-sm cursor-pointer transition-colors">
                Minggu ke-{week}
              </div>
            ))}
          </div>
        </aside>

        {/* Feed */}
        <div className="flex-1 max-w-3xl">
          <JournalFeed entries={filteredEntries} />
          
          <div className="mt-24 border-t border-border pt-12">
            <h2 className="font-display text-3xl font-bold text-text-primary mb-8">Galeri Foto</h2>
            <GalleryGrid onSelectImage={setSelectedImage} />
          </div>
        </div>
      </div>

      {selectedImage && <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
      <Footer />
    </div>
  );
}
