'use client'

import { use, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

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
  const [showSettings, setShowSettings] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Settings state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const themes = [
    { name: 'default', color: '#00d4ff' }, { name: 'emerald', color: '#10b981' },
    { name: 'violet', color: '#8b5cf6' }, { name: 'rose', color: '#ef4444' },
    { name: 'mocha', color: '#c8a97e' }, { name: 'slate', color: '#94a3b8' },
  ]

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const session = localStorage.getItem('jurnal-session')
    if (session) { try { if (JSON.parse(session).profileId === id) setIsAdmin(true) } catch {} }

    const fetchData = async () => {
      const { data: p } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (p?.length > 0) setProfile(p[0])
      const { data: e } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(e || [])
      setLoading(false)
    }
    fetchData()

    const ch = supabase.channel(`p-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (p) => {
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new].sort((a: any, b: any) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === p.new.id ? p.new : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== p.old.id))
    }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  useEffect(() => {
    if (profile) { document.body.className = `theme-${profile.theme || 'default'}`; return () => { document.body.className = '' } }
  }, [profile])

  const handleLogin = async () => {
    setError('')
    if (!profile || profile.password !== password) { setError('Password salah'); return }
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    setIsAdmin(true); setShowModal(false); setPassword('')
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true); setError('')
    try {
      const { compressImage } = await import('@/lib/imageUtils')
      const compressed = await compressImage(avatarFile, 400, 0.8)
      const fileName = profile.id + '/avatar-' + Date.now() + '.jpg'
      const { error: ue } = await supabase.storage.from('avatars').upload(fileName, compressed)
      if (ue) throw ue
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await (supabase.from('profiles') as any).update({ avatar_url: data.publicUrl + '?t=' + Date.now() }).eq('id', profile.id)
      setProfile({ ...profile, avatar_url: data.publicUrl + '?t=' + Date.now() })
      setAvatarFile(null); setSuccess('Avatar updated'); setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const handleThemeChange = async (t: string) => {
    document.body.className = `theme-${t}`
    setProfile({ ...profile, theme: t })
    try { await (supabase.from('profiles') as any).update({ theme: t }).eq('id', profile.id) } catch {}
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--fg-muted)]">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="bento-card p-12 text-center"><p className="text-[var(--fg-muted)] mb-6">Tidak ditemukan</p><a href="/" className="btn-primary">Kembali</a></div></div>

  const handleLogout = () => { localStorage.removeItem('jurnal-session'); setIsAdmin(false); setShowForm(false); setShowSettings(false) }

  return (
    <div>
      {/* Nav */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] hover:text-[var(--accent)] transition">← Kembali</a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--accent)] text-xs font-bold overflow-hidden border border-[var(--border)]">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
          </div>
          <span className="heading text-sm tracking-wider">{profile.name}</span>
          {isAdmin && <span className="tag text-[9px]" style={{ padding: '3px 8px' }}>Admin</span>}
        </div>
        {isAdmin ? (
          <button onClick={handleLogout} className="text-[10px] text-[var(--fg-muted)] hover:text-[var(--accent)] transition uppercase tracking-[0.15em]">Keluar</button>
        ) : (
          <button onClick={() => setShowModal(true)} className="text-[10px] text-[var(--fg-muted)] hover:text-[var(--accent)] transition uppercase tracking-[0.15em]">Admin</button>
        )}
      </nav>

      {/* Hero Profile */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h1 className="heading text-[60px] md:text-[100px] text-white leading-[0.85] mb-4">{profile.name}</h1>
            <p className="text-[var(--fg-muted)] text-[11px] uppercase tracking-[0.2em]">Jurnal harian selama menjalankan Praktik Kerja Lapangan</p>
          </Reveal>
        </div>
      </section>

      {/* Stats Quick */}
      <section className="py-12 px-8 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
          <div className="bento-card text-center">
            <div className="heading text-3xl accent mb-1">{entries.length}</div>
            <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest">Jurnal Entry</div>
          </div>
          <div className="bento-card text-center">
            <div className="heading text-3xl text-white mb-1">{entries.filter(e => e.foto_url).length}</div>
            <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest">Foto Dokumentasi</div>
          </div>
          <div className="bento-card text-center">
            <div className="heading text-3xl text-white mb-1">{entries.length > 0 ? entries[entries.length - 1].day : 0}</div>
            <div className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest">Hari Terakhir</div>
          </div>
        </div>
      </section>

      {/* Admin Controls */}
      <AnimatePresence>
        {isAdmin && showSettings && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--border)]">
            <div className="max-w-5xl mx-auto px-8 py-8">
              {error && <p className="text-xs text-red-500 bg-red-950/30 border border-red-900/30 p-3 mb-4">{error}</p>}
              {success && <p className="text-xs accent bg-[var(--glow)] p-3 mb-4">{success}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-4">Theme</h4>
                  <div className="flex gap-2">
                    {themes.map((t) => (
                      <button key={t.name} onClick={() => handleThemeChange(t.name)} className="w-8 h-8 border-2 transition-all hover:scale-110" style={{ background: t.color, borderColor: (profile.theme || 'default') === t.name ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-4">Avatar</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--accent)] font-bold text-sm overflow-hidden border border-[var(--border)]">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-[10px] text-[var(--fg-muted)]" />
                      {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn-primary w-full mt-2" style={{ padding: '8px 16px', fontSize: '10px' }}>{saving ? '...' : 'Upload'}</button>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-4">Password</h4>
                  <div className="space-y-2">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Baru" className="input-field text-sm" style={{ padding: '10px 14px' }} />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="input-field text-sm" style={{ padding: '10px 14px' }} />
                    <button onClick={async () => {
                      if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) { setError('Password tidak valid'); return }
                      setSaving(true); setError('')
                      try { const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id); if (e) throw e; setSuccess('Password diubah!'); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setSuccess(''), 3000) } catch (e: any) { setError(e.message) } finally { setSaving(false) }
                    }} disabled={saving} className="btn-ghost text-[10px] w-full" style={{ padding: '8px' }}>{saving ? '...' : 'Simpan'}</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Jurnal Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--border)]">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <JurnalFormInline profileId={id} onSuccess={() => setShowForm(false)} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="max-w-5xl mx-auto px-8 py-12 flex items-center justify-between border-t border-[var(--border)]">
        <h2 className="heading text-3xl text-white">Jurnal <span className="accent">({entries.length})</span></h2>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost text-[10px]" style={{ padding: '8px 16px' }}>{showSettings ? 'Tutup' : 'Pengaturan'}</button>
            <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-[10px]" style={{ padding: '8px 20px' }}>{showForm ? 'Tutup' : '+ Tambah'}</button>
          </div>
        )}
      </div>

      {/* Journal Entries Timeline */}
      <div className="max-w-5xl mx-auto px-8 pb-32">
        {entries.length === 0 ? (
          <div className="bento-card p-20 text-center text-[var(--fg-muted)]">Belum ada jurnal entry.</div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.05}>
                <div className="bento-card">
                  {isAdmin ? (
                    <EntryCardAdmin entry={entry} onDelete={async () => { if (confirm('Hapus?')) { await (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) } }} onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))} />
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="tag">Day {entry.day}</span>
                        <h3 className="text-lg heading text-white">{entry.title}</h3>
                      </div>
                      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-64 object-cover mb-4 border border-[var(--border)]" />}
                      <p className="text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed mb-4 text-sm">{entry.deskripsi}</p>
                      <p className="text-[10px] text-[#333] uppercase tracking-[0.2em]">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bento-card p-10 max-w-sm w-full">
              <h2 className="text-2xl heading text-white mb-2">Admin</h2>
              <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.2em] mb-8 font-semibold">Masukkan password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus className="input-field mb-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              {error && <p className="text-xs text-red-500 bg-red-950/30 border border-red-900/30 p-3 mb-4">{error}</p>}
              <div className="flex gap-0">
                <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn-ghost flex-1 rounded-none border-r border-[var(--border)]" style={{ padding: '12px' }}>Batal</button>
                <button onClick={handleLogin} className="btn-primary flex-1" style={{ padding: '12px' }}>Masuk</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EntryCardAdmin({ entry, onDelete, onChanged }: { entry: any; onDelete: () => void; onChanged: (u: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [day, setDay] = useState(String(entry.day))
  const [title, setTitle] = useState(entry.title)
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { data, error } = await (supabase.from('jurnal_entries') as any).update({ day: parseInt(day) || 1, title: title.trim(), deskripsi: deskripsi.trim() }).eq('id', entry.id).select().single()
    setSaving(false)
    if (!error) { onChanged(data); setEditing(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {editing ? (
          <div className="flex gap-2 flex-1">
            <input type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} className="input-field w-20 text-sm" style={{ padding: '8px 12px' }} />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field flex-1 text-sm" style={{ padding: '8px 12px' }} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="tag">Day {entry.day}</span>
            <span className="heading text-lg text-white">{entry.title}</span>
          </div>
        )}
        <div className="flex gap-0 ml-3">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDay(String(entry.day)); setTitle(entry.title); setDeskripsi(entry.deskripsi) }} className="btn-ghost text-[10px]" style={{ padding: '6px 14px' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-[10px]" style={{ padding: '6px 14px' }}>{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-ghost text-[10px]" style={{ padding: '6px 14px' }}>Edit</button>
              <button onClick={onDelete} className="btn-danger text-[10px]" style={{ padding: '6px 14px' }}>Hapus</button>
            </>
          )}
        </div>
      </div>
      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-48 object-cover mb-4 border border-[var(--border)]" />}
      {editing ? <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="input-field resize-none mb-4" /> : <p className="text-[var(--fg-muted)] text-sm whitespace-pre-wrap mb-4">{entry.deskripsi}</p>}
      <p className="text-[10px] text-[#333] uppercase tracking-[0.2em]">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  )
}

function JurnalFormInline({ profileId, onSuccess }: { profileId: string; onSuccess: () => void }) {
  const [day, setDay] = useState(1)
  const [title, setTitle] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) { setError('Judul & deskripsi wajib'); return }
    setLoading(true); setError(null)
    try {
      let fotoUrl: string | null = null
      if (foto) {
        const { compressImage } = await import('@/lib/imageUtils')
        const compressed = await compressImage(foto, 1000, 0.75)
        const fileName = profileId + '/' + Date.now() + '.jpg'
        const { error: ue } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed)
        if (ue) throw ue
        const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
        fotoUrl = data.publicUrl
      }
      const { error: ie } = await (supabase.from('jurnal_entries') as any).insert({ profile_id: profileId, day: Number(day), title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
      if (ie) throw ie
      setDay(day + 1); setTitle(''); setDeskripsi(''); setFoto(null); onSuccess()
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl heading text-white mb-6">Entry Baru</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><label className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2 block">Day</label><input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input-field" /></div>
        <div><label className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2 block">Foto</label><input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="text-sm text-[var(--fg-muted)] py-3" /></div>
      </div>
      <div className="mb-4"><label className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2 block">Judul</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="input-field" /></div>
      <div className="mb-6"><label className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest mb-2 block">Deskripsi</label><textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} placeholder="Ceritakan kegiatan..." className="input-field resize-none" /></div>
      {error && <p className="text-xs text-red-500 bg-red-950/30 border border-red-900/30 p-3 mb-4">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Menyimpan...' : 'Simpan Entry'}</button>
    </form>
  )
}
