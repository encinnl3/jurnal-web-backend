import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProfileCardsSection } from "@/components/sections/ProfileCardsSection";
import { Cursor } from "@/components/animations/Cursor";
import { Preloader } from "@/components/animations/Preloader";

export default function LandingPage() {
  return (
    <main>
      <Preloader />
      <Cursor />
      <Navbar />
      <HeroSection />
      <ProfileCardsSection />
      <Footer />
    </main>
  );
}
