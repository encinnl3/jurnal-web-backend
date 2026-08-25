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
        <p className="text-xl text-[#6b5e4e] max-w-lg mx-auto font-light">
          Rekam jejak pengalaman harian para peserta Praktik Kerja Lapangan.
        </p>
      </section>

      <section className="container-app mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="card-profile"
              onClick={() => router.push(`/visitor/${profile.id}`)}
            >
              <div className="avatar-circle">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : profile.name.charAt(0)}
              </div>
              <div className="text-center">
                <h2 className="card-title text-[#2c2418]">{profile.name}</h2>
                <span className="card-subtitle">Peserta PKL</span>
              </div>
              <button className="btn btn-primary w-full">Buka Jurnal</button>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
