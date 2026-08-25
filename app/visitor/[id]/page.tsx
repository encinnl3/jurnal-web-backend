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
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching profile with ID:', id)
      const profileRes = await (supabase.from('profiles') as any).select('*').eq('id', id).single()
      console.log('Profile response:', profileRes)
      
      const entryRes = await (supabase.from('jurnal_entries') as any)
        .select('*')
        .eq('profile_id', id)
        .order('day', { ascending: true })
      console.log('Entries response:', entryRes)

      setProfile(profileRes.data)
      setEntries(entryRes.data || [])
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

  const handleAdminLogin = async () => {
    setError('')
    const { data, error: e } = await (supabase.from('profiles') as any)
      .select('id, name, password')
      .eq('id', id)
      .single()

    if (e || !data) { setError('Gagal mengambil data profil'); return }
    if (data.password !== password) { setError('Password salah'); return }

    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: data.id, name: data.name }))
    window.location.href = `/profile/${data.id}`
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
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="card p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4">Profile tidak ditemukan</h2>
          <p className="text-fg-secondary mb-4">ID: {id}</p>
          <p className="text-fg-secondary text-sm mb-4">
            Kemungkinan: database belum di-setup atau koneksi Supabase bermasalah.
          </p>
          <p className="text-fg-secondary text-sm mb-6">
            Pastikan sudah menjalankan SQL di SETUP_DATABASE.md
          </p>
          <a href="/" className="btn btn-primary">Kembali ke Beranda</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 bg-pattern">
      <div className="container-app max-w-3xl">
        <a href="/" className="btn btn-ghost text-sm mb-8">← Kembali</a>

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
              <span className="badge-outline badge mb-2">Mode Baca</span>
              <h1 className="text-3xl title-display">{profile.name}</h1>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
          >
            🔒 Admin
          </button>
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 animate-in">
          <div className="card p-10 max-w-sm w-full">
            <h2 className="text-2xl title-display mb-2">Mode Admin</h2>
            <p className="text-fg-secondary mb-6">Masukkan password untuk mengakses dashboard admin.</p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="input mb-4"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin() }}
            />

            {error && <p className="message message-error mb-4">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setPassword(''); setError('') }} className="btn btn-secondary flex-1">
                Batal
              </button>
              <button onClick={handleAdminLogin} className="btn btn-primary flex-1">
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
