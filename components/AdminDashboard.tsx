'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/lib/types'

export default function AdminDashboard({
  profile,
  entriesCount,
  onProfileUpdate,
}: {
  profile: Profile
  entriesCount: number
  onProfileUpdate: (p: Profile) => void
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordChange = async () => {
    if (!newPassword) { setError('Password baru wajib diisi'); return }
    if (newPassword !== confirmPassword) { setError('Konfirmasi tidak cocok'); return }
    if (newPassword.length < 6) { setError('Minimal 6 karakter'); return }
    setSaving(true); setError('')
    const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id)
    setSaving(false)
    if (e) { setError(e.message); return }
    setSuccess('Password berhasil diubah!'); setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true); setError('')
    const ext = 'jpg'
    const fileName = `${profile.id}/avatar.${ext}`
    const { error: ue } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true })
    if (ue) { setError(ue.message); setSaving(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const avatarUrl = data.publicUrl
    const { error: ue2 } = await (supabase.from('profiles') as any).update({ avatar_url: avatarUrl }).eq('id', profile.id)
    setSaving(false)
    if (ue2) { setError(ue2.message); return }
    onProfileUpdate({ ...profile, avatar_url: avatarUrl }); setAvatarFile(null)
    setSuccess('Avatar diubah!'); setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-6">
          <div className="text-center">
            <div className="heading-display text-3xl text-[#2c2418]">{entriesCount}</div>
            <div className="text-[10px] uppercase tracking-widest text-[#9c8b78]">Entry</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-[#2c2418] mt-1">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="text-[10px] uppercase tracking-widest text-[#9c8b78]">Bergabung</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-xs uppercase tracking-[0.1em] font-semibold px-5 py-2.5 border border-[#ece8e1] rounded-md hover:bg-[#f5ede2] transition-colors text-[#6b5c4c]">
          {showSettings ? 'Tutup' : 'Pengaturan'}
        </button>
      </div>

      {showSettings && (
        <div className="bg-white rounded-2xl border border-[#ece8e1] p-8 mb-8">
          <h3 className="heading-display text-xl text-[#2c2418] mb-8 pb-4 border-b border-[#f5ede2]">Pengaturan Admin</h3>
          {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
          {success && <p className="text-xs text-[#6b5c4c] bg-[#f5ede2] p-3 rounded-lg mb-4">{success}</p>}
          <div className="grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#9c8b78] mb-4">Avatar</h4>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#f5ede2] border border-[#ece8e1] flex items-center justify-center text-[#b89870] font-bold text-xl overflow-hidden">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs w-full text-[#6b5c4c] mb-2" />
                  {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn-main text-xs">{saving ? '...' : 'Upload'}</button>}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#9c8b78] mb-4">Password</h4>
              <div className="space-y-3">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="w-full px-3 py-2 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870]" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="w-full px-3 py-2 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870]" />
                <button onClick={handlePasswordChange} disabled={saving} className="btn-main w-full text-xs">{saving ? '...' : 'Simpan Password'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
