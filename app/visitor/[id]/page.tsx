'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

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
      const { data: p } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (p?.length > 0) setProfile(p[0])
      const { data: e } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(e || [])
      setLoading(false)
    }
    fetchData()
    const ch = supabase.channel(`v-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (p) => {
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new as JurnalEntry].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === (p.new as JurnalEntry).id ? (p.new as JurnalEntry) : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== (p.old as JurnalEntry).id))
    }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  const handleLogin = async () => {
    setError('')
    if (!profile) return
    if (profile.password !== password) { setError('Password salah'); return }
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    window.location.href = `/profile/${profile.id}`
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#9c8b78]">Memuat...</div>
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-12">
        <p className="text-lg text-[#6b5e4e] mb-8">Profile tidak ditemukan</p>
        <a href="/" className="btn btn-primary">Kembali</a>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <section className="section-hero container-app" style={{paddingBottom: 0}}>
        <a href="/" className="tag mb-8">← Kembali</a>
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#b09678] flex items-center justify-center text-white font-bold text-4xl overflow-hidden shadow-lg">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
        </div>
        <h1 className="heading-xl display text-[#2c2418]">{profile.name}</h1>
        <p className="text-xl text-[#6b5e4e] max-w-md mx-auto font-light">
          Berikut adalah catatan harian selama menjalankan Praktik Kerja Lapangan.
        </p>
        <div className="mt-8">
          <button onClick={() => setShowModal(true)} className="btn btn-secondary">Admin</button>
        </div>
      </section>

      <section className="container-app section" style={{paddingTop: 40}}>
        {entries.length === 0 ? (
          <div className="text-center py-20 text-[#9c8b78] text-lg">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <article key={entry.id} className="bg-white rounded-[24px] border border-[#e8e2d9] overflow-hidden hover:shadow-md transition-shadow">
                {entry.foto_url && (
                  <div className="w-full h-[280px]">
                    <img src={entry.foto_url} alt={entry.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="tag" style={{padding: '5px 14px'}}>Day {entry.day}</span>
                    <h2 className="font-semibold text-lg text-[#2c2418]">{entry.title}</h2>
                  </div>
                  <div className="pl-5 border-l-2 border-[#b09678]">
                    <p className="text-[#6b5e4e] text-sm leading-relaxed whitespace-pre-wrap font-light">
                      {entry.deskripsi}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#f5f0e8]">
                    <time className="text-[10px] uppercase tracking-[0.2em] text-[#b09678] font-semibold">
                      {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
          <div className="bg-white rounded-[40px] p-12 max-w-md w-full border border-[#e8e2d9] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="heading-md display text-[#2c2418]">Admin Panel</h2>
            <p className="text-sm text-[#9c8b78] mb-8 uppercase tracking-wider">Masukkan password</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus
              className="w-full px-6 py-4 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full mb-6 text-center tracking-[0.5em] focus:outline-none focus:border-[#b09678]"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl mb-6 text-center">{error}</p>}
            <div className="flex gap-4">
              <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn btn-secondary flex-1">Batal</button>
              <button onClick={handleLogin} className="btn btn-primary flex-1">Masuk</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
