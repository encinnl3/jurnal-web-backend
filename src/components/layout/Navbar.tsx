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
    ScrollTrigger.create({
      start: "top -80px",
      onEnter: () => setIsScrolled(true),
      onLeaveBack: () => setIsScrolled(false),
    });
  }, []);

  const links = [
    { name: "Profil", href: "/profiles" },
    { name: "Jurnal", href: "/journal" },
    { name: "Tentang", href: "/about" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between transition-all duration-300",
        isScrolled && "bg-bg-secondary/90 backdrop-blur-md border-b border-border"
      )}
    >
      <Link href="/" className="font-display font-bold text-lg text-text-primary">
        PKL <span className="text-accent-teal">JOURNAL</span>
      </Link>
      
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "font-inter text-sm text-text-secondary hover:text-text-primary transition-colors relative nav-link",
              pathname === link.href && "text-text-primary"
            )}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Hamburger */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={cn("w-full h-0.5 bg-text-primary transition-all", menuOpen && "rotate-45 translate-y-2")} />
          <span className={cn("w-full h-0.5 bg-text-primary transition-all", menuOpen && "opacity-0")} />
          <span className={cn("w-full h-0.5 bg-text-primary transition-all", menuOpen && "-rotate-45 -translate-y-2")} />
        </div>
      </button>
    </nav>
  );
};
