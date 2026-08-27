import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-[12rem] font-extrabold text-accent-teal opacity-20 leading-none mb-4">404</h1>
      <p className="font-inter text-xl text-text-secondary mb-8">Halaman tidak ditemukan</p>
      <Button onClick={() => window.location.href = "/"}>Kembali ke Beranda</Button>
    </div>
  );
}
