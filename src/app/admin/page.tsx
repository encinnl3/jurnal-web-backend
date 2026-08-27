import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-6xl mx-auto w-full">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-12">Super Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-bg-secondary border border-border rounded-2xl p-8">
            <p className="text-text-secondary text-sm mb-1">Total Profil</p>
            <p className="font-display text-4xl font-bold text-accent-teal">3</p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-2xl p-8">
            <p className="text-text-secondary text-sm mb-1">Total Entri</p>
            <p className="font-display text-4xl font-bold text-accent-teal">0</p>
          </div>
          <div className="bg-bg-secondary border border-border rounded-2xl p-8">
            <p className="text-text-secondary text-sm mb-1">Total Foto</p>
            <p className="font-display text-4xl font-bold text-accent-teal">0</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
