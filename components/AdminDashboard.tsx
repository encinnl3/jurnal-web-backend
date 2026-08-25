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
    if (!newPassword) { setError('Password wajib'); return }
    if (newPassword !== confirmPassword) { setError('Tidak cocok'); return }
    if (newPassword.length < 6) { setError('Minimal 6 karakter'); return }
    setSaving(true); setError('')
    const { error: e } = await (supabase.from('profiles') as any).update({ password: newPassword }).eq('id', profile.id)
    setSaving(false)
    if (e) { setError(e.message); return }
    setSuccess('Berhasil diubah!'); setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true); setError('')
    const fileName = `${profile.id}/avatar.jpg`
    const { error: ue } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true })
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-12">
          <div className="text-center">
            <div className="text-5xl font-bold display text-[#2c2418]">{entriesCount}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mt-1">Jurnal</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-[#2c2418] mt-3">{new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mt-1">Bergabung</div>
          </div>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary">
          {showSettings ? 'Tutup' : 'Pengaturan'}
        </button>
      </div>

      {showSettings && (
        <div className="bg-white rounded-[40px] border border-[#e8e2d9] p-10 mb-8">
          <h3 className="heading-md display text-[#2c2418]">Pengaturan Admin</h3>
          {error && <p className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl mb-4">{error}</p>}
          {success && <p className="text-sm bg-[#f5ede2] p-4 rounded-2xl mb-4">{success}</p>}
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-6">Avatar</h4>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#b09678] flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs w-full mb-3" />
                  {avatarFile && <button onClick={handleAvatarUpload} disabled={saving} className="btn btn-primary w-full">{saving ? '...' : 'Upload'}</button>}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-6">Password</h4>
              <div className="space-y-4">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="w-full px-5 py-3 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm focus:outline-none focus:border-[#b09678]" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi" className="w-full px-5 py-3 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm focus:outline-none focus:border-[#b09678]" />
                <button onClick={handlePasswordChange} disabled={saving} className="btn btn-primary w-full">{saving ? '...' : 'Simpan Password'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
