"use client";
import React from "react";
import { Badge } from "@/components/ui/Badge";

interface Entry {
  id: string;
  title: string;
  content: string;
  week_number: number;
  entry_date: string;
  tags?: string[];
}

export const JournalFeed: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  return (
    <div className="space-y-8">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-bg-secondary border border-border p-6 rounded-2xl">
          <div className="font-mono text-xs text-accent-orange mb-2">
            Minggu {entry.week_number} · {entry.entry_date}
          </div>
          <h3 className="font-display text-xl font-bold text-text-primary mb-4">{entry.title}</h3>
          <div className="font-inter text-text-secondary text-sm leading-relaxed mb-6 line-clamp-4"
               dangerouslySetInnerHTML={{ __html: entry.content }} />
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, i) => (
                <Badge key={i} variant="teal">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
