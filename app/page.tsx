'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

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

  return (
    <main className="min-h-screen">
      <section className="section-hero container-app">
        <span className="tag">PKL Diary Archive</span>
        <h1 className="heading-xl display text-[#2c2418]">Jurnal PKL</h1>
        <p className="text-xl text-[#6b5e4e] max-w-md mx-auto font-light">
          Rekam jejak pengalaman harian para peserta Praktik Kerja Lapangan.
        </p>
      </section>

      <section className="container-app mb-24 max-w-3xl">
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="card-profile"
              onClick={() => router.push(`/visitor/${profile.id}`)}
            >
              <div className="avatar-circle">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <div className="text-center">
                <h2 className="card-title text-[#2c2418] mb-1">{profile.name}</h2>
                <span className="card-subtitle">Peserta PKL</span>
              </div>
              <button className="btn btn-primary w-full py-2.5 text-xs">Buka Jurnal</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
