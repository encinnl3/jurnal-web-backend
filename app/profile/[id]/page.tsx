'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'

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
      const { data: profileData } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (profileData?.length > 0) setProfile(profileData[0])
      const { data: entryData } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(entryData || [])
      setLoading(false)
    }
    fetchData()
    const channel = supabase.channel(`admin-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (payload) => {
      if (payload.eventType === 'INSERT') setEntries((prev) => [...prev, payload.new as JurnalEntry].sort((a, b) => a.day - b.day))
      else if (payload.eventType === 'UPDATE') setEntries((prev) => prev.map((e) => e.id === (payload.new as JurnalEntry).id ? (payload.new as JurnalEntry) : e))
      else if (payload.eventType === 'DELETE') setEntries((prev) => prev.filter((e) => e.id !== (payload.old as JurnalEntry).id))
    }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center text-sm text-[#9c8b78]">Memuat...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profile tidak ditemukan</div>

  return (
    <div className="max-w-[800px] mx-auto px-8 py-16">
      <header className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#f5ede2] border border-[#ece8e1] flex items-center justify-center text-[#b89870] font-bold text-2xl overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
          <h1 className="heading-display text-4xl text-[#2c2418]">{profile.name}</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('jurnal-session'); window.location.href = `/visitor/${id}` }} className="text-xs uppercase tracking-[0.1em] font-semibold px-5 py-2.5 border border-[#ece8e1] rounded-md hover:bg-[#f5ede2] transition-colors text-[#6b5c4c]">
          Keluar
        </button>
      </header>

      <AdminDashboard profile={profile} entriesCount={entries.length} onProfileUpdate={(p) => setProfile(p)} />

      <div className="flex items-center justify-between mb-10 mt-16">
        <h2 className="heading-display text-2xl text-[#2c2418]">Jurnal ({entries.length})</h2>
        <button onClick={() => setShowForm((s) => !s)} className="btn-main">
          {showForm ? 'Tutup' : '+ Tambah'}
        </button>
      </div>

      {showForm && <div className="mb-10"><JurnalForm profileId={id} onSuccess={() => setShowForm(false)} /></div>}

      {entries.length === 0 ? (
        <div className="text-center py-20 text-[#9c8b78]">Belum ada jurnal.</div>
      ) : (
        <div className="space-y-10">
          {entries.map((entry) => (
            <JurnalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => { if (confirm('Hapus?')) (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((prev) => prev.filter((e) => e.id !== entry.id)) }}
              onChanged={(updated) => setEntries((prev) => prev.map((e) => e.id === updated.id ? updated : e).sort((a, b) => a.day - b.day))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
