'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import Link from 'next/link'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'
import { useSession } from '@/components/SessionProvider'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!session) {
      window.location.href = '/'
      return
    }
    if (session.profileId !== id) {
      window.location.href = `/visitor/${id}`
    }
  }, [session, id])

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: profileData }, { data: entryData }] = await Promise.all([
        (supabase.from('profiles') as any)
          .select('*')
          .eq('id', id)
          .single(),
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
  }, [id])

  useEffect(() => {
    const channel = supabase
      .channel(`jurnal-${id}`)
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

  const handleEntryChanged = (updated: JurnalEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => a.day - b.day)
    )
  }

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
      <div className="max-w-4xl mx-auto">
        <header className="diary-card rounded-3xl p-8 mb-6 flex items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8d6e63] to-[#5d4037] flex items-center justify-center text-white font-bold text-3xl shadow-md overflow-hidden border-2 border-white">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#3e2723] glow-text handwriting">
              {profile.name}
            </h1>
            <p className="text-sm text-[#8d6e63]">
              Bergabung sejak {new Date(profile.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('jurnal-session')
              window.location.href = '/'
            }}
            className="text-[#8d6e63] hover:text-red-700 text-sm px-4 py-2 rounded-xl border border-[#d3c9b0] hover:border-red-300 transition"
          >
            Logout
          </button>
        </header>

        <AdminDashboard
          profile={profile}
          entriesCount={entries.length}
          onProfileUpdate={(p) => setProfile(p)}
        />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#4a3c31]">
            Jurnal Harian ({entries.length})
          </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-[#8b5e3c] text-[#f1e7d0] px-4 py-2 rounded-xl font-semibold hover:bg-[#5d3f25] transition flex items-center gap-2"
          >
            <span>+</span> Tambah Entry
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <JurnalForm profileId={id} onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {entries.length === 0 ? (
          <div className="diary-card rounded-2xl p-12 text-center">
            <p className="text-[#8b5e3c]">
              Belum ada jurnal entry. Klik tombol di atas untuk menambah.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JurnalEntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => {
                  if (!confirm('Hapus entry ini?')) return
                  (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id)
                  setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                }}
                onChanged={handleEntryChanged}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
