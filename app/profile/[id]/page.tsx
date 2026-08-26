'use client'

import { use, useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
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
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === p.new.id ? p.new : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== p.old.id))
    }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center bg-[#0d0c0b] text-[#9e9587]">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[#0d0c0b] text-[#9e9587]">Tidak ditemukan</div>

  return (
    <div className="relative min-h-screen bg-[#0d0c0b] overflow-hidden">
      <Suspense fallback={null}><ThreeBackground /></Suspense>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="glass-card p-8 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-[#1c1a18] border border-[#3c352e] flex items-center justify-center text-[#c49a6c] text-lg font-semibold overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
              </div>
              <div>
                <p className="text-[#9e9587] text-[10px] uppercase tracking-[0.2em] mb-1">Profile</p>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{profile.name}</h1>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { localStorage.removeItem('jurnal-session'); window.location.href = `/visitor/${id}` }} className="text-[#9e9587] text-[10px] uppercase tracking-[0.15em] hover:text-white transition">
              Keluar dari Admin
            </motion.button>
          </div>
        </div>

        <AdminDashboard profile={profile} entriesCount={entries.length} onProfileUpdate={(p) => setProfile(p)} />

        <div className="flex items-center justify-between mt-12 mb-6">
          <h2 className="text-xl font-bold text-white">Jurnal <span className="text-[#c49a6c]">({entries.length})</span></h2>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm((s) => !s)} className="px-5 py-2.5 rounded-xl bg-[#c49a6c] text-[#0d0c0b] text-sm font-semibold hover:opacity-90 transition">
            {showForm ? 'Tutup' : '+ Tambah'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <JurnalForm profileId={id} onSuccess={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center text-[#9e9587] text-sm">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <JurnalEntryCard entry={entry} onDelete={() => { if (confirm('Hapus?')) (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) }} onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
