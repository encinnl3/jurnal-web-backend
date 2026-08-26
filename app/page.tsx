'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

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
    <div className="relative min-h-screen bg-[#0d0c0b] text-[#f3f0ea] overflow-hidden selection:bg-[#c49a6c]/30">
      <Suspense fallback={null}><ThreeBackground /></Suspense>

      {/* Navbar */}
      <nav className="relative z-20 max-w-6xl mx-auto px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#c49a6c] flex items-center justify-center text-[#0d0c0b] font-bold text-sm">JP</div>
          <span className="font-semibold tracking-wider text-sm uppercase">Jurnal PKL</span>
        </div>
        <div className="text-xs text-[#9e9587] uppercase tracking-widest">Enterprise Edition</div>
      </nav>

      {/* Hero SaaS Style */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#c49a6c] uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
            <span>✨</span> Real-Time Collaborative Archive
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Platform Jurnal PKL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c49a6c] via-[#dfbc95] to-[#9e8b75]">
              Generasi Terbaru
            </span>
          </h1>
          <p className="text-[#9e9587] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Sistem pencatatan kegiatan harian magang dengan sinkronisasi instan, kompresi gambar otomatis, dan keamanan berbasis enkripsi admin.
          </p>

          {/* SaaS Stats Bar */}
          <div className="grid grid-cols-3 max-w-lg mx-auto glass-card p-6 mb-20 border border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-[#9e9587] mt-1">Real-time</div>
            </div>
            <div className="border-x border-white/10">
              <div className="text-2xl font-bold text-white">3 Peserta</div>
              <div className="text-[10px] uppercase tracking-widest text-[#9e9587] mt-1">Active Profiles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Auto</div>
              <div className="text-[10px] uppercase tracking-widest text-[#9e9587] mt-1">Image Compress</div>
            </div>
          </div>
        </motion.div>

        {/* Profiles Section */}
        <div className="text-left mb-8">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#9e9587] mb-6 text-center">Pilih Jurnal Peserta PKL</h3>
        </div>

        {loading ? (
          <div className="text-center text-[#9e9587] py-12">Memuat profil...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, borderColor: 'rgba(196, 154, 108, 0.4)' }}
                onClick={() => router.push(`/visitor/${profile.id}`)}
                className="glass-card p-8 text-left cursor-pointer group transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c49a6c]/5 rounded-full blur-2xl group-hover:bg-[#c49a6c]/10 transition-all" />
                <div>
                  <div className="w-14 h-14 rounded-full bg-[#1c1a18] border border-[#3c352e] flex items-center justify-center text-[#c49a6c] text-lg font-semibold mb-6 overflow-hidden">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.name.charAt(0)
                    )}
                  </div>
                  <h2 className="text-white text-xl font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{profile.name}</h2>
                  <p className="text-[#9e9587] text-xs uppercase tracking-[0.15em] mb-8">Peserta PKL</p>
                </div>
                <div className="flex items-center justify-between text-xs text-[#c49a6c] font-medium pt-4 border-t border-white/5">
                  <span>Akses Jurnal</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer SaaS */}
      <footer className="relative z-10 max-w-6xl mx-auto px-8 py-12 border-t border-white/5 text-center text-xs text-[#9e9587]">
        <p>© {new Date().getFullYear()} Jurnal PKL Enterprise. All rights reserved.</p>
      </footer>
    </div>
  )
}
