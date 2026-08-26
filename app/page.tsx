'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import ProfileCard from '@/components/ProfileCard'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function Home() {
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
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0c0a09' }}>
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      <div className="absolute inset-0 z-10 flex flex-col items-center">
        <div className="w-full max-w-6xl px-8 pt-32 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="inline-block mb-6"
            >
              <span className="px-5 py-2 rounded-full border border-amber-600/30 text-amber-500 text-xs font-medium uppercase tracking-[0.2em]">
                Praktik Kerja Lapangan
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Jurnal{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700">
                PKL
              </span>
            </h1>

            <p className="text-lg text-stone-400 max-w-xl mx-auto font-light leading-relaxed">
              Rekam jejak pengalaman harian para peserta Praktik Kerja Lapangan dengan presisi dan gaya profesional.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-stone-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {profiles.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  id={profile.id}
                  name={profile.name}
                  avatar_url={profile.avatar_url}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
