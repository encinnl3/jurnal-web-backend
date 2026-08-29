import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  const links = ["Profil", "Jurnal", "Tentang", "Kontak"];

  return (
    <footer className="bg-bg-primary border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <div className="font-display font-bold text-text-primary text-lg mb-4">
            PKL <span className="text-accent-teal">JOURNAL</span>
          </div>
          <p className="font-inter text-sm text-text-secondary max-w-sm">
            Jurnal praktik kerja lapangan 2025 — dokumentasi perjalanan 3 intern.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          {links.map((l) => (
            <Link key={l} href="/profiles" className="font-inter text-sm text-text-secondary hover:text-text-primary transition-colors">
              {l}
            </Link>
          ))}
          <p className="font-inter text-xs text-text-muted mt-6">Made with ☕ during PKL</p>
        </div>
      </div>
    </footer>
  );
};
