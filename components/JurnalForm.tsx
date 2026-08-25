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
    const fileName = `${profileId}/${Date.now()}.jpg`
    const { error: e } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, compressed, { upsert: true })

    if (e) { setError(`Upload foto gagal: ${e.message}`); return null }

    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) { setError('Judul dan deskripsi wajib diisi'); return }

    setLoading(true)
    setError(null)

    let fotoUrl: string | null = null
    if (foto) {
      fotoUrl = await uploadFoto(foto)
      if (!fotoUrl) { setLoading(false); return }
    }

    const { error: ie } = await (supabase.from('jurnal_entries') as any).insert({
      profile_id: profileId, day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl,
    })

    setLoading(false)
    if (ie) { setError(ie.message); return }

    setDay(day + 1)
    setTitle('')
    setDeskripsi('')
    setFoto(null)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge">New Entry</span>
        <div className="h-px flex-1 bg-card-border" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label">Day</label>
          <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input" />
        </div>
        <div>
          <label className="label">Foto (otomatis kompres)</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="input text-sm" />
        </div>
      </div>

      {foto && (
        <div className="message message-success mb-4">📷 {foto.name} — akan dikompres otomatis</div>
      )}

      <div className="mb-6">
        <label className="label">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul jurnal hari ini" className="input" />
      </div>

      <div className="mb-6">
        <label className="label">Cerita Hari Ini</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} placeholder="Tuliskan kegiatan hari ini..." className="input" />
      </div>

      {error && <p className="message message-error mb-4">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
        {loading ? 'Menyimpan...' : 'Simpan Entry'}
      </button>
    </form>
  )
}
