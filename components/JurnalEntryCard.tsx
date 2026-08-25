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
  const [error, setError] = useState<string | null>(null)
  const [day, setDay] = useState(entry.day)
  const [title, setTitle] = useState(entry.title)
  const [deskripsi, setDeskripsi] = useState(entry.deskripsi)
  const [foto, setFoto] = useState<File | null>(null)

  const uploadFoto = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file, 1000, 0.75)
    const fileName = `${entry.profile_id}/${entry.id}-${Date.now()}.jpg`
    const { error: e } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, compressed, { upsert: true })

    if (e) { setError(`Upload foto gagal: ${e.message}`); return null }

    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

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

  const handleCancel = () => {
    setDay(entry.day)
    setTitle(entry.title)
    setDeskripsi(entry.deskripsi)
    setFoto(null)
    setError(null)
    setEditing(false)
  }

  const removeFoto = async () => {
    if (!confirm('Hapus foto?')) return
    const { data, error: e } = await (supabase.from('jurnal_entries') as any)
      .update({ foto_url: null }).eq('id', entry.id).select().single()
    if (e) { setError(e.message); return }
    onChanged(data)
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between bg-bg-secondary border-b border-card-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <input type="number" min={1} value={day} onChange={(e) => setDay(parseInt(e.target.value) || 1)} className="input w-24 text-sm" />
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input flex-1 text-sm font-semibold" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="badge">Day {entry.day}</span>
              <h3 className="text-lg font-semibold title-display">{entry.title}</h3>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          {editing ? (
            <>
              <button onClick={handleCancel} disabled={saving} className="btn btn-ghost btn-sm">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">{saving ? 'Simpan' : 'Simpan'}</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{color: 'var(--error)'}}>Hapus</button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-6 py-4 bg-bg-secondary border-b border-card-border">
          <div className="flex items-center gap-4 flex-wrap">
            {entry.foto_url && !foto && (
              <div className="relative">
                <img src={entry.foto_url} alt="current" className="w-20 h-20 rounded-xl object-cover border-2 border-card-border" />
                <button onClick={removeFoto} className="absolute -top-2 -right-2 btn btn-danger btn-sm" style={{padding: '2px 6px', borderRadius: 100}} type="button">×</button>
              </div>
            )}
            <label className="btn btn-secondary btn-sm cursor-pointer">
              {foto ? `Pilih: ${foto.name}` : '+ Ganti foto'}
              <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {entry.foto_url && !editing && (
        <img src={entry.foto_url} alt={entry.title} className="image-cover mx-6 mt-6" style={{width: 'calc(100% - 48px)'}} />
      )}

      <div className="p-6">
        {editing ? (
          <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={6} placeholder="Ceritakan kegiatan hari ini..." className="input" />
        ) : (
          <p className="text-fg-secondary leading-relaxed whitespace-pre-wrap">{entry.deskripsi}</p>
        )}
        <div className="divider" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">{new Date(entry.created_at).toLocaleString('id-ID')}</p>
        </div>
        {error && <p className="message message-error mt-3">{error}</p>}
      </div>
    </div>
  )
}
