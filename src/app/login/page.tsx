"use client";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, slug")
        .eq("user_id", authData.user.id)
        .single();

      if (profile?.role === "super_admin") {
        router.push("/admin");
      } else if (profile?.slug) {
        router.push(`/profiles/${profile.slug}/admin`);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-bg-secondary border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-xl text-text-primary">
            PKL <span className="text-accent-teal">JOURNAL</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-text-primary mt-6">Masuk ke Akun</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="font-inter text-sm text-accent-orange">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </main>
  );
}
