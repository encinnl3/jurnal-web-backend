'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

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
        <div className="text-fg-secondary">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-fg-secondary">Profile tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 bg-pattern">
      <div className="container-app max-w-3xl">
        <a href="/" className="btn btn-ghost text-sm mb-8">← Kembali</a>

        <header className="card p-8 mb-8 flex items-center gap-6 animate-in">
          <div className="avatar avatar-lg shadow-md">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <span className="badge-outline badge mb-2">Mode Baca</span>
            <h1 className="text-3xl title-display">{profile.name}</h1>
          </div>
        </header>

        <h2 className="text-2xl title-display mb-6">Jurnal Harian</h2>

        {entries.length === 0 ? (
          <div className="card p-12 text-center text-fg-secondary">
            Belum ada jurnal.
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={entry.id} className={`card p-0 overflow-hidden animate-in animate-delay-${(index % 3) + 1}`}>
                <div className="journal-entry p-6 flex items-center gap-3">
                  <span className="badge">Day {entry.day}</span>
                  <h3 className="text-xl font-semibold title-display">{entry.title}</h3>
                </div>
                {entry.foto_url && (
                  <img src={entry.foto_url} alt={entry.title} className="mx-6 rounded-xl" style={{maxHeight: 320, width: 'calc(100% - 48px)', objectFit: 'cover'}} />
                )}
                <div className="p-6 pt-4">
                  <p className="text-fg-secondary leading-relaxed whitespace-pre-wrap">{entry.deskripsi}</p>
                  <div className="divider" />
                  <p className="text-sm text-fg-muted">{new Date(entry.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
