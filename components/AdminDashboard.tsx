'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

export default function AdminDashboard({ profile, entriesCount, onProfileUpdate }: { profile: any; entriesCount: number; onProfileUpdate: (p: any) => void }) {
  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordChange = async () => {
    if (!newPassword) { setError('Password wajib'); return }
    if (newPassword !== confirmPassword) { setError('Tidak cocok'); return }
    if (newPassword.length < 6) { setError('Minimal 6 karakter'); return }
    setSaving(true); setError('')
    try {
      const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id)
      if (e) throw e
      setSuccess('Password diubah!'); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true); setError('')
    try {
      const compressed = await compressImage(avatarFile, 400, 0.8)
      // Unikkan nama file agar selalu replace bersih
      const fileName = profile.id + '/avatar-' + Date.now() + '.jpg'
      const { error: ue } = await supabase.storage.from('avatars').upload(fileName, compressed, { upsert: false })
      if (ue) throw ue
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const cacheBuster = '?t=' + Date.now()
      const { error: ue2 } = await (supabase.from('profiles') as any).update({ avatar_url: data.publicUrl + cacheBuster }).eq('id', profile.id)
      if (ue2) throw ue2
      onProfileUpdate({ ...profile, avatar_url: data.publicUrl + cacheBuster }); setAvatarFile(null)
      setSuccess('Avatar diubah!'); setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleThemeChange = async (themeName: string) => {
    setSaving(true); setError('')
    try {
      const { error: e } = await (supabase.from('profiles') as any).update({ theme: themeName }).eq('id', profile.id)
      if (e) {
        // Jika kolom theme belum ada, abaikan
        if (e.message?.includes('theme')) {
          onProfileUpdate({ ...profile, theme: themeName })
          document.body.className = `theme-${themeName}`
          return
        }
        throw e
      }
      onProfileUpdate({ ...profile, theme: themeName })
      document.body.className = `theme-${themeName}`
    } catch (e: any) {
      console.warn('Theme update failed:', e.message)
      // Tetap apply lokal meski DB gagal
      onProfileUpdate({ ...profile, theme: themeName })
      document.body.className = `theme-${themeName}`
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-white display-font">{entriesCount}</div>
            <div className="text-[11px] uppercase tracking-widest text-[#8c8278] mt-1">Jurnal</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white font-medium mt-2">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="text-[11px] uppercase tracking-widest text-[#8c8278] mt-1">Bergabung</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-custom btn-ghost text-xs">
          {showSettings ? 'Tutup Settings' : 'Pengaturan Profile'}
        </button>
      </div>

      {showSettings && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-6 display-font">Settings Admin</h3>
          {error && <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg mb-4 border border-red-900/50">{error}</p>}
          {success && <p className="text-xs text-emerald-400 bg-emerald-950/30 p-3 rounded-lg mb-4 border border-emerald-900/50">{success}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#8c8278] mb-4">Pilih Theme</h4>
              <div className="flex flex-col gap-2">
                {['mocha', 'forest', 'midnight'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`px-4 py-2.5 rounded-xl border text-xs capitalize text-left transition ${
                      (profile.theme || 'mocha') === t ? 'border-[#d4a373] bg-[#d4a373]/10 text-white font-semibold' : 'border-white/5 text-[#8c8278] hover:bg-white/5'
                    }`}
                  >
                    🎨 {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#8c8278] mb-4">Ganti Avatar</h4>
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-full bg-[#141210] border border-white/10 flex items-center justify-center text-[#d4a373] text-lg font-bold overflow-hidden">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs text-[#8c8278]" />
                {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn-custom btn-primary text-xs mt-1">{saving ? '...' : 'Upload Avatar'}</button>}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#8c8278] mb-4">Ganti Password</h4>
              <div className="space-y-3">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="input-field text-xs" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="input-field text-xs" />
                <button onClick={handlePasswordChange} disabled={saving} className="btn-custom btn-ghost text-xs w-full">{saving ? '...' : 'Update Password'}</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
