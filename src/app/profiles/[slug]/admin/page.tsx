import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default function ProfileAdminPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-4xl mx-auto w-full">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-8">Admin Panel: {params.slug}</h1>
        <ProfileForm profile={{ full_name: params.slug }} userId="" onSuccess={(msg) => alert(msg)} />
      </main>
      <Footer />
    </div>
  );
}
