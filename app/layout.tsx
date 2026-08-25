import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jurnal PKL",
  description: "Website jurnal PKL dengan Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f4eedd]">
        {children}
     </body>
   </html>
  );
}
