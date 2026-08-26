'use client'

import { use, useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
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
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === p.new.id ? p.new : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== p.old.id))
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09] text-stone-400">Loading...</div>
  )

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09]">
      <div className="glass-card p-12 text-center">
        <p className="text-stone-400 mb-6">Profile tidak ditemukan</p>
        <a href="/" className="px-6 py-3 rounded-full bg-white text-black font-semibold">Kembali</a>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-[#0c0a09] overflow-hidden">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <motion.a 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          href="/" 
          className="inline-block text-amber-500 text-sm uppercase tracking-widest mb-12 hover:opacity-70 transition"
        >
          ← Kembali
        </motion.a>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg shadow-amber-900/20">
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
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition"
            >
              Admin
            </motion.button>
          </div>
        </motion.div>

        <h2 className="text-xl text-white mb-6 font-light">Jurnal <span className="text-amber-500">({entries.length})</span></h2>

        {entries.length === 0 ? (
          <div className="glass-card p-16 text-center text-stone-500">Belum ada jurnal</div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card overflow-hidden"
                >
                  {entry.foto_url && (
                    <div className="w-full h-72 overflow-hidden">
                      <img src={entry.foto_url} alt={entry.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded-md bg-amber-600/20 text-amber-400 text-xs font-semibold">
                        Day {entry.day}
                      </span>
                      <h3 className="text-white font-semibold text-lg flex-1">{entry.title}</h3>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed whitespace-pre-wrap font-light mb-4">
                      {entry.deskripsi}
                    </p>
                    <p className="text-stone-600 text-xs uppercase tracking-widest">
                      {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => { setShowModal(false); setPassword(''); setError('') }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-10 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-2" style={{fontFamily: "'Playfair Display', serif"}}>
                Admin Panel
              </h2>
              <p className="text-stone-500 text-xs uppercase tracking-widest mb-8">Masukkan Password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoFocus
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full mb-6 text-white text-center tracking-[0.5em] focus:outline-none focus:border-amber-600"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {error && <p className="text-sm text-red-400 bg-red-900/20 p-3 rounded-xl mb-6 text-center">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="flex-1 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">
                  Batal
                </button>
                <button onClick={handleLogin} className="flex-1 py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition">
                  Masuk
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}