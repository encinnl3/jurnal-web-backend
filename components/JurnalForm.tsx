'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

export default function JurnalForm({
  profileId,
  onSuccess,
}: {
  profileId: string
  onSuccess: () => void
}) {
  const [day, setDay] = useState(1)
  const [title, setTitle] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const ext = 'jpg'
    const fileName = `${profileId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, compressed, { upsert: true })

    if (error) {
      setError(`Upload foto gagal: ${error.message}`)
      return null
    }

    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) {
      setError('Title dan deskripsi wajib diisi')
      return
    }

    setLoading(true)
    setError(null)

    let fotoUrl: string | null = null
    if (foto) {
      fotoUrl = await uploadFoto(foto)
      if (!fotoUrl) {
        setLoading(false)
        return
      }
    }

    const { error: insertError } = await (supabase.from('jurnal_entries') as any).insert({
      profile_id: profileId,
      day,
      title: title.trim(),
      deskripsi: deskripsi.trim(),
      foto_url: fotoUrl,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setDay(day + 1)
    setTitle('')
    setDeskripsi('')
    setFoto(null)
    onSuccess()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="diary-card rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="stamp">New Entry</span>
        <div className="h-px flex-1 bg-[#d3c9b0]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#5d4037] mb-1.5">
            Day
          </label>
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2.5 border border-[#efebe9] rounded-xl bg-[#fff8e7] text-[#3e2723] focus:ring-2 focus:ring-[#8d6e63] transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5d4037] mb-1.5">
            Foto (otomatis kompres)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="w-full text-sm text-[#5d4037] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#8d6e63] file:text-white file:cursor-pointer file:font-medium"
          />
        </div>
      </div>

      {foto && (
        <div className="flex items-center gap-2 text-xs text-[#8d6e63] bg-[#fff3e0] px-3 py-2 rounded-lg">
          <span>&#128247;</span> {foto.name} - akan dikompres otomatis
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[#5d4037] mb-1.5">
          Judul
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Pengenalan Lingkungan Kerja"
          className="w-full px-4 py-2.5 border border-[#efebe9] rounded-xl bg-[#fff8e7] text-[#3e2723] focus:ring-2 focus:ring-[#8d6e63] transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#5d4037] mb-1.5">
          Cerita Hari Ini
        </label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          placeholder="Tuliskan kegiatan hari ini secara detail..."
          className="w-full px-4 py-2.5 border border-[#efebe9] rounded-xl bg-[#fff8e7] text-[#3e2723] focus:ring-2 focus:ring-[#8d6e63] transition paper-lines"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary px-5 py-3 rounded-xl font-semibold text-base disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Simpan Entry'}
      </button>
    </form>
  )
}
