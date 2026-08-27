"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

    if (authError || !authData.user) {
      setError(authError?.message || "Login gagal");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, slug")
      .eq("user_id", authData.user.id)
      .single();

    if (!profile) {
      setError("Profil tidak ditemukan");
      setLoading(false);
      return;
    }

    if (profile.role === "super_admin") {
      router.push("/admin");
    } else {
      router.push(`/profiles/${profile.slug}/admin`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="bg-bg-secondary border border-border rounded-2xl p-8 max-w-md w-full">
        <h1 className="font-display font-bold text-2xl mb-2 text-text-primary">Masuk ke Akun</h1>
        <p className="font-inter text-sm text-text-secondary mb-6">Portal PKL Journal</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          {error && <span className="text-xs text-accent-orange">{error}</span>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
