'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'

export default function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (profileData?.length > 0) setProfile(profileData[0])
      const { data: entryData } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(entryData || [])
      setLoading(false)
    }
    fetchData()
    const channel = supabase.channel(`visitor-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (payload) => {
      if (payload.eventType === 'INSERT') setEntries((prev) => [...prev, payload.new as JurnalEntry].sort((a, b) => a.day - b.day))
      else if (payload.eventType === 'UPDATE') setEntries((prev) => prev.map((e) => e.id === (payload.new as JurnalEntry).id ? (payload.new as JurnalEntry) : e))
      else if (payload.eventType === 'DELETE') setEntries((prev) => prev.filter((e) => e.id !== (payload.old as JurnalEntry).id))
    }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const handleAdminLogin = async () => {
    setError('')
    if (!profile) return
    if (profile.password !== password) { setError('Password salah'); return }
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    window.location.href = `/profile/${profile.id}`
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-fg-muted">Loading...</div>
  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card text-center p-10">
        <p className="text-fg-muted mb-4">Profile tidak ditemukan</p>
        <a href="/" className="btn btn-md btn-primary">Kembali</a>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6 py-12">
      <a href="/" className="text-sm text-fg-muted hover:text-fg mb-8 inline-block">← Kembali</a>

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-sm">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
          <h1 className="text-3xl font-bold display">{profile.name}</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-md btn-ghost">Admin</button>
      </div>

      {entries.length === 0 ? (
        <div className="card text-center p-16 text-fg-muted">Belum ada jurnal</div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md">Day {entry.day}</span>
                <h3 className="font-semibold text-lg">{entry.title}</h3>
              </div>
              {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full rounded-lg mb-4 max-h-72 object-cover" />}
              <p className="text-fg-muted text-sm whitespace-pre-wrap leading-relaxed">{entry.deskripsi}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-fg-muted">{new Date(entry.created_at).toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Admin</h2>
            <p className="text-fg-muted text-sm mb-6">Masukkan password</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="input mb-4 w-full" onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} autoFocus />
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn btn-md btn-ghost flex-1">Batal</button>
              <button onClick={handleAdminLogin} className="btn btn-md btn-primary flex-1">Masuk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
