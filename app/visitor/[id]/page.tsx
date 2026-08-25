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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-[#9c8b78]">Memuat...</div>
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center bg-white p-12 rounded-2xl border border-[#ece8e1]">
        <p className="text-[#6b5c4c] mb-6">Profile tidak ditemukan.</p>
        <a href="/" className="btn-main">Kembali ke Beranda</a>
      </div>
    </div>
  )

  return (
    <div className="max-w-[800px] mx-auto px-8 py-16">
      <a href="/" className="text-xs uppercase tracking-[0.1em] text-[#9c8b78] hover:text-[#2c2418] transition-colors mb-16 inline-block">
        ← Kembali
      </a>

      <header className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#f5ede2] border border-[#ece8e1] flex items-center justify-center text-[#b89870] font-bold text-2xl overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
          <h1 className="heading-display text-4xl text-[#2c2418]">{profile.name}</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="text-xs uppercase tracking-[0.1em] font-semibold px-5 py-2.5 border border-[#ece8e1] rounded-md hover:bg-[#f5ede2] transition-colors text-[#6b5c4c]">
          Admin
        </button>
      </header>

      <div className="space-y-12">
        {entries.length === 0 ? (
          <div className="text-center py-20 text-[#9c8b78]">Belum ada jurnal.</div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="group">
              <div className="flex items-center gap-3 mb-4">
                <span className="day-badge">Day {entry.day}</span>
                <h2 className="heading-display text-2xl text-[#2c2418]">{entry.title}</h2>
              </div>
              {entry.foto_url && (
                <div className="rounded-2xl overflow-hidden mb-6 border border-[#ece8e1]">
                  <img src={entry.foto_url} alt={entry.title} className="w-full h-[320px] object-cover" />
                </div>
              )}
              <div className="pl-5 border-l-2 border-[#f5ede2]">
                <p className="text-[#6b5c4c] text-[15px] leading-relaxed whitespace-pre-wrap font-light">
                  {entry.deskripsi}
                </p>
              </div>
              <div className="mt-6 pt-4 border-b border-[#f5ede2]">
                <time className="text-[11px] uppercase tracking-widest text-[#b89870]">
                  {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </div>
            </article>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#2c2418]/40 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
          <div className="bg-white rounded-2xl p-10 max-w-sm w-full border border-[#ece8e1] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="heading-display text-2xl text-[#2c2418] mb-2">Admin Panel</h2>
            <p className="text-xs text-[#9c8b78] mb-8 uppercase tracking-wider">Masukkan password</p>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus
              className="w-full px-4 py-3 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg mb-4 text-sm focus:outline-none focus:border-[#b89870] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn-main flex-1 bg-[#fdfcf8] text-[#6b5c4c] border border-[#ece8e1]">Batal</button>
              <button onClick={handleAdminLogin} className="btn-main flex-1">Masuk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
