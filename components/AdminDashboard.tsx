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
    if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok'); return }
    if (newPassword.length < 6) { setError('Password minimal 6 karakter'); return }

    setSaving(true)
    setError('')
    const { error: e } = await (supabase.from('profiles') as any)
      .update({ password: newPassword }).eq('id', profile.id)
    setSaving(false)

    if (e) { setError(e.message); return }
    setSuccess('Password berhasil diubah!')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setSaving(true)
    setError('')

    const ext = avatarFile.name.split('.').pop()
    const fileName = `${profile.id}/avatar.${ext}`
    const { error: ue } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true })
    if (ue) { setError(ue.message); setSaving(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const avatarUrl = data.publicUrl
    const { error: ue2 } = await (supabase.from('profiles') as any)
      .update({ avatar_url: avatarUrl }).eq('id', profile.id)
    setSaving(false)

    if (ue2) { setError(ue2.message); return }
    onProfileUpdate({ ...profile, avatar_url: avatarUrl })
    setAvatarFile(null)
    setSuccess('Avatar berhasil diubah!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="stat-card">
            <div className="stat-value">{entriesCount}</div>
            <div className="stat-label">Total Entry</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{fontSize: 16, marginTop: 6}}>
              {new Date(profile.created_at).toLocaleDateString('id-ID')}
            </div>
            <div className="stat-label">Bergabung</div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-secondary"
        >
          {showSettings ? 'Tutup' : '⚙ Pengaturan'}
        </button>
      </div>

      {showSettings && (
        <div className="card p-8 animate-in">
          <h3 className="text-xl title-display mb-6">Pengaturan Admin</h3>

          {error && <p className="message message-error mb-4">{error}</p>}
          {success && <p className="message message-success mb-4">{success}</p>}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Ubah Avatar</h4>
              <div className="flex items-center gap-4">
                <div className="avatar shadow-md">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-sm text-fg-secondary" />
                  {avatarFile && (
                    <button onClick={handleAvatarUpload} disabled={saving} className="btn btn-primary btn-sm mt-3">
                      {saving ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ubah Password</h4>
              <div className="space-y-3">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password baru" className="input" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi password" className="input" />
                <button onClick={handlePasswordChange} disabled={saving} className="btn btn-primary w-full">
                  {saving ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
