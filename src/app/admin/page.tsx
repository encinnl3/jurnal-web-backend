"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/utils";

export default function AdminPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .order("display_order", { ascending: true });
      setProfiles(profs || []);

      const { data: logs } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setActivityLog(logs || []);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary p-12 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-bold text-text-primary mb-12">Super Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-12 border-b border-border pb-4">
        <Button variant={activeTab === "dashboard" ? "primary" : "secondary"} onClick={() => setActiveTab("dashboard")}>Overview</Button>
        <Button variant={activeTab === "profiles" ? "primary" : "secondary"} onClick={() => setActiveTab("profiles")}>Kelola Profil</Button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {activeTab === "dashboard" && (
        <div>
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="bg-bg-secondary p-8 rounded-2xl border border-border">
              <span className="font-display text-3xl font-bold text-accent-teal">{profiles.length} Profil Aktif</span>
            </div>
            <div className="bg-bg-secondary p-8 rounded-2xl border border-border">
              <span className="font-display text-3xl font-bold text-text-primary">Total Entri: {activityLog.length}</span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-text-primary mb-6">Aktivitas Terakhir</h2>
          <div className="flex flex-col gap-4">
            {activityLog.map((log) => (
              <div key={log.id} className="bg-bg-tertiary p-4 rounded-xl font-mono text-xs text-text-muted border border-border">
                [{new Date(log.created_at).toLocaleString()}] {log.profile_id} melakukan {log.action} pada {log.entity}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "profiles" && (
        <div>
          <div className="flex justify-end mb-6">
            <Button>+ Tambah Profil</Button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {profiles.map((p) => (
              <div key={p.id} className="bg-bg-secondary p-6 rounded-2xl border border-border flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary border-2 border-accent-teal flex items-center justify-center text-accent-teal font-display font-bold text-xl">
                  {p.full_name.charAt(0)}
                </div>
                <h3 className="font-display font-bold text-text-primary text-lg">{p.full_name}</h3>
                <p className="font-mono text-xs text-text-muted">/{p.slug}</p>
                <div className="flex gap-2 mt-4 w-full">
                  <Button variant="secondary" className="w-full">Edit</Button>
                  <Button variant="danger" className="w-full">Reset PW</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
