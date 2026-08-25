'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { id } = params
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('jurnal-session')
    if (!session) {
      window.location.href = `/visitor/${id}`
      return
    }
    const { profileId } = JSON.parse(session)
    if (profileId !== id) {
      window.location.href = `/visitor/${id}`
      return
    }
    setIsAdmin(true)
  }, [id])

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

  const handleLogout = () => {
    localStorage.removeItem('jurnal-session')
    window.location.href = `/visitor/${id}`
  }

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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-fg-secondary">Mengalihkan...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 bg-pattern">
      <div className="container-app max-w-4xl">
        <header className="card p-8 mb-8 flex items-center justify-between animate-in">
          <div className="flex items-center gap-6">
            <div className="avatar avatar-lg shadow-md">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <span className="badge mb-2">Admin Dashboard</span>
              <h1 className="text-3xl title-display">{profile.name}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary text-sm">
            Keluar dari Admin
          </button>
        </header>

        <AdminDashboard
          profile={profile}
          entriesCount={entries.length}
          onProfileUpdate={(p) => setProfile(p)}
        />

        <div className="flex items-center justify-between mb-6 mt-10">
          <h2 className="text-2xl title-display">Jurnal Harian</h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn btn-primary"
          >
            {showForm ? 'Tutup Form' : '+ Tambah Jurnal'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 animate-in">
            <JurnalForm profileId={id} onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {entries.length === 0 ? (
          <div className="card p-12 text-center text-fg-secondary">
            Belum ada jurnal. Klik "+ Tambah Jurnal" di atas.
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={entry.id} className={`animate-in animate-delay-${(index % 3) + 1}`}>
                <JurnalEntryCard
                  entry={entry}
                  onDelete={() => {
                    if (!confirm('Hapus entry ini?')) return
                    ;(supabase.from('jurnal_entries') as any).delete().eq('id', entry.id)
                    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                  }}
                  onChanged={handleEntryChanged}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
