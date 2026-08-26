'use client'

import { use, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}>
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

  useEffect(() => {
    const session = localStorage.getItem('jurnal-session')
    if (session) {
      try { if (JSON.parse(session).profileId === id) setIsAdmin(true) } catch {}
    }
    const fetchData = async () => {
      const { data: p } = await (supabase.from('profiles') as any).select('*').eq('id', id)
      if (p?.length > 0) setProfile(p[0])
      const { data: e } = await (supabase.from('jurnal_entries') as any).select('*').eq('profile_id', id).order('day', { ascending: true })
      setEntries(e || [])
      setLoading(false)
    }
    fetchData()
    const ch = supabase.channel(`p-${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'jurnal_entries', filter: `profile_id=eq.${id}` }, (p) => {
      if (p.eventType === 'INSERT') setEntries((x) => [...x, p.new].sort((a, b) => a.day - b.day))
      else if (p.eventType === 'UPDATE') setEntries((x) => x.map((e) => e.id === p.new.id ? p.new : e))
      else if (p.eventType === 'DELETE') setEntries((x) => x.filter((e) => e.id !== p.old.id))
    }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  useEffect(() => {
    if (profile) {
      document.body.className = `theme-${profile.theme || 'mocha'}`
      return () => { document.body.className = '' }
    }
  }, [profile])

  const handleLogin = async () => {
    setError('')
    if (!profile || profile.password !== password) { setError('Password salah'); return }
    localStorage.setItem('jurnal-session', JSON.stringify({ profileId: profile.id, name: profile.name }))
    setIsAdmin(true); setShowModal(false); setPassword('')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--fg-muted)]">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="card p-12 text-center"><p className="text-[var(--fg-muted)] mb-6">Tidak ditemukan</p><a href="/" className="btn-primary">Kembali</a></div></div>

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-xs text-[var(--fg-muted)] uppercase tracking-widest hover:text-[var(--fg)] transition">← Kembali</a>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] text-sm font-bold overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-[var(--fg)]">{profile.name}</span>
          </div>
          {isAdmin ? (
            <button onClick={() => { localStorage.removeItem('jurnal-session'); setIsAdmin(false) }} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition">Keluar Admin</button>
          ) : (
            <button onClick={() => setShowModal(true)} className="text-xs text-[var(--fg-muted)] hover:text-[var(--accent)] transition uppercase tracking-widest">Admin</button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-8 text-center">
        <Reveal>
          <h1 className="text-6xl md:text-8xl heading text-[var(--fg)] mb-4">{profile.name}</h1>
          <p className="text-[var(--fg-muted)] text-lg">Jurnal harian selama menjalankan Praktik Kerja Lapangan</p>
        </Reveal>
      </section>

      {/* Admin Controls */}
      <AnimatePresence>
        {isAdmin && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-[var(--border)]">
            <div className="max-w-4xl mx-auto px-8 py-8">
              <AdminPanel profile={profile} entriesCount={entries.length} onProfileUpdate={setProfile} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Jurnal Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-[var(--border)]">
            <div className="max-w-4xl mx-auto px-8 py-8">
              <JurnalFormInline profileId={id} onSuccess={() => setShowForm(false)} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="max-w-4xl mx-auto px-8 py-8 flex items-center justify-between">
        <h2 className="text-3xl heading text-[var(--fg)]">Jurnal <span className="text-[var(--accent)]">({entries.length})</span></h2>
        {isAdmin && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary" style={{ padding: '10px 24px' }}>
            {showForm ? 'Tutup' : '+ Tambah'}
          </button>
        )}
      </div>

      {/* Entries */}
      <div className="max-w-4xl mx-auto px-8 pb-24">
        {entries.length === 0 ? (
          <div className="card p-20 text-center text-[var(--fg-muted)]">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.05}>
                <div className="card overflow-hidden">
                  {isAdmin ? (
                    <EntryCardAdmin entry={entry} onDelete={async () => { if (confirm('Hapus?')) { await (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) } }} onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))} />
                  ) : (
                    <>
                      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-72 object-cover" />}
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="tag">Day {entry.day}</span>
                          <h3 className="text-xl heading text-[var(--fg)]">{entry.title}</h3>
                        </div>
                        <p className="text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed mb-4">{entry.deskripsi}</p>
                        <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-widest opacity-50">
                          {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="card p-10 max-w-sm w-full">
              <h2 className="text-2xl heading text-[var(--fg)] mb-1">Admin</h2>
              <p className="text-xs text-[var(--fg-muted)] mb-6 uppercase tracking-widest">Masukkan password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus className="input-field mb-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn-ghost flex-1">Batal</button>
                <button onClick={handleLogin} className="btn-primary flex-1">Masuk</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ===== Admin Panel ===== */
function AdminPanel({ profile, entriesCount, onProfileUpdate }: { profile: any; entriesCount: number; onProfileUpdate: (p: any) => void }) {
  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword || newPassword.length < 6) { setError('Password tidak valid'); return }
    setSaving(true); setError('')
    try {
      const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id)
      if (e) throw e
      setSuccess('Password diubah!'); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
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
      const { error: ue2 } = await (supabase.from('profiles') as any).update({ avatar_url: data.publicUrl + '?t=' + Date.now() }).eq('id', profile.id)
      if (ue2) throw ue2
      onProfileUpdate({ ...profile, avatar_url: data.publicUrl + '?t=' + Date.now() }); setAvatarFile(null)
      setSuccess('Avatar diubah!'); setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  const themes = [
    { name: 'mocha', label: 'Mocha', color: '#c8a97e' },
    { name: 'ocean', label: 'Ocean', color: '#3b82f6' },
    { name: 'emerald', label: 'Emerald', color: '#10b981' },
    { name: 'violet', label: 'Violet', color: '#8b5cf6' },
    { name: 'rose', label: 'Rose', color: '#f43f5e' },
    { name: 'slate', label: 'Slate', color: '#475569' },
  ]

  const handleThemeChange = async (themeName: string) => {
    document.body.className = `theme-${themeName}`
    onProfileUpdate({ ...profile, theme: themeName })
    try { await (supabase.from('profiles') as any).update({ theme: themeName }).eq('id', profile.id) } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-10">
          <div className="text-center"><div className="text-3xl heading text-[var(--fg)]">{entriesCount}</div><div className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Jurnal</div></div>
          <div className="text-center"><div className="text-sm text-[var(--fg)] mt-1">{new Date(profile.created_at).toLocaleDateString('id-ID')}</div><div className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Bergabung</div></div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost text-xs" style={{ padding: '8px 20px' }}>{showSettings ? 'Tutup' : 'Pengaturan'}</button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card p-6">
              {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
              {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg mb-4">{success}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-3">Theme</h4>
                  <div className="flex gap-2 flex-wrap">
                    {themes.map((t) => (
                      <button key={t.name} onClick={() => handleThemeChange(t.name)} className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110" style={{ background: t.color, borderColor: (profile.theme || 'mocha') === t.name ? 'var(--fg)' : 'transparent' }} title={t.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-3">Avatar</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] font-bold text-sm overflow-hidden">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs text-[var(--fg-muted)]" />
                      {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn-primary text-xs mt-2 w-full" style={{ padding: '8px 16px' }}>{saving ? '...' : 'Upload'}</button>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-3">Password</h4>
                  <div className="space-y-2">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Baru" className="input-field text-sm" style={{ padding: '10px 14px' }} />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="input-field text-sm" style={{ padding: '10px 14px' }} />
                    <button onClick={handlePasswordChange} disabled={saving} className="btn-ghost text-xs w-full" style={{ padding: '8px' }}>{saving ? '...' : 'Simpan'}</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ===== Jurnal Form ===== */
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
    <form onSubmit={handleSubmit} className="card p-8">
      <h3 className="text-xl heading text-[var(--fg)] mb-6">Entry Baru</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><label className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">Day</label><input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input-field" /></div>
        <div><label className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">Foto</label><input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="text-sm text-[var(--fg-muted)] py-3" /></div>
      </div>
      <div className="mb-4"><label className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">Judul</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="input-field" /></div>
      <div className="mb-6"><label className="text-[10px] uppercase tracking-widest text-[var(--fg-muted)] mb-2 block">Deskripsi</label><textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} placeholder="Ceritakan kegiatan..." className="input-field resize-none" /></div>
      {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Menyimpan...' : 'Simpan Entry'}</button>
    </form>
  )
}

/* ===== Entry Card Admin ===== */
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
      <div className="p-5 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-3 flex-1">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} className="input-field w-16 text-sm" style={{ padding: '8px 12px' }} />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field flex-1 text-sm font-semibold" style={{ padding: '8px 12px' }} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="tag">Day {entry.day}</span>
              <span className="font-semibold text-[var(--fg)]">{entry.title}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-3">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDay(String(entry.day)); setTitle(entry.title); setDeskripsi(entry.deskripsi) }} className="btn-ghost text-xs" style={{ padding: '6px 14px' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs" style={{ padding: '6px 14px' }}>{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-ghost text-xs" style={{ padding: '6px 14px' }}>Edit</button>
              <button onClick={onDelete} className="btn-ghost text-xs text-red-500" style={{ padding: '6px 14px' }}>Hapus</button>
            </>
          )}
        </div>
      </div>
      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-56 object-cover" />}
      <div className="p-6">
        {editing ? <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="input-field resize-none" /> : <p className="text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed">{entry.deskripsi}</p>}
        <p className="text-[10px] text-[var(--fg-muted)] mt-3 opacity-50 uppercase tracking-widest">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  )
}
