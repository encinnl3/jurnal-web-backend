'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'

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
    if (!newPassword) {
      setError('Password baru wajib diisi')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setSaving(true)
    setError('')

    const { error } = await (supabase.from('profiles') as any)
      .update({ password: newPassword })
      .eq('id', profile.id)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

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

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setSaving(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const avatarUrl = data.publicUrl

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({ avatar_url: avatarUrl })
      .eq('id', profile.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    onProfileUpdate({ ...profile, avatar_url: avatarUrl })
    setAvatarFile(null)
    setSuccess('Avatar berhasil diubah!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#ebe1c9] px-4 py-2 rounded-lg border border-[#d3c9b0]">
            <span className="text-xs text-[#8b5e3c]">Total Entry</span>
            <p className="text-2xl font-bold text-[#4a3c31]">{entriesCount}</p>
          </div>
          <div className="bg-[#ebe1c9] px-4 py-2 rounded-lg border border-[#d3c9b0]">
            <span className="text-xs text-[#8b5e3c]">Bergabung</span>
            <p className="text-sm font-semibold text-[#4a3c31]">
              {new Date(profile.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-[#8b5e3c] hover:text-[#5d3f25] text-sm px-4 py-2 rounded-lg border border-[#d3c9b0] hover:border-[#8b5e3c] transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v10M4.22 4.22l4.24 4.24m7.07 7.07l4.24 4.24M1 12h6m6 0h10M4.22 19.78l4.24-4.24m7.07-7.07l4.24-4.24"></path>
          </svg>
          {showSettings ? 'Tutup' : 'Pengaturan'}
        </button>
      </div>

      {showSettings && (
        <div className="diary-card rounded-2xl p-6 space-y-6">
          <h3 className="font-semibold text-lg text-[#4a3c31] border-b border-[#d3c9b0] pb-2">
            Pengaturan Admin
          </h3>

          {error && <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[#4a3c31] mb-3">Ganti Avatar</h4>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5e3c] to-[#5d3f25] flex items-center justify-center text-[#f1e7d0] font-bold text-xl shadow-md overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="text-sm text-[#4a3c31] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#8b5e3c] file:text-[#f1e7d0] file:cursor-pointer"
                  />
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={saving}
                      className="mt-2 text-sm bg-[#8b5e3c] text-[#f1e7d0] px-3 py-1.5 rounded-lg hover:bg-[#5d3f25] transition disabled:opacity-50"
                    >
                      {saving ? 'Mengunggah...' : 'Upload'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-[#4a3c31] mb-3">Ganti Password</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                  className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#fbf6e9] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password"
                  className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#fbf6e9] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="w-full bg-[#8b5e3c] text-[#f1e7d0] px-4 py-2 rounded-lg font-semibold hover:bg-[#5d3f25] transition disabled:opacity-50"
                >
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
