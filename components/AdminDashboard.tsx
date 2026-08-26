'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id)
    setSaving(false)
    if (e) { setError(e.message); return }
    setSuccess('Password diubah!'); setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true); setError('')
    const compressed = await compressImage(avatarFile, 400, 0.8)
    const fileName = profile.id + '/avatar.jpg'
    const { error: ue } = await supabase.storage.from('avatars').upload(fileName, compressed, { upsert: true })
    if (ue) { setError(ue.message); setSaving(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const { error: ue2 } = await (supabase.from('profiles') as any).update({ avatar_url: data.publicUrl }).eq('id', profile.id)
    setSaving(false)
    if (ue2) { setError(ue2.message); return }
    onProfileUpdate({ ...profile, avatar_url: data.publicUrl }); setAvatarFile(null)
    setSuccess('Avatar diubah!'); setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{entriesCount}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mt-1">Jurnal</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white mt-2">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mt-1">Bergabung</div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowSettings(!showSettings)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#9e9587] text-sm hover:text-white hover:bg-white/10 transition">
          {showSettings ? 'Tutup' : 'Pengaturan'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-8 mb-8 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/10">Pengaturan Admin</h3>
            {error && <p className="text-xs text-red-400 bg-red-900/10 p-3 rounded-xl mb-4 text-center">{error}</p>}
            {success && <p className="text-xs text-[#c49a6c] bg-[#c49a6c]/10 p-3 rounded-xl mb-4 text-center">{success}</p>}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-5">Avatar</h4>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#1c1a18] border border-[#3c352e] flex items-center justify-center text-[#c49a6c] text-lg font-semibold overflow-hidden">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs text-[#9e9587] mb-2 w-full" />
                    {avatarFile && <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAvatarUpload} disabled={saving} className="w-full py-2 rounded-xl bg-[#c49a6c] text-[#0d0c0b] text-xs font-semibold">{saving ? '...' : 'Upload'}</motion.button>}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-5">Password</h4>
                <div className="space-y-3">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="w-full px-5 py-2.5 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] transition" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="w-full px-5 py-2.5 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] transition" />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handlePasswordChange} disabled={saving} className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition">
                    {saving ? 'Menyimpan...' : 'Simpan Password'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
