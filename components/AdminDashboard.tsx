'use client'

import { use, useEffect, useState, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

export default function AdminDashboard({ profile, entriesCount, onProfileUpdate }: { profile: any; entriesCount: number; onProfileUpdate: (p: any) => void }) {
  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const fileName = `${profile.id}/avatar.${ext}`
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex gap-10">
          <div className="text-center">
            <motion.div whileHover={{ scale: 1.05 }} className="text-4xl font-bold text-white">{entriesCount}</motion.div>
            <div className="text-xs uppercase tracking-widest text-stone-500 mt-2">Jurnal</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white mt-3">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="text-xs uppercase tracking-widest text-stone-500 mt-2">Bergabung</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
        >
          {showSettings ? 'Tutup' : 'Pengaturan'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-8 mb-8 overflow-hidden"
          >
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-white mb-8 pb-4 border-b border-white/10"
            >
              Pengaturan Admin
            </motion.h3>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-900/20 p-3 rounded-xl mb-4 text-center">{error}</motion.p>}
            {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-amber-400 bg-amber-900/20 p-3 rounded-xl mb-4 text-center">{success}</motion.p>}

            <div className="grid grid-cols-2 gap-10">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Avatar</h4>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg shadow-amber-900/20">
                    {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs text-stone-400 mb-3" />
                    {avatarFile && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAvatarUpload} disabled={saving} className="w-full py-2.5 rounded-full bg-amber-600 text-white text-sm font-medium">
                        {saving ? 'Uploading...' : 'Upload'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-stone-500 mb-6">Password</h4>
                <div className="space-y-4">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-amber-600" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-amber-600" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePasswordChange} disabled={saving} className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition">
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