'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any)
        .select('id, name, avatar_url')
        .order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#9c8b78]">
        Memuat...
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col justify-center py-20">
      <div className="container-app w-full">
        <header className="text-center mb-20">
          <span className="text-xs uppercase tracking-[0.2em] text-[#b89870] font-semibold mb-3 block">
            Praktik Kerja Lapangan
          </span>
          <h1 className="heading-display text-5xl md:text-6xl text-[#2c2418] mb-4">
            Jurnal PKL
          </h1>
          <p className="text-[#6b5c4c] text-base md:text-lg max-w-md mx-auto font-light">
            Arsip kegiatan harian. Pilih salah satu profil di bawah untuk melihat laporan.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="card-profile group cursor-pointer"
              onClick={() => router.push(`/visitor/${profile.id}`)}
            >
              <div className="w-20 h-20 rounded-full bg-[#f5ede2] flex items-center justify-center text-[#b89870] font-bold text-2xl group-hover:scale-105 transition-transform overflow-hidden border border-[#ece8e1]">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="text-center">
                <h2 className="heading-display text-xl text-[#2c2418] mb-1">
                  {profile.name}
                </h2>
                <span className="text-xs text-[#9c8b78]">Peserta PKL</span>
              </div>
              <button className="btn-main w-full mt-2">
                Buka Jurnal →
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
