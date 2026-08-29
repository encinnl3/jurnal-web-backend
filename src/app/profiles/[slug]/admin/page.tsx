"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { EntryEditor } from "@/components/admin/EntryEditor";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Drawer } from "@/components/ui/Drawer";
import { cn } from "@/utils";

export default function ProfileAdminPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

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
    }
    loadData();
  }, [params.slug]);

  const handleSaveEntry = async (data: any) => {
    if (!profile) return;
    if (editingEntry) {
      const { error } = await supabase
        .from("journal_entries")
        .update(data)
        .eq("id", editingEntry.id);
      if (!error) setToast({ message: "Entri berhasil diperbarui ✓" });
    } else {
      const { error } = await supabase
        .from("journal_entries")
        .insert([{ ...data, profile_id: profile.id }]);
      if (!error) setToast({ message: "Entri baru ditambahkan ✓" });
    }
    setIsDrawerOpen(false);
    setEditingEntry(null);
  };

  const tabs = [
    { id: "profile", name: "Profil Saya" },
    { id: "entries", name: "Entri Jurnal" },
    { id: "photos", name: "Foto" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <div className="w-[240px] border-r border-border bg-bg-secondary p-6 flex flex-col gap-2">
        <h2 className="font-display font-bold text-lg text-text-primary mb-6">Admin Panel</h2>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-3 rounded-lg font-inter text-sm text-left transition-all relative",
              activeTab === t.id
                ? "bg-accent-teal/10 text-accent-teal font-medium"
                : "text-text-secondary hover:bg-bg-tertiary"
            )}
          >
            {activeTab === t.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent-teal rounded-r" />}
            {t.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 max-w-4xl">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {activeTab === "profile" && profile && (
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-8">Pengaturan Profil</h1>
            <ProfileForm
              profile={profile}
              userId={user?.id}
              onSuccess={(msg) => setToast({ message: msg })}
            />
          </div>
        )}

        {activeTab === "entries" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-display text-3xl font-bold text-text-primary">Daftar Entri Jurnal</h1>
              <Button onClick={() => { setEditingEntry(null); setIsDrawerOpen(true); }}>
                + Tambah Entri
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {entries.map((e) => (
                <div key={e.id} className="bg-bg-secondary border border-border p-6 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-accent-orange">Minggu {e.week_number} · {e.entry_date}</span>
                    <h3 className="font-display font-bold text-text-primary text-lg mt-1">{e.title}</h3>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => { setEditingEntry(e); setIsDrawerOpen(true); }}>
                    Edit
                  </Button>
                </div>
              ))}
            </div>

            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
              <EntryEditor
                initialData={editingEntry}
                onSave={handleSaveEntry}
                onCancel={() => setIsDrawerOpen(false)}
              />
            </Drawer>
          </div>
        )}

        {activeTab === "photos" && profile && (
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-8">Galeri Foto</h1>
            <PhotoUploader
              profileId={profile.id}
              onUploadComplete={() => setToast({ message: "Foto berhasil diunggah ✓" })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
