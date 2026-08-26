'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

export default function JurnalEntryCard({ entry, onDelete, onChanged }: { entry: any; onDelete: () => void; onChanged: (next: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [day, setDay] = useState(entry.day)
  const [title, setTitle] = useState(entry.title)
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi)
  const [foto, setFoto] = useState<File | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const fileName = entry.profile_id + '/' + entry.id + '-' + Date.now() + '.jpg'
    const { error } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    let fotoUrl = entry.foto_url
    if (foto) {
      const url = await uploadFoto(foto)
      if (url) fotoUrl = url
      else { setSaving(false); return }
    }
    const { data, error } = await (supabase.from('jurnal_entries') as any)
      .update({ day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
      .eq('id', entry.id).select().single()
    setSaving(false)
    if (error) return
    onChanged(data)
    setEditing(false)
    setFoto(null)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error } = await (supabase.from('jurnal_entries') as any)
      .update({ foto_url: null }).eq('id', entry.id).select().single()
    if (!error) onChanged(data)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDay(entry.day)
    setTitle(entry.title)
    setDeskripsi(entry.deskripsi)
    setFoto(null)
  }

  return (
    <article className="bg-white rounded-[24px] border border-[#e8e2d9] overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 flex items-center justify-between border-b border-[#f5f0e8]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-3 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-20 px-3 py-2 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm focus:outline-none focus:border-[#b09678]" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-2 bg-[#f9f7f2] border border-[#e8e2d9] rounded-full text-sm font-semibold focus:outline-none focus:border-[#b09678]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 bg-[#f5f0e8] text-[#b09678] text-xs font-semibold rounded-md">Day {entry.day}</span>
              <h2 className="font-semibold text-lg text-[#2c2418] truncate">{entry.title}</h2>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-3">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="text-xs px-4 py-2 rounded-full border border-[#e8e2d9] text-[#6b5e4e] hover:bg-[#f9f7f2]">Batal</button>
              <button onClick={handleSave} disabled={saving} className="text-xs px-4 py-2 rounded-full bg-[#2c2418] text-white hover:bg-[#4a3c2a]">{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-xs px-4 py-2 rounded-full border border-[#e8e2d9] text-[#6b5e4e] hover:bg-[#f9f7f2]">Edit</button>
              <button onClick={onDelete} className="text-xs px-4 py-2 rounded-full text-red-500 hover:bg-red-50">Hapus</button>
            </>
          )}
        </div>
      </div>

      {editing && entry.foto_url && !foto && (
        <div className="p-6 pb-0">
          <div className="relative inline-block">
            <img src={entry.foto_url} alt="" className="w-24 h-24 rounded-2xl object-cover border border-[#e8e2d9]" />
            <button onClick={removeFoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">×</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="px-6 pt-3">
          <label className="inline-block text-xs px-4 py-2 border border-dashed border-[#b09678] rounded-full text-[#6b5e4e] cursor-pointer hover:bg-[#f9f7f2]">
            {foto ? foto.name : '+ Ganti foto'}
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
      )}

      {entry.foto_url && !editing && (
        <div className="w-full h-[280px]">
          <img src={entry.foto_url} alt={entry.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6">
        <div className="pl-5 border-l-2 border-[#b09678]">
          {editing ? (
            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} className="w-full px-4 py-3 bg-[#f9f7f2] border border-[#e8e2d9] rounded-2xl text-sm focus:outline-none focus:border-[#b09678] resize-none leading-relaxed" />
          ) : (
            <p className="text-[#6b5e4e] text-sm leading-relaxed whitespace-pre-wrap font-light">{entry.deskripsi}</p>
          )}
        </div>
        <div className="mt-5 pt-4 border-t border-[#f5f0e8]">
          <time className="text-[10px] uppercase tracking-[0.2em] text-[#b09678] font-semibold">
            {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
        </div>
      </div>
    </article>
  )
}
