"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PhotoUploaderProps {
  profileId: string;
  entryId?: string;
  onUploadComplete: (path: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ profileId, entryId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const path = `${profileId}/${entryId || "gallery"}/${fileName}`;

    const { error } = await supabase.storage.from("photos").upload(path, file);

    if (!error) {
      onUploadComplete(path);
    }
    setUploading(false);
  };

  return (
    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-accent-teal transition-colors">
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="photo-upload" />
      <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-4">
        <Upload className="text-text-muted" size={32} />
        <div>
          <p className="font-inter text-sm text-text-primary font-medium">
            {uploading ? "Mengunggah..." : "Klik atau seret foto ke sini"}
          </p>
          <p className="font-inter text-xs text-text-muted mt-1">JPG, PNG, WEBP (Maks 5MB)</p>
        </div>
      </label>
    </div>
  );
};
