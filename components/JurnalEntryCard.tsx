'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { compressImage } from '@/lib/imageUtils'
import type { JurnalEntry } from '@/lib/types'

export default function JurnalEntryCard({
  entry,
  onDelete,
  onChanged,
}: {
  entry: JurnalEntry
  onDelete: () => void
  onChanged: (next: JurnalEntry) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [day, setDay] = useState(entry.day)
  const [title, setTitle] = useState(entry.title)
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi)
  const [foto, setFoto] = useState<File | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const fileName = `${entry.profile_id}/${entry.id}-${Date.now()}.jpg`
    const { error: e } = await supabase.storage.from('jurnal-foto').upload(fileName, compressed, { upsert: true })
    if (e) { setError(e.message); return null }
    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    let fotoUrl = entry.foto_url
    if (foto) {
      const url = await uploadFoto(foto)
      if (!url) { setSaving(false); return }
      fotoUrl = url
    }

    const { data, error: e } = await (supabase.from('jurnal_entries') as any)
      .update({ day, title: title.trim(), deskripsi: deskripsi.trim(), foto_url: fotoUrl })
      .eq('id', entry.id).select().single()

    setSaving(false)
    if (e) { setError(e.message); return }
    onChanged(data)
    setEditing(false)
    setFoto(null)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error: e } = await (supabase.from('jurnal_entries') as any).update({ foto_url: null }).eq('id', entry.id).select().single()
    if (e) { setError(e.message); return }
    onChanged(data)
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 bg-bg-subtle flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input input-sm w-16" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input input-sm flex-1" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="day-badge">Day {entry.day}</span>
              <h3 className="font-semibold truncate">{entry.title}</h3>
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDay(entry.day); setTitle(entry.title); setDeskripsi(entry.deskripsi); setFoto(null); setError('') }} className="btn btn-ghost btn-sm">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">{saving ? '...' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={onDelete} className="btn btn-danger">Hapus</button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-6 py-3 bg-bg-subtle border-b border-border">
          {entry.foto_url && !foto && (
            <div className="relative inline-block">
              <img src={entry.foto_url} alt="current" className="w-16 h-16 rounded-lg object-cover" />
              <button onClick={removeFoto} className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" type="button">×</button>
            </div>
          )}
          <label className="btn btn-ghost btn-sm mt-2">
            {foto ? `${foto.name}` : '+ Ganti foto'}
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
      )}

      {entry.foto_url && !editing && <img src={entry.foto_url} alt={entry.title} className="w-full h-48 object-cover" />}

      <div className="p-6">
        {editing ? (
          <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="input w-full" />
        ) : (
          <p className="text-fg-secondary text-sm whitespace-pre-wrap">{entry.deskripsi}</p>
        )}
        <div className="divider"></div>
        <p className="text-xs text-fg-muted">{new Date(entry.created_at).toLocaleString('id-ID')}</p>
        {error && <p className="message message-error mt-2">{error}</p>}
      </div>
    </div>
  )
}
