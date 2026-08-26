'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any).select('id, name, avatar_url, theme').order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="bg-white">
      {/* Hero */}
      <section ref={heroRef} className="h-screen flex items-center justify-center relative overflow-hidden bg-[#efefef]">
        <motion.div style={{ y: heroY }} className="text-center px-8 z-10">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#808080] mb-8 font-medium">Praktik Kerja Lapangan</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-[80px] md:text-[140px] heading text-[#1c1c1c] leading-[0.85] mb-8">
              Jurnal<br />PKL
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[#808080] text-base max-w-md mx-auto mb-12">
              Sistem pencatatan kegiatan harian magang yang elegan, real-time, dan kolaboratif.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <button onClick={() => profiles[0] && router.push(`/visitor/${profiles[0].id}`)} className="btn-primary">
              Mulai Sekarang
            </button>
          </Reveal>
        </motion.div>
      </section>

      {/* Profile Grid */}
      <section id="profiles" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#808080] mb-4 font-medium">Tim Kami</p>
              <h2 className="text-5xl heading text-[#1c1c1c]">Pilih Profil</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profiles.map((profile, i) => (
              <Reveal key={profile.id} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} onClick={() => router.push(`/visitor/${profile.id}`)} className="card p-0 cursor-pointer group overflow-hidden">
                  <div className="aspect-square bg-[#efefef] flex items-center justify-center group-hover:bg-[#e5e5e5] transition-colors">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[80px] heading text-[#d5d5d5] group-hover:text-[#b5b5b5] transition-colors">
                        {profile.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl heading text-[#1c1c1c] mb-1">{profile.name}</h3>
                    <p className="text-[11px] text-[#808080] uppercase tracking-[0.15em]">Peserta PKL</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 bg-[#1c1c1c]">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl heading text-white mb-6">Siap Memulai?</h2>
            <p className="text-[#808080] mb-10">Mulai dokumentasi kegiatan PKL Anda hari ini.</p>
            <button onClick={() => profiles[0] && router.push(`/visitor/${profiles[0].id}`)} className="bg-white text-[#1c1c1c] px-12 py-5 font-bold text-[13px] uppercase tracking-[0.12em] hover:bg-[#efefef] transition" style={{ fontFamily: "'DM Sans Condensed', sans-serif" }}>
              Mulai Sekarang
            </button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-[#dddddd]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] text-[#808080] uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Jurnal PKL</p>
          <p>Copenhagen Style</p>
        </div>
      </footer>
    </div>
  )
}
