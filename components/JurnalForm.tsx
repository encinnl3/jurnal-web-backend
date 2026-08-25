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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#ece8e1] p-8">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs uppercase tracking-widest text-[#9c8b78] font-semibold">New Entry</span>
        <div className="flex-1 h-px bg-[#f5ede2]" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs uppercase tracking-widest text-[#9c8b78] mb-2 block">Day</label>
          <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870]" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[#9c8b78] mb-2 block">Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-xs text-[#6b5c4c] py-2" />
        </div>
      </div>
      <div className="mb-5">
        <label className="text-xs uppercase tracking-widest text-[#9c8b78] mb-2 block">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="w-full px-4 py-2.5 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870]" />
      </div>
      <div className="mb-6">
        <label className="text-xs uppercase tracking-widest text-[#9c8b78] mb-2 block">Deskripsi</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} placeholder="Ceritakan kegiatan..." className="w-full px-4 py-3 bg-[#fdfcf8] border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870] resize-none leading-relaxed" />
      </div>
      {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
      <button type="submit" disabled={loading} className="btn-main w-full">
        {loading ? 'Menyimpan...' : 'Simpan Entry'}
      </button>
    </form>
  )
}
