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
    return <div className="container-app py-20 text-center text-fg-muted">Loading...</div>
  }

  return (
    <div className="container-app py-16">
      <div className="text-center mb-12 animate-in">
        <h1 className="text-4xl font-bold mb-2">Jurnal PKL</h1>
        <p className="text-fg-secondary">Pilih profil untuk melihat jurnal</p>
      </div>

      <div className="profiles-grid">
        {profiles.map((profile, index) => (
          <div
            key={profile.id}
            className="card profile-card animate-in"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => router.push(`/visitor/${profile.id}`)}
          >
            <div className="avatar">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg truncate">{profile.name}</h2>
              <p className="text-sm text-fg-muted">Lihat jurnal →</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
