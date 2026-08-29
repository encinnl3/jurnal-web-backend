import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProfileCardsSection } from "@/components/sections/ProfileCardsSection";
import { HorizontalScrollSection } from "@/components/sections/HorizontalScrollSection";
import { Marquee } from "@/components/sections/Marquee";
import { AboutSection } from "@/components/sections/AboutSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { Cursor } from "@/components/animations/Cursor";
import { Preloader } from "@/components/animations/Preloader";

export default function LandingPage() {
  return (
    <main className="bg-bg-primary min-h-screen">
      <Preloader />
      <Cursor />
      <Navbar />
      <HeroSection />
      <ProfileCardsSection />
      <HorizontalScrollSection />
      <Marquee />
      <AboutSection />
      <TimelineSection />
      <Footer />
    </main>
  );
}
