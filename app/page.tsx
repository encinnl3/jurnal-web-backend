'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any).select('id, name, avatar_url, theme').order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fafafa]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="w-16 h-16 rounded-2xl bg-[#e11d48] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
          J
        </motion.div>
        <h1 className="text-5xl md:text-6xl heading text-[#18181b] mb-4">Jurnal PKL</h1>
        <p className="text-[#71717a] text-lg max-w-md">Sistem pencatatan kegiatan harian magang yang real-time & kolaboratif.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, type: "spring" }}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            onClick={() => router.push(`/visitor/${profile.id}`)}
            className="glass-card p-8 cursor-pointer text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] flex items-center justify-center text-[#e11d48] text-xl font-bold mx-auto mb-4 overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
            </div>
            <h2 className="text-lg font-semibold text-[#18181b] mb-1">{profile.name}</h2>
            <p className="text-[#71717a] text-xs uppercase tracking-widest mb-5">Peserta PKL</p>
            <button className="btn-primary w-full">Lihat Jurnal</button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
