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
    let fotoUrl: string | null = null
    if (foto) { fotoUrl = await uploadFoto(foto); if (!fotoUrl) { setLoading(false); return } }
    const { error: ie } = await (supabase.from('jurnal_entries') as any).insert({ profile_id: profileId, day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
    setLoading(false)
    if (ie) { setError(ie.message); return }
    setDay(day + 1); setTitle(''); setDeskripsi(''); setFoto(null); onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8">
      <div className="flex items-center gap-3 mb-7">
        <span className="text-[#c49a6c] text-[10px] font-semibold uppercase tracking-[0.2em]">New Entry</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-3 block">Day</label>
          <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-full px-5 py-3 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] transition" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-3 block">Foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-xs text-[#9e9587] py-2.5" />
        </div>
      </div>
      {foto && <div className="mb-5 px-4 py-2.5 rounded-xl bg-[#c49a6c]/10 border border-[#c49a6c]/20 text-[#c49a6c] text-xs">{foto.name} — akan dikompres otomatis</div>}
      <div className="mb-5">
        <label className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-3 block">Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul hari ini..." className="w-full px-5 py-3 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] transition" />
      </div>
      <div className="mb-7">
        <label className="text-[10px] uppercase tracking-[0.2em] text-[#9e9587] mb-3 block">Deskripsi</label>
        <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} placeholder="Ceritakan kegiatan hari ini..." className="w-full px-5 py-4 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] resize-none leading-relaxed" />
      </div>
      {error && <p className="text-xs text-red-400 bg-red-900/10 p-3 rounded-xl mb-5 text-center">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#c49a6c] text-[#0d0c0b] text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
        {loading ? 'Menyimpan...' : 'Simpan Entry'}
      </button>
    </form>
  )
}
