import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Jurnal PKL",
  description: "Website jurnal PKL dengan Supabase realtime",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f1e7d0]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
