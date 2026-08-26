'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
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
      <div className="min-h-screen flex items-center justify-center text-[#9c8b78]">
        Loading...
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <section className="section-hero">
        <span className="tag">Praktik Kerja Lapangan</span>
        <h1 className="heading-xl">Jurnal PKL</h1>
        <p className="text-lg text-[#6b5e4e] max-w-lg mx-auto mt-6">
          Rekam jejak pengalaman harian para peserta PKL.
        </p>
      </section>

      <div className="container-app mb-24">
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
                <h2 className="card-title">{profile.name}</h2>
                <span className="card-subtitle">Peserta PKL</span>
              </div>
              <button className="btn btn-primary w-full">Buka Jurnal</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
