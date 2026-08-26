'use client'

import { use, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#808080]">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="card p-12 text-center"><p className="text-[#808080] mb-6">Tidak ditemukan</p><a href="/" className="btn-primary">Kembali</a></div></div>

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#dddddd]">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-[11px] text-[#808080] uppercase tracking-[0.15em] hover:text-[#1c1c1c] transition font-medium">← Kembali</a>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#efefef] flex items-center justify-center text-[#1c1c1c] text-sm font-bold">
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
            </div>
            <span className="text-sm heading uppercase tracking-wider">{profile.name}</span>
          </div>
          {isAdmin ? (
            <button onClick={() => { localStorage.removeItem('jurnal-session'); setIsAdmin(false) }} className="text-[11px] text-[#808080] hover:text-[#1c1c1c] transition uppercase tracking-[0.15em] font-medium">Keluar Admin</button>
          ) : (
            <button onClick={() => setShowModal(true)} className="text-[11px] text-[#808080] hover:text-[#1c1c1c] transition uppercase tracking-[0.15em] font-medium">Admin</button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-32 px-8 text-center bg-[#efefef]">
        <Reveal>
          <h1 className="text-[60px] md:text-[90px] heading text-[#1c1c1c] leading-[0.85] mb-4">{profile.name}</h1>
          <p className="text-[#808080] text-sm uppercase tracking-[0.15em]">Jurnal harian selama menjalankan Praktik Kerja Lapangan</p>
        </Reveal>
      </section>

      {/* Admin Controls */}
      <AnimatePresence>
        {isAdmin && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-[#dddddd]">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <AdminPanel profile={profile} entriesCount={entries.length} onProfileUpdate={setProfile} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Jurnal Form */}
      <AnimatePresence>
        {isAdmin && showForm && (
          <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-[#dddddd]">
            <div className="max-w-5xl mx-auto px-8 py-8">
              <JurnalFormInline profileId={id} onSuccess={() => setShowForm(false)} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="max-w-5xl mx-auto px-8 py-12 flex items-center justify-between">
        <h2 className="text-3xl heading text-[#1c1c1c]">Jurnal <span className="text-[#808080]">({entries.length})</span></h2>
        {isAdmin && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary" style={{ padding: '12px 24px', fontSize: '11px' }}>
            {showForm ? 'Tutup' : '+ Tambah'}
          </button>
        )}
      </div>

      {/* Entries */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        {entries.length === 0 ? (
          <div className="card p-20 text-center text-[#808080]">Belum ada jurnal.</div>
        ) : (
          <div className="space-y-0">
            {entries.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.05}>
                <div className="border-b border-[#dddddd]">
                  {isAdmin ? (
                    <EntryCardAdmin entry={entry} onDelete={async () => { if (confirm('Hapus?')) { await (supabase.from('jurnal_entries') as any).delete().eq('id', entry.id); setEntries((p) => p.filter((e) => e.id !== entry.id)) } }} onChanged={(u) => setEntries((p) => p.map((e) => e.id === u.id ? u : e).sort((a, b) => a.day - b.day))} />
                  ) : (
                    <div className="py-12">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="tag">Day {entry.day}</span>
                        <h3 className="text-2xl heading text-[#1c1c1c]">{entry.title}</h3>
                      </div>
                      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-80 object-cover mb-6" />}
                      <p className="text-[#808080] whitespace-pre-wrap leading-relaxed max-w-2xl mb-4">{entry.deskripsi}</p>
                      <p className="text-[10px] text-[#d5d5d5] uppercase tracking-[0.2em]">
                        {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-6" onClick={() => { setShowModal(false); setPassword(''); setError('') }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="card p-12 max-w-sm w-full">
              <h2 className="text-2xl heading text-[#1c1c1c] mb-2">Admin</h2>
              <p className="text-[11px] text-[#808080] uppercase tracking-[0.15em] mb-8 font-medium">Masukkan password</p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoFocus className="input-field mb-4" onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              {error && <p className="text-xs text-red-600 bg-red-50 p-3 mb-4">{error}</p>}
              <div className="flex gap-0">
                <button onClick={() => { setShowModal(false); setPassword(''); setError('') }} className="btn-ghost flex-1 rounded-none border-r border-[#dddddd]">Batal</button>
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
        <div className="flex gap-12">
          <div className="text-center"><div className="text-4xl heading text-[#1c1c1c]">{entriesCount}</div><div className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mt-1">Jurnal</div></div>
          <div className="text-center"><div className="text-sm text-[#1c1c1c] mt-1">{new Date(profile.created_at).toLocaleDateString('id-ID')}</div><div className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mt-1">Bergabung</div></div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost text-[11px]" style={{ padding: '10px 20px' }}>{showSettings ? 'Tutup' : 'Pengaturan'}</button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card p-8">
              {error && <p className="text-xs text-red-600 bg-red-50 p-3 mb-4">{error}</p>}
              {success && <p className="text-xs text-emerald-600 bg-emerald-50 p-3 mb-4">{success}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-4 font-medium">Theme</h4>
                  <div className="flex gap-2 flex-wrap">
                    {themes.map((t) => (
                      <button key={t.name} onClick={() => handleThemeChange(t.name)} className="w-8 h-8 border-2 transition-all hover:scale-110" style={{ background: t.color, borderColor: (profile.theme || 'mocha') === t.name ? '#1c1c1c' : 'transparent' }} title={t.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-4 font-medium">Avatar</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#efefef] flex items-center justify-center text-[#1c1c1c] font-bold text-sm overflow-hidden">
                      {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs text-[#808080]" />
                      {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn-primary w-full mt-2" style={{ padding: '10px 16px', fontSize: '11px' }}>{saving ? '...' : 'Upload'}</button>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-4 font-medium">Password</h4>
                  <div className="space-y-2">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Baru" className="input-field text-sm" style={{ padding: '12px 14px' }} />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="input-field text-sm" style={{ padding: '12px 14px' }} />
                    <button onClick={handlePasswordChange} disabled={saving} className="btn-ghost text-[11px] w-full" style={{ padding: '10px' }}>{saving ? '...' : 'Simpan'}</button>
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
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl heading text-[#1c1c1c] mb-6">Entry Baru</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><label className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-2 block font-medium">Day</label><input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input-field" /></div>
        <div><label className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-2 block font-medium">Foto</label><input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="text-sm text-[#808080] py-3" /></div>
      </div>
      <div className="mb-4"><label className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-2 block font-medium">Judul</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="input-field" /></div>
      <div className="mb-6"><label className="text-[10px] uppercase tracking-[0.2em] text-[#808080] mb-2 block font-medium">Deskripsi</label><textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} placeholder="Ceritakan kegiatan..." className="input-field resize-none" /></div>
      {error && <p className="text-xs text-red-600 bg-red-50 p-3 mb-4">{error}</p>}
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
    <div className="py-10 border-b border-[#dddddd]">
      {editing ? (
        <div className="mb-4 flex gap-3">
          <input type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} className="input-field w-20 text-sm" style={{ padding: '10px 12px' }} />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field flex-1 text-sm" style={{ padding: '10px 12px' }} />
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-4">
          <span className="tag">Day {entry.day}</span>
          <span className="text-xl heading text-[#1c1c1c]">{entry.title}</span>
        </div>
      )}
      {entry.foto_url && <img src={entry.foto_url} alt={entry.title} className="w-full h-64 object-cover mb-4" />}
      {editing ? (
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="input-field resize-none mb-4" />
      ) : (
        <p className="text-[#808080] whitespace-pre-wrap leading-relaxed max-w-2xl mb-4">{entry.deskripsi}</p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#d5d5d5] uppercase tracking-[0.2em]">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-0">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDay(String(entry.day)); setTitle(entry.title); setDeskripsi(entry.deskripsi) }} className="btn-ghost text-[10px]" style={{ padding: '8px 16px' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-[10px]" style={{ padding: '8px 16px' }}>{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-ghost text-[10px]" style={{ padding: '8px 16px' }}>Edit</button>
              <button onClick={onDelete} className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider font-medium ml-4">Hapus</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
