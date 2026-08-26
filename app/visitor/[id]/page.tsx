'use client'

import { use, useEffect, useState, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'
import AdminDashboard from '@/components/AdminDashboard'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const theme = profile?.theme || 'mocha'
    document.body.className = `theme-${theme}`
    return () => { document.body.className = '' }
  }, [profile])

  useEffect(() => {
    const session = localStorage.getItem('jurnal-session')
    if (session) {
      try {
        const { profileId } = JSON.parse(session)
        if (profileId === id) setIsAdmin(true)
      } catch {}
    }

    const fetchData = async () => {
      const { data: p } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (p?.length > 0) setProfile(p[0])
      const { data: e } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(e || [])
      setLoading(false)
    }
    fetchData()

    const channel = supabase.channel(`page-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (p) => {
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === p.new.id ? p.new : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== p.old.id))
    }).subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  const handleLogin = async () => {
    setError('')
    if (!profile) return
    if (profile.password !== password) { setError('Password salah'); return }
    
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    setIsAdmin(true)
    setShowModal(false)
    setPassword('')
  }

  const handleLogout = () => {
    localStorage.removeItem('jurnal-session')
    setIsAdmin(false)
    setShowForm(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d0c0b] text-[#9e9587]">Loading...</div>
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0c0b]">
      <div className="glass-card p-12 text-center">
        <p className="text-[#9e9587] mb-6">Profile tidak ditemukan</p>
        <a href="/" className="px-6 py-3 rounded-full bg-white/10 text-white text-sm">Kembali</a>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-[#0d0c0b] overflow-hidden">
      <Suspense fallback={null}><ThreeBackground /></Suspense>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} href="/" className="inline-block text-[#9e9587] text-xs uppercase tracking-[0.15em] mb-12 hover:text-white transition">
          ← Kembali ke Beranda
        </motion.a>

        {/* Profile Card Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#1c1a18] border border-[#3c352e] flex items-center justify-center text-[#c49a6c] text-xl font-semibold overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[#9e9587] text-[10px] uppercase tracking-[0.2em]">Profile</p>
                  {isAdmin && <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-[#c49a6c]/20 text-[#c49a6c] font-semibold">Mode Admin</span>}
                </div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{profile.name}</h1>
              </div>
            </div>

            {isAdmin && (
              <button onClick={handleLogout} className="text-[#9e9587] text-[10px] uppercase tracking-[0.15em] hover:text-white transition">
                Keluar Admin
              </button>
            )}
          </div>
        </motion.div>

        {/* Admin Dashboard Controls (Hanya muncul jika mode admin aktif) */}
        {isAdmin && (
          <div className="mb-10">
            <AdminDashboard profile={profile} entriesCount={entries.length} onProfileUpdate={(p) => setProfile(p)} />
          </div>
        )}

        {/* Header Jurnal + Button Tambah jika Admin */}
        <div className="flex items-center justify-between mt-12 mb-6">
          <h2 className="text-xl font-bold text-white">Jurnal <span className="text-[#c49a6c]">({entries.length})</span></h2>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm((s) => !s)} className="px-5 py-2.5 rounded-xl bg-[#c49a6c] text-[#0d0c0b] text-sm font-semibold hover:opacity-90 transition">
              {showForm ? 'Tutup' : '+ Tambah Jurnal'}
            </motion.button>
          )}
        </div>

        {/* Form Tambah Jurnal (Hanya Admin) */}
        <AnimatePresence>
          {isAdmin && showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
              <JurnalForm profileId={id} onSuccess={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daftar Jurnal */}
        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center text-[#9e9587] text-sm">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {isAdmin ? (
                    <JurnalEntryCard entry={entry} onDelete={() => { if (confirm('Hapus?')) { (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) } }} onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))} />
                  ) : (
                    <div className="glass-card overflow-hidden">
                      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-64 object-cover" />}
                      <div className="p-7">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-3 py-1 rounded-md bg-[#c49a6c]/10 text-[#c49a6c] text-xs font-semibold">Day {entry.day}</span>
                          <h3 className="text-white font-semibold text-lg">{entry.title}</h3>
                        </div>
                        <p className="text-[#9e9587] text-sm leading-relaxed whitespace-pre-wrap font-light mb-5">{entry.deskripsi}</p>
                        <p className="text-[#5c554c] text-[10px] uppercase tracking-[0.15em]">
                          {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Hidden Admin Button at Bottom for Visitors */}
        {!isAdmin && (
          <div className="text-center mt-20">
            <button onClick={() => setShowModal(true)} className="text-[#5c554c] text-[10px] uppercase tracking-[0.15em] hover:text-[#c49a6c] transition cursor-pointer">
              Admin Mode
            </button>
          </div>
        )}
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass-card p-10 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Admin</h2>
              <p className="text-[#9e9587] text-[10px] uppercase tracking-[0.2em] mb-8">Masukkan password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus
                className="w-full px-5 py-3.5 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-center tracking-[0.4em] text-sm focus:outline-none focus:border-[#c49a6c] transition mb-5"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {error && <p className="text-xs text-red-400 bg-red-900/10 p-3 rounded-xl mb-5 text-center">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-[#9e9587] text-sm hover:bg-white/10 transition">Batal</button>
                <button onClick={handleLogin} className="flex-1 py-3 rounded-xl bg-[#c49a6c] text-[#0d0c0b] text-sm font-semibold hover:opacity-90 transition">Masuk</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
