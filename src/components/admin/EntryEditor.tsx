"use client";
import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface EntryEditorProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const EntryEditor: React.FC<EntryEditorProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [week, setWeek] = useState(initialData?.week_number || 1);
  const [date, setDate] = useState(initialData?.entry_date || new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Tulis cerita PKL-mu hari ini..." })],
    content: initialData?.content || "",
  });

  const handleSave = () => {
    onSave({
      title,
      content: editor?.getHTML() || "",
      week_number: parseInt(week),
      entry_date: date,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <h2 className="font-display text-xl font-bold text-text-primary">
          {initialData ? "Edit Entri" : "Entri Baru"}
        </h2>
        <Button variant="secondary" size="sm" onClick={onCancel}>Batal</Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Input label="Judul Entri" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Tanggal" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Minggu ke-" type="number" min={1} value={week} onChange={(e) => setWeek(e.target.value)} />
        </div>
      </div>

      <div className="bg-bg-primary rounded-xl border border-border p-4 min-h-[250px] mb-6 focus-within:border-accent-teal transition-colors">
        <EditorContent editor={editor} className="prose prose-invert prose-sm max-w-none" />
      </div>

      <Button onClick={handleSave} className="w-full">
        {initialData ? "Simpan Perubahan" : "Publikasikan"}
      </Button>
    </div>
  );
};
