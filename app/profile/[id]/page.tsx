'use client'

import { use, useEffect, useState, Suspense, useRef } from 'react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  if (loading || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09] text-stone-500">Loading...</div>
  )
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[#0c0a09]">Tidak ditemukan</div>

  const handleAvatarClick = () => fileInputRef.current?.click()

  return (
    <div className="relative min-h-screen bg-[#0c0a09] overflow-hidden">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="glass-card p-10 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg shadow-amber-900/20 cursor-pointer hover:scale-105 transition" onClick={handleAvatarClick}>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const compressed = await compressImage(file, 400, 0.8)
                  const ext = file.name.split('.').pop() || 'jpg'
                  const fileName = `${profile.id}/avatar.${ext}`
                  const { error } = await supabase.storage.from('avatars').upload(fileName, compressed, { upsert: true })
                  if (!error) {
                    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
                    setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }))
                  }
                }} />
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
              </div>
              <div>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">Profile</p>
                <h1 className="text-3xl font-bold text-white" style={{fontFamily: "'Playfair Display', serif"}}>
                  {profile.name}
                </h1>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { localStorage.removeItem('jurnal-session'); window.location.href = `/visitor/${id}` }}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition"
            >
              Keluar dari Admin
            </motion.button>
          </div>
        </div>

        <AdminDashboard profile={profile} entriesCount={entries.length} onProfileUpdate={(p) => setProfile(p)} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-16 mb-8"
        >
          <h2 className="text-2xl font-bold text-white">Jurnal <span className="text-amber-500">({entries.length})</span></h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm((s) => !s)}
            className="px-6 py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-900/20"
          >
            {showForm ? 'Tutup' : '+ Tambah'}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden"
            >
              <JurnalForm profileId={id} onSuccess={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center text-stone-500">Belum ada jurnal</div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <JurnalEntryCard
                    entry={entry}
                    onDelete={() => { if (confirm('Hapus?')) (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) }}
                    onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}