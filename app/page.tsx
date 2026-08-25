'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/types'
import Link from 'next/link'

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setProfiles(data)
      setLoading(false)
    }

    fetchProfiles()

    const channel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProfiles((prev) => [payload.new as Profile, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setProfiles((prev) =>
              prev.map((p) => (p.id === (payload.new as Profile).id ? (payload.new as Profile) : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setProfiles((prev) => prev.filter((p) => p.id !== (payload.old as Profile).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-full bg-[#f4eedd] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4a3c31]">
              Jurnal PKL
           </h1>
            <p className="text-[#8b5e3c] mt-1">
              Daftar profile peserta PKL
           </p>
         </div>
          <Link
            href="/profile/new"
            className="bg-[#8b5e3c] text-[#f4eedd] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            + Tambah Profile
         </Link>
       </div>

        {loading ? (
          <p className="text-[#8b5e3c]">Loading</p>
        ) : profiles.length === 0 ? (
          <div className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl p-10 text-center">
            <p className="text-[#8b5e3c]">
              Belum ada profile. Klik tombol di atas untuk tambah.
           </p>
         </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl p-5 hover:border-[#8b5e3c] transition shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#8b5e3c] flex items-center justify-center text-[#f4eedd] font-bold text-lg mb-3">
                  {profile.name.charAt(0).toUpperCase()}
               </div>
                <h2 className="font-semibold text-[#4a3c31]">
                  {profile.name}
               </h2>
                <p className="text-xs text-[#8b5e3c] mt-1">
                  {new Date(profile.created_at).toLocaleDateString('id-ID')}
               </p>
             </Link>
            ))}
         </div>
        )}
     </div>
   </div>
  )
}
