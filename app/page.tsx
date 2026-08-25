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
        <div className="text-[#8b5e3c] text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#4a3c31] mb-3 handwriting">
            Jurnal PKL
          </h1>
          <p className="text-[#8b5e3c] text-lg">
            Pilih profil untuk masuk
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="diary-card rounded-2xl p-8 flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5e3c] to-[#5d3f25] flex items-center justify-center text-[#f1e7d0] font-bold text-3xl shadow-md">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-semibold text-xl text-[#4a3c31] handwriting">
                {profile.name}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/login/${profile.id}`)}
                  className="stamp hover:bg-[#8b5e3c] hover:text-[#f1e7d0] transition cursor-pointer"
                >
                  masuk
                </button>
                <button
                  onClick={() => router.push(`/visitor/${profile.id}`)}
                  className="stamp hover:bg-[#5d3f25] hover:text-[#f1e7d0] transition cursor-pointer"
                >
                  lihat
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#8b5e3c]">
            Klik profil untuk login
          </p>
        </div>
      </div>
    </div>
  )
}
