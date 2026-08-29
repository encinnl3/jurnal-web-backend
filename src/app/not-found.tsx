"use client";
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <h1 className="font-display text-[12rem] font-bold text-accent-teal opacity-20 leading-none mb-4">404</h1>
      <p className="font-inter text-xl text-text-secondary mb-8">Halaman tidak ditemukan</p>
      <Link href="/" className="bg-accent-teal text-bg-primary px-8 py-3 rounded-full font-semibold">Kembali ke Beranda</Link>
    </div>
  );
}
