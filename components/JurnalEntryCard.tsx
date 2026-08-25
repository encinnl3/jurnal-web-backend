'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'
import type { JurnalEntry } from '@/lib/types'

export default function JurnalEntryCard({ entry, onDelete, onChanged }: { entry: JurnalEntry; onDelete: () => void; onChanged: (next: JurnalEntry) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [day, setDay] = useState(entry.day)
  const [title, setTitle] = useState(entry.title)
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi)
  const [foto, setFoto] = useState<File | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const fileName = `${entry.profile_id}/${entry.id}-${Date.now()}.jpg`
    const { error: e } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (e) return null
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    let fotoUrl = entry.foto_url
    if (foto) { const url = await uploadFoto(foto); if (url) fotoUrl = url; else { setSaving(false); return } }
    const { data, error: e } = await (supabase.from('jurnal_entries') as any).update({ day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl }).eq('id', entry.id).select().single()
    setSaving(false)
    if (e) return
    onChanged(data); setEditing(false); setFoto(null)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error: e } = await (supabase.from('jurnal_entries') as any).update({ foto_url: null }).eq('id', entry.id).select().single()
    if (!e) onChanged(data)
  }

  return (
    <article className="group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-20 px-3 py-2 bg-white border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870]" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-[#ece8e1] rounded-lg text-sm font-semibold focus:outline-none focus:border-[#b89870]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-[#9c8b78] font-semibold">Day {entry.day}</span>
              <h2 className="heading-display text-2xl text-[#2c2418]">{entry.title}</h2>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDay(entry.day); setTitle(entry.title); setDeskripsi(entry.deskripsi); setFoto(null) }} className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 text-[#6b5c4c] hover:bg-[#f5ede2] rounded">Batal</button>
              <button onClick={handleSave} disabled={saving} className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 text-[#2c2418] hover:bg-[#f5ede2] rounded">{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 text-[#6b5c4c] hover:bg-[#f5ede2] rounded">Edit</button>
              <button onClick={onDelete} className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 text-[#9c8b78] hover:text-red-500 hover:bg-[#fdf5f5] rounded">Hapus</button>
            </>
          )}
        </div>
      </div>

      {editing && entry.foto_url && !foto && (
        <div className="mb-4 relative inline-block">
          <img src={entry.foto_url} alt="current" className="w-24 h-24 rounded-lg object-cover border border-[#ece8e1]" />
          <button onClick={removeFoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
        </div>
      )}
      {editing && (
        <label className="inline-block mb-4 text-xs uppercase tracking-widest font-semibold px-3 py-1.5 border border-dashed border-[#b89870] rounded text-[#6b5c4c] cursor-pointer hover:bg-[#f5ede2]">
          {foto ? foto.name : 'Ganti foto'}
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
        </label>
      )}

      {entry.foto_url && !editing && (
        <div className="rounded-2xl overflow-hidden mb-6 border border-[#ece8e1]">
          <img src={entry.foto_url} alt={entry.title} className="w-full h-[320px] object-cover" />
        </div>
      )}

      <div className="pl-5 border-l-2 border-[#f5ede2]">
        {editing ? (
          <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} className="w-full px-4 py-3 bg-white border border-[#ece8e1] rounded-lg text-sm focus:outline-none focus:border-[#b89870] resize-none leading-relaxed" />
        ) : (
          <p className="text-[#6b5c4c] text-[15px] leading-relaxed whitespace-pre-wrap font-light">{entry.deskripsi}</p>
        )}
      </div>
      <div className="mt-6 pt-4 border-b border-[#f5ede2]">
        <time className="text-[10px] uppercase tracking-widest text-[#b89870]">{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
      </div>
    </article>
  )
}
