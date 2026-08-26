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
    const { data, error } = await (supabase.from('jurnal_entries') as any).update({ day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl }).eq('id', entry.id).select().single()
    setSaving(false)
    if (error) return
    onChanged(data); setEditing(false); setFoto(null)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error } = await (supabase.from('jurnal_entries') as any).update({ foto_url: null }).eq('id', entry.id).select().single()
    if (!error) onChanged(data)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDay(entry.day); setTitle(entry.title); setDeskripsi(entry.deskripsi); setFoto(null)
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="w-16 px-3 py-2 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c]" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-2 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-[#c49a6c]" />
           </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-[#c49a6c]/10 text-[#c49a6c] text-xs font-semibold">Day {entry.day}</span>
              <h2 className="font-semibold text-white text-base truncate">{entry.title}</h2>
           </div>
          )}
       </div>
        <div className="flex gap-2 ml-3">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg bg-white/5 text-[#9e9587] hover:bg-white/10 text-xs transition">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded-lg bg-[#c49a6c] text-[#0d0c0b] text-xs font-semibold hover:opacity-90 transition">{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg bg-white/5 text-[#9e9587] hover:bg-white/10 text-xs transition">Edit</button>
              <button onClick={onDelete} className="px-3 py-1.5 rounded-lg bg-red-900/10 text-red-400 hover:bg-red-900/20 text-xs transition">Hapus</button>
            </>
          )}
       </div>
     </div>

      {editing && entry.foto_url && !foto && (
        <div className="p-5 pb-0">
          <div className="relative inline-block">
            <img src={entry.foto_url} alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
            <button onClick={removeFoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">×</button>
         </div>
       </div>
      )}

      {editing && (
        <div className="px-5 pt-3">
          <label className="inline-block text-xs px-4 py-2 border border-dashed border-[#c49a6c]/30 rounded-lg text-[#c49a6c] cursor-pointer hover:bg-[#c49a6c]/5 transition">
            {foto ? foto.name : '+ Ganti foto'}
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
         </label>
       </div>
      )}

      {entry.foto_url && !editing && (
        <div className="w-full h-64 overflow-hidden">
          <img src={entry.foto_url} alt={entry.title} className="w-full h-full object-cover" />
       </div>
      )}

      <div className="p-6">
        <div className="pl-5 border-l-2 border-[#c49a6c]/30">
          {editing ? (
            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} className="w-full px-4 py-3 bg-[#1c1a18] border border-[#3c352e] rounded-xl text-white text-sm focus:outline-none focus:border-[#c49a6c] resize-none leading-relaxed" />
          ) : (
            <p className="text-[#9e9587] text-sm leading-relaxed whitespace-pre-wrap font-light">{entry.deskripsi}</p>
          )}
       </div>
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[#5c554c] text-[10px] uppercase tracking-[0.15em]">
            {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
         </p>
       </div>
     </div>
   </div>
  )
}
