'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'

export default function JurnalEntryCard({ entry, onDelete, onChanged }: { entry: any; onDelete: () => void; onChanged: (next: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [day, setDay] = useState(String(entry.day))
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
    const parsedDay = parseInt(day) || 1
    setSaving(true)
    let fotoUrl = entry.foto_url
    if (foto) {
      const url = await uploadFoto(foto)
      if (url) fotoUrl = url
      else { setSaving(false); return }
    }
    const { data, error } = await (supabase.from('jurnal_entries') as any)
      .update({ day: parsedDay, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
      .eq('id', entry.id).select().single()
    setSaving(false)
    if (error) return
    onChanged(data); setEditing(false); setFoto(null)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error } = await (supabase.from('jurnal_entries') as any)
      .update({ foto_url: null }).eq('id', entry.id).select().single()
    if (!error) onChanged(data)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDay(String(entry.day)); setTitle(entry.title); setDeskripsi(entry.deskripsi); setFoto(null)
  }

  return (
    <div className="glass-card overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(e.target.value)} className="input-field w-16 text-sm" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field flex-1 text-sm font-semibold" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span style={{ background: 'var(--accent)', color: 'var(--bg)' }} className="px-3 py-1 rounded-lg text-xs font-bold">Day {entry.day}</span>
              <h2 style={{ color: 'var(--fg)' }} className="font-semibold text-base truncate">{entry.title}</h2>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-3">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="btn-custom btn-ghost text-xs" style={{ padding: '8px 16px' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-custom btn-primary text-xs" style={{ padding: '8px 16px' }}>{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn-custom btn-ghost text-xs" style={{ padding: '8px 16px' }}>Edit</button>
              <button onClick={onDelete} className="btn-custom btn-ghost text-xs" style={{ padding: '8px 16px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>Hapus</button>
            </>
          )}
        </div>
      </div>

      {editing && entry.foto_url && !foto && (
        <div className="p-5 pb-0">
          <div className="relative inline-block">
            <img src={entry.foto_url} alt="" className="w-20 h-20 rounded-xl object-cover" style={{ border: '1px solid var(--border)' }} />
            <button onClick={removeFoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="px-5 pt-3">
          <label className="inline-block text-xs px-4 py-2 rounded-lg cursor-pointer transition" style={{ border: '1px dashed var(--accent)', color: 'var(--accent)' }}>
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
        <div className="pl-5" style={{ borderLeft: '2px solid var(--accent)' }}>
          {editing ? (
            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={5} className="input-field resize-none" />
          ) : (
            <p style={{ color: 'var(--fg-muted)' }} className="text-sm leading-relaxed whitespace-pre-wrap font-light">{entry.deskripsi}</p>
          )}
        </div>
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--fg-muted)', opacity: 0.5 }} className="text-[10px] uppercase tracking-widest">
            {new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
