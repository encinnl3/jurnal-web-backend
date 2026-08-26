'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}>
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
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any).select('id, name, avatar_url, theme').order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div className="bg-[#ffffff]">
      {/* Hero Section - Simply Chocolate Style */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="text-center px-8 max-w-5xl mx-auto">
          <Reveal>
            <span className="tag mb-8">Praktik Kerja Lapangan</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-7xl md:text-[120px] heading text-[#1a1a1a] leading-none mt-8 mb-8">
              Jurnal<br />
              <span className="text-[var(--accent)]">PKL</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg text-[#6b6b6b] max-w-lg mx-auto mb-12 leading-relaxed">
              Sistem pencatatan kegiatan harian magang yang elegan, real-time, dan kolaboratif untuk tim profesional.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex justify-center gap-4">
              <button onClick={() => profiles[0] && router.push(`/visitor/${profiles[0].id}`)} className="btn-primary">Mulai Sekarang</button>
              <a href="#profiles" className="btn-ghost">Lihat Semua</a>
            </div>
          </Reveal>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-[var(--border)] rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-[var(--accent)] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-12 text-center">
          <Reveal><div><div className="text-5xl heading text-[var(--fg)] mb-2">100%</div><div className="text-sm text-[var(--fg-muted)] uppercase tracking-widest">Real-Time Sync</div></div></Reveal>
          <Reveal delay={0.1}><div><div className="text-5xl heading text-[var(--fg)] mb-2">3</div><div className="text-sm text-[var(--fg-muted)] uppercase tracking-widest">Peserta PKL</div></div></Reveal>
          <Reveal delay={0.2}><div><div className="text-5xl heading text-[var(--fg)] mb-2">Auto</div><div className="text-sm text-[var(--fg-muted)] uppercase tracking-widest">Kompresi Foto</div></div></Reveal>
        </div>
      </section>

      {/* Profiles Section */}
      <section id="profiles" className="py-24 px-8 bg-[var(--bg-subtle)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="tag mb-4">Tim Kami</span>
              <h2 className="text-5xl heading text-[var(--fg)] mt-4">Pilih Profil</h2>
              <p className="text-[var(--fg-muted)] mt-4">Klik profil untuk melihat jurnal harian masing-masing.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profiles.map((profile, i) => (
              <Reveal key={profile.id} delay={i * 0.1}>
                <motion.div whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(0,0,0,0.08)" }} onClick={() => router.push(`/visitor/${profile.id}`)} className="card p-8 text-center cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] text-2xl font-bold mx-auto mb-6 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                  </div>
                  <h3 className="text-xl heading text-[var(--fg)] mb-1">{profile.name}</h3>
                  <p className="text-xs text-[var(--fg-muted)] uppercase tracking-widest mb-6">Peserta PKL</p>
                  <div className="w-full h-px bg-[var(--border)] mb-6" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] group-hover:tracking-[0.3em] transition-all duration-500">
                    Lihat Jurnal →
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl heading text-[var(--fg)] mb-6">Siap Memulai?</h2>
            <p className="text-[var(--fg-muted)] text-lg mb-10">Mulai dokumentasi kegiatan PKL Anda hari ini.</p>
            <button onClick={() => profiles[0] && router.push(`/visitor/${profiles[0].id}`)} className="btn-primary text-lg px-12 py-5">
              Mulai Sekarang
            </button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[var(--fg-muted)]">
          <p>© {new Date().getFullYear()} Jurnal PKL</p>
          <p>Dibuat dengan ❤️</p>
        </div>
      </footer>
    </div>
  )
}
