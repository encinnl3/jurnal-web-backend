'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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
    const ext = file.name.split('.').pop()
    const fileName = `${profileId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, file, { upsert: true })

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
      className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl p-5 shadow-sm mb-6 space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#4a3c31] mb-1">
            Day
        </label>
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
      </div>
        <div>
          <label className="block text-sm font-medium text-[#4a3c31] mb-1">
            Foto
        </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="w-full text-sm text-[#4a3c31] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#8b5e3c] file:text-[#f4eedd] file:cursor-pointer"
          />
      </div>
    </div>

      <div>
        <label className="block text-sm font-medium text-[#4a3c31] mb-1">
          Title
    </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Pengenalan Lingkungan Kerja"
          className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
        />
    </div>

      <div>
        <label className="block text-sm font-medium text-[#4a3c31] mb-1">
          Deskripsi
    </label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={4}
          placeholder="Ceritakan kegiatan hari ini"
          className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
        />
    </div>

      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#8b5e3c] text-[#f4eedd] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Menyimpan' : 'Simpan Entry'}
    </button>
  </form>
  )
}
