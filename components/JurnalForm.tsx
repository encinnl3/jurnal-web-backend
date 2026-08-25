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
    const { error: e } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (e) { setError(e.message); return null }
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) { setError('Judul & deskripsi wajib'); return }

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
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Day</label>
          <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input input-sm" />
        </div>
        <div>
          <label className="label">Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="input input-sm" />
        </div>
      </div>

      <div>
        <label className="label">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" className="input input-sm" />
      </div>

      <div>
        <label className="label">Deskripsi</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} placeholder="Ceritakan kegiatan..." className="input" />
      </div>

      {error && <p className="message message-error">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}
