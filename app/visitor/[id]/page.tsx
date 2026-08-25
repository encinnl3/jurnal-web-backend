'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import Link from 'next/link'

export default function VisitorPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: profileData }, { data: entryData }] = await Promise.all([
        (supabase.from('profiles') as any).select('*').eq('id', id).single(),
        (supabase.from('jurnal_entries') as any)
          .select('*')
          .eq('profile_id', id)
          .order('day', { ascending: true }),
      ])

      setProfile(profileData)
      setEntries(entryData || [])
      setLoading(false)
    }
    fetchData()

    const channel = supabase
      .channel(`visitor-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jurnal_entries',
          filter: `profile_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => {
              if (prev.find((e) => e.id === (payload.new as JurnalEntry).id)) return prev
              return [...prev, payload.new as JurnalEntry].sort((a, b) => a.day - b.day)
            })
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) =>
              prev.map((e) =>
                e.id === (payload.new as JurnalEntry).id ? (payload.new as JurnalEntry) : e
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((e) => e.id !== (payload.old as JurnalEntry).id))
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#8b5e3c]">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#8b5e3c]">Profile tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="diary-card rounded-2xl p-6 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b5e3c] to-[#5d3f25] flex items-center justify-center text-[#f1e7d0] font-bold text-3xl shadow-md">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#4a3c31] handwriting">
              {profile.name}
            </h1>
            <span className="text-xs text-[#8b5e3c] bg-[#f1e7d0] px-2 py-1 rounded">
              Mode Baca
            </span>
          </div>
        </header>

        <h2 className="text-lg font-semibold text-[#4a3c31] mb-6">
          Jurnal Harian ({entries.length})
        </h2>

        {entries.length === 0 ? (
          <div className="diary-card rounded-2xl p-12 text-center">
            <p className="text-[#8b5e3c]">
              Belum ada jurnal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="diary-card rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-[#d3c9b0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="stamp">Day {entry.day}</span>
                    <h3 className="font-semibold text-[#4a3c31]">
                      {entry.title}
                    </h3>
                  </div>
                </div>
                {entry.foto_url && (
                  <img
                    src={entry.foto_url}
                    alt={entry.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="text-[#4a3c31] whitespace-pre-wrap">
                    {entry.deskripsi}
                  </p>
                  <p className="text-xs text-[#8b5e3c] mt-3">
                    {new Date(entry.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
