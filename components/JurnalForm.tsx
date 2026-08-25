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
    const fileName = `${profileId}/${Date.now()}.jpg`
    const { error: e } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (e) { setError(e.message); return null }
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !deskripsi.trim()) { setError('Judul & deskripsi wajib'); return }
    setLoading(true); setError(null)
    let fotoUrl: string | null = null
    if (foto) { fotoUrl = await uploadFoto(foto); if (!fotoUrl) { setLoading(false); return } }
    const { error: ie } = await (supabase.from('jurnal_entries') as any).insert({ profile_id: profileId, day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
    setLoading(false)
    if (ie) { setError(ie.message); return }
    setDay(day + 1); setTitle(''); setDeskripsi(''); setFoto(null); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-[#e8e2d9] p-10">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] font-semibold">New Entry</span>
        <div className="flex-1 h-px bg-[#e8e2d9]" />
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-3 block">Day</label>
          <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-full px-5 py-3 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm focus:outline-none focus:border-[#b09678]" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-3 block">Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-xs py-3" />
        </div>
      </div>
      <div className="mb-6">
        <label className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-3 block">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="w-full px-5 py-3 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm focus:outline-none focus:border-[#b09678]" />
      </div>
      <div className="mb-8">
        <label className="text-xs uppercase tracking-[0.2em] text-[#9c8b78] mb-3 block">Deskripsi</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} placeholder="Ceritakan kegiatan hari ini..." className="w-full px-6 py-4 bg-[#f9f7f2] border border-[#e8e2d9] rounded-[24px] text-sm focus:outline-none focus:border-[#b09678] resize-none leading-relaxed" />
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 p-4 rounded-2xl mb-6">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg">{loading ? 'Menyimpan...' : 'Simpan Entry'}</button>
    </form>
  )
}
