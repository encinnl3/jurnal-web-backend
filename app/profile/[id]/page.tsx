'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem('jurnal-session')
    if (!session) { window.location.href = `/visitor/${id}`; return }
    const { profileId } = JSON.parse(session)
    if (profileId !== id) { window.location.href = `/visitor/${id}`; return }
    setIsAdmin(true)
  }, [id])

  useEffect(() => {
    const fetchData = async () => {
      const { data: p } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (p?.length > 0) setProfile(p[0])
      const { data: e } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(e || [])
      setLoading(false)
    }
    fetchData()
    const ch = supabase.channel(`a-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (p) => {
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new as JurnalEntry].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === (p.new as JurnalEntry).id ? (p.new as JurnalEntry) : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== (p.old as JurnalEntry).id))
    }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center text-[#9c8b78]">Memuat...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Tidak ditemukan</div>

  return (
    <main className="min-h-screen">
      <section className="section-hero container-app" style={{paddingBottom: 0}}>
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#b09678] flex items-center justify-center text-white font-bold text-4xl overflow-hidden shadow-lg">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
        </div>
        <h1 className="heading-xl display text-[#2c2418]">{profile.name}</h1>
        <p className="text-xl text-[#6b5e4e] font-light mb-8">{entries.length} jurnal</p>
        <button onClick={() => { localStorage.removeItem('jurnal-session'); window.location.href = `/visitor/${id}` }} className="btn btn-secondary">Keluar dari Admin</button>
      </section>

      <section className="container-app section" style={{paddingTop: 40}}>
        <AdminDashboard profile={profile} entriesCount={entries.length} onProfileUpdate={(p) => setProfile(p)} />

        <div className="flex items-center justify-between mt-16 mb-10">
          <h2 className="heading-md display text-[#2c2418]">Jurnal</h2>
          <button onClick={() => setShowForm((s) => !s)} className="btn btn-primary">{showForm ? 'Tutup' : '+ Tambah'}</button>
        </div>

        {showForm && <div className="mb-10"><JurnalForm profileId={id} onSuccess={() => setShowForm(false)} /></div>}

        {entries.length === 0 ? (
          <div className="text-center py-20 text-[#9c8b78] text-lg">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-10">
            {entries.map((entry) => (
              <JurnalEntryCard key={entry.id} entry={entry}
                onDelete={() => { if (confirm('Hapus?')) (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) }}
                onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
