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

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let start = 0
    const timer = setInterval(() => {
      start += Math.ceil(end / 80)
      if (start >= end) { setCount(end); clearInterval(timer) } else setCount(start)
    }, 25)
    return () => clearInterval(timer)
  }, [isInView, end])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function Home() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await (supabase.from('profiles') as any).select('id, name, avatar_url, theme').order('name', { ascending: true })
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  return (
    <div>
      {/* Nav */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--accent)] flex items-center justify-center text-black text-xs font-bold">JP</div>
          <span className="heading text-sm tracking-wider">Jurnal PKL</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#profiles" className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition">Tim</a>
          <a href="#stats" className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition">Stats</a>
          <a href="#contact" className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition">Kontak</a>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, var(--glow) 0%, transparent 50%)' }} />
        <motion.div style={{ y: heroY }} className="text-center px-8 z-10 max-w-4xl mx-auto">
          <Reveal>
            <p className="accent text-[11px] uppercase tracking-[0.3em] mb-6 font-semibold">Jurnal & Laporan Praktik Kerja Lapangan</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading text-[80px] md:text-[160px] leading-[0.85] mb-6">
              Jurnal<br /><span className="accent">PKL</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[var(--fg-muted)] text-base max-w-lg mx-auto mb-4">
              Sistem pencatatan kegiatan harian magang yang real-time & kolaboratif untuk tim profesional.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] mb-10">Praktik di PT. Teknologi Indonesia</p>
          </Reveal>
          <Reveal delay={0.3}>
            <button onClick={() => profiles[0] && router.push(`/visitor/${profiles[0].id}`)} className="btn-primary">
              Mulai Sekarang →
            </button>
          </Reveal>
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
          <div className="w-5 h-8 border-2 border-[#333] rounded-full flex justify-center pt-2">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1.5 bg-[var(--accent)] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bento Grid */}
      <section id="stats" className="py-24 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-16">
              <p className="accent text-[10px] uppercase tracking-[0.3em] mb-3 font-semibold">Ringkasan PKL</p>
              <h2 className="heading text-4xl md:text-5xl text-white">Pencapaian</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Reveal delay={0}>
              <div className="bento-card md:row-span-2">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Total Jam Kerja</p>
                <div className="heading text-5xl md:text-6xl accent mb-2"><CountUp end={240} suffix="+" /></div>
                <p className="text-[11px] text-[var(--fg-muted)]">Jam praktik tercatat</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="bento-card">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Proyek</p>
                <div className="heading text-4xl accent mb-2"><CountUp end={5} /></div>
                <p className="text-[11px] text-[var(--fg-muted)]">Proyek selesai</p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="bento-card">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Masa PKL</p>
                <div className="heading text-4xl text-white mb-2"><CountUp end={3} /></div>
                <p className="text-[11px] text-[var(--fg-muted)]">Bulan aktif</p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="bento-card md:col-span-2">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Kompetensi Utama</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['UI/UX Design', 'Frontend Dev', 'QA Testing', 'API Integration'].map((s) => (
                    <span key={s} className="text-[11px] px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--fg-muted)]">{s}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="bento-card">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Posisi</p>
                <p className="text-sm text-white font-medium">Fullstack Intern</p>
                <p className="text-[11px] text-[var(--fg-muted)] mt-1">Divisi IT Support</p>
              </div>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="bento-card">
                <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2">Lokasi</p>
                <p className="text-sm text-white font-medium">Surabaya, Indonesia</p>
                <p className="text-[11px] text-[var(--fg-muted)] mt-1">PT Teknologi Indonesia</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section id="profiles" className="py-24 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-16">
              <p className="accent text-[10px] uppercase tracking-[0.3em] mb-3 font-semibold">Tim Kami</p>
              <h2 className="heading text-4xl md:text-5xl text-white">Pilih Profil</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {profiles.map((profile, i) => (
              <Reveal key={profile.id} delay={i * 0.1}>
                <motion.div whileHover={{ x: 12, borderColor: "var(--accent)" }} onClick={() => router.push(`/visitor/${profile.id}`)} className="group cursor-pointer border border-[var(--border)] p-6 flex items-center justify-between transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--accent)] text-xl font-bold overflow-hidden group-hover:bg-[var(--bg-card)] transition">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl heading text-white group-hover:text-[var(--accent)] transition">{profile.name}</h3>
                      <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em]">Peserta PKL</p>
                    </div>
                  </div>
                  <span className="accent text-lg opacity-0 group-hover:opacity-100 transition">→</span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--accent)] flex items-center justify-center text-black text-[10px] font-bold">JP</div>
            <span className="text-xs text-[var(--fg-muted)] uppercase tracking-widest">Jurnal PKL</span>
          </div>
          <p className="text-[10px] text-[#333] uppercase tracking-widest">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
