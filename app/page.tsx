'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any)
        .select('id, name, avatar_url, theme')
        .order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center p-8 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 display-font">Jurnal PKL</h1>
        <p className="text-stone-400 text-lg max-w-lg">Sistem pelaporan kegiatan harian magang yang elegan & kolaboratif.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{ y: -10, rotateY: 5 }}
            onClick={() => router.push(`/visitor/${profile.id}`)}
            className="glass-card p-10 cursor-pointer text-center group"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#d4a373] to-[#a68b5b] flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-2xl group-hover:shadow-amber-900/50 transition-shadow">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 display-font">{profile.name}</h2>
            <p className="text-[#a8a29e] text-xs uppercase tracking-widest mb-6">Peserta PKL</p>
            <button className="btn-custom btn-ghost w-full">Buka Jurnal</button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
