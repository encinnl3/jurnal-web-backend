'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'

export default function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('id', id)

      if (profileData && profileData.length > 0) {
        setProfile(profileData[0])
      }

      const { data: entryData } = await (supabase.from('jurnal_entries') as any)
        .select('*')
        .eq('profile_id', id)
        .order('day', { ascending: true })

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
    return () => supabase.removeChannel(channel)
  }, [id])

  const handleAdminLogin = async () => {
    setError('')
    if (!profile) return
    if (profile.password !== password) { setError('Password salah'); return }
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    window.location.href = `/profile/${profile.id}`
  }

  if (loading) {
    return <div className="container-app py-20 text-center text-fg-muted">Loading...</div>
  }

  if (!profile) {
    return (
      <div className="container-app py-20">
        <div className="card p-8 text-center">
          <p className="text-fg-secondary mb-4">Profile tidak ditemukan</p>
          <a href="/" className="btn btn-primary">Kembali</a>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-8">
      <button onClick={() => router.back()} className="btn btn-ghost btn-sm mb-6">← Kembali</button>

      <div className="card mb-8 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="avatar-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-primary btn-sm">
            Admin
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Jurnal ({entries.length})</h2>

      {entries.length === 0 ? (
        <div className="card p-12 text-center text-fg-muted">Belum ada jurnal</div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="day-badge">Day {entry.day}</span>
                <h3 className="font-semibold flex-1">{entry.title}</h3>
              </div>
              {entry.foto_url && (
                <img src={entry.foto_url} alt={entry.title} className="w-full rounded-lg mb-4 max-h-64 object-cover" />
              )}
              <p className="text-fg-secondary text-sm whitespace-pre-wrap mb-3">{entry.deskripsi}</p>
              <p className="text-xs text-fg-muted">{new Date(entry.created_at).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => { setShowPasswordModal(false); setPassword(''); setError('') }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Admin</h2>
            <p className="text-fg-secondary text-sm mb-6">Masukkan password</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="input input-sm mb-4 w-full"
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              autoFocus
            />
            {error && <p className="message message-error mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setPassword(''); setError('') }} className="btn btn-ghost flex-1">Batal</button>
              <button onClick={handleAdminLogin} className="btn btn-primary flex-1">Masuk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
