'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any)
        .select('id, name, avatar_url')
        .order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0c0b]">
      <div className="absolute inset-0 z-10 flex flex-col items-center">
        <div className="w-full max-w-6xl px-8 pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Jurnal{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c49a6c] to-[#9e8b75]">
                PKL
              </span>
            </h1>
            <p className="text-[#9e9587] max-w-md mx-auto font-light leading-relaxed">
              Rekam jejak pengalaman harian selama menjalankan Praktik Kerja Lapangan.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-[#9e9587]">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {profiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                  whileHover={{ y: -4, borderColor: 'rgba(196, 154, 108, 0.3)' }}
                  onClick={() => router.push(`/visitor/${profile.id}`)}
                  className="glass-card p-8 text-center cursor-pointer transition-colors duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-[#1c1a18] border border-[#3c352e] flex items-center justify-center text-[#c49a6c] text-xl font-semibold mx-auto mb-4 overflow-hidden group-hover:border-[#c49a6c] transition-colors">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>
                  <h2 className="text-white text-lg font-semibold mb-1">{profile.name}</h2>
                  <p className="text-[#9e9587] text-[10px] uppercase tracking-[0.2em]">Peserta PKL</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}