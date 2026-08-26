'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

export default function JurnalForm({ profileId, onSuccess }: { profileId: string; onSuccess: () => void }) {
  const [day, setDay] = useState(1)
  const [title, setTitle] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const fileName = profileId + '/' + Date.now() + '.jpg'
    const { error: e } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (e) { setError(e.message); return null }
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) { setError('Judul & deskripsi wajib'); return }
    setLoading(true); setError(null)
    try {
      let fotoUrl: string | null = null
      if (foto) {
        fotoUrl = await uploadFoto(foto)
        if (!fotoUrl) { setLoading(false); return }
      }
      const { error: ie } = await (supabase.from('jurnal_entries') as any).insert({
        profile_id: profileId,
        day: Number(day),
        title: title.trim(),
        deskripsi: deskripsi.trim(),
        foto_url: fotoUrl
      })
      if (ie) throw ie
      setDay(day + 1); setTitle(''); setDeskripsi(''); setFoto(null); onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs uppercase tracking-widest text-[#8c8278] font-semibold">New Entry</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#8c8278] mb-2 block">Day</label>
          <input
            type="number"
            min={1}
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value) || 1)}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[#8c8278] mb-2 block">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="text-xs text-[#8c8278] py-2.5"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest text-[#8c8278] mb-2 block">Judul</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul hari ini..."
          className="input-field"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs uppercase tracking-widest text-[#8c8278] mb-2 block">Deskripsi</label>
        <textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          rows={5}
          placeholder="Ceritakan kegiatan hari ini..."
          className="input-field resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg mb-4">{error}</p>}
      
      <button type="submit" disabled={loading} className="btn-custom btn-primary w-full">
        {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
      </button>
    </form>
  )
}
