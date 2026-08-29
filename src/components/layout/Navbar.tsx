"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: "top -80px",
      onEnter: () => setIsScrolled(true),
      onLeaveBack: () => setIsScrolled(false),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      gsap.fromTo(".mobile-menu", { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: "expo.out" });
      gsap.from(".mobile-menu .nav-item", { x: 60, opacity: 0, stagger: 0.07, duration: 0.4, ease: "power3.out", delay: 0.2 });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const links = [
    { name: "Profil", href: "/profiles" },
    { name: "Jurnal", href: "/profiles/janandra" },
    { name: "Tentang", href: "/about" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 px-6 md:px-12 h-14 md:h-16 flex items-center justify-between transition-all duration-300",
          isScrolled ? "bg-bg-secondary/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        )}
      >
        <Link href="/" className="font-display font-bold text-lg text-text-primary tracking-tight">
          PKL <span className="text-accent-teal">JOURNAL</span>
       </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "nav-link relative font-inter text-sm transition-colors",
                pathname === link.href ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {link.name}
           </Link>
          ))}
       </div>

        {/* Hamburger */}
        <button
          aria-label="Toggle menu"
          className="md:hidden w-6 h-5 flex flex-col justify-between"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={cn("w-full h-0.5 bg-text-primary transition-all duration-300", menuOpen && "rotate-45 translate-y-2")} />
          <span className={cn("w-full h-0.5 bg-text-primary transition-all duration-300", menuOpen && "opacity-0 scale-x-0")} />
          <span className={cn("w-full h-0.5 bg-text-primary transition-all duration-300", menuOpen && "-rotate-45 -translate-y-2")} />
       </button>
     </nav>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="mobile-menu md:hidden fixed inset-0 z-40 bg-bg-primary flex flex-col items-center justify-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="nav-item font-display font-bold text-4xl text-text-primary hover:text-accent-teal transition-colors"
            >
              {link.name}
           </Link>
          ))}
       </div>
      )}
    </>
  );
};
