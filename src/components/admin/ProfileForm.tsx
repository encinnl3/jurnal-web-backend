"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Avatar } from "@/components/ui/Avatar";

interface ProfileFormProps {
  profile: any;
  userId: string;
  onSuccess: (message: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, userId, onSuccess }) => {
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        company: form.company,
        role_title: form.role_title,
        bio: form.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    setLoading(false);
    if (!error) onSuccess("Profil berhasil disimpan ✓");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-6">
        <Avatar name={form.full_name} size="xl" />
        <div>
          <p className="font-inter text-sm font-medium text-text-primary mb-1">Foto Profil</p>
          <Button type="button" variant="secondary" size="sm">Unggah Foto</Button>
        </div>
      </div>
      <Input
        label="Nama Lengkap"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
      />
      <Input
        label="Perusahaan / Instansi"
        value={form.company || ""}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />
      <Input
        label="Jabatan / Divisi"
        value={form.role_title || ""}
        onChange={(e) => setForm({ ...form, role_title: e.target.value })}
      />
      <Textarea
        label="Bio"
        value={form.bio || ""}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
};
