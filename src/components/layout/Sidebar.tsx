import React from "react";
import Link from "next/link";
import { cn } from "@/utils";

interface SidebarProps {
  activeTab: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab }) => {
  const items = [
    { name: "Profil Saya", id: "profile" },
    { name: "Entri Jurnal", id: "entries" },
    { name: "Foto", id: "photos" },
    { name: "Pengaturan", id: "settings" },
  ];

  return (
    <div className="w-[240px] h-screen bg-bg-secondary border-r border-border p-6 flex flex-col gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "px-4 py-3 rounded-lg font-inter text-sm transition-colors relative",
            activeTab === item.id 
              ? "bg-accent-teal/10 text-accent-teal" 
              : "text-text-secondary hover:bg-bg-tertiary"
          )}
        >
          {activeTab === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-accent-teal rounded-r" />}
          {item.name}
        </Link>
      ))}
    </div>
  );
};
