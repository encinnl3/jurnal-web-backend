'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/types'
import { useSession } from '@/components/SessionProvider'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const { session } = useSession()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      router.push(`/profile/${session.profileId}`)
    }
  }, [session, router])

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-fg-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern py-20">
      <div className="container-app">
        <div className="text-center mb-16 animate-in">
          <h1 className="text-6xl title-display text-gradient mb-6">
            Jurnal PKL
          </h1>
          <p className="text-xl text-fg-secondary max-w-lg mx-auto">
            Selamat datang! Pilih profil Anda untuk memulai perjalanan jurnal hari ini.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className={`card card-elevated p-8 flex flex-col items-center gap-6 animate-in animate-delay-${(index % 3) + 1}`}
            >
              <div className="avatar avatar-lg shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-2xl font-bold text-fg-primary title-display">
                {profile.name}
              </h2>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => router.push(`/login/${profile.id}`)}
                  className="btn btn-primary flex-1"
                >
                  Masuk
                </button>
                <button
                  onClick={() => router.push(`/visitor/${profile.id}`)}
                  className="btn btn-secondary flex-1"
                >
                  Lihat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
