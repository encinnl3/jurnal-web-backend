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

  if (loading) return <div className="flex items-center justify-center min-h-screen text-fg-muted">Loading...</div>

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="display text-5xl mb-3">Jurnal PKL</h1>
          <p className="text-fg-muted text-lg">Pilih profil untuk melihat jurnal</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {profiles.map((profile, i) => (
            <div
              key={profile.id}
              className="card hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer text-center py-8 px-6"
              onClick={() => router.push(`/visitor/${profile.id}`)}
            >
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-sm overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
              </div>
              <h2 className="font-semibold text-lg">{profile.name}</h2>
              <p className="text-fg-muted text-sm mt-1">Lihat Jurnal →</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
