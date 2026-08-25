'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
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
    const ext = file.name.split('.').pop()
    const fileName = `${entry.profile_id}/${entry.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, file, { upsert: true })

    if (error) {
      setError(`Upload foto gagal: ${error.message}`)
      return null
    }

    const { data } = supabase.storage.from('jurnal-foto').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    let fotoUrl = entry.foto_url
    if (foto) {
      const url = await uploadFoto(foto)
      if (!url) {
        setSaving(false)
        return
      }
      fotoUrl = url
    }

    const { data, error } = await supabase
      .from('jurnal_entries')
      .update({
        day,
        title: title.trim(),
        deskripsi: deskripsi.trim(),
        foto_url: fotoUrl,
      })
      .eq('id', entry.id)
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

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
    const { data, error } = await supabase
      .from('jurnal_entries')
      .update({ foto_url: null })
      .eq('id', entry.id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }
    onChanged(data)
  }

  return (
    <div className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-[#d3c9b0] flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <input
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 text-sm border border-[#d3c9b0] rounded bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
            />
          ) : (
            <span className="bg-[#8b5e3c] text-[#f4eedd] text-xs font-bold px-2.5 py-1 rounded">
              Day {entry.day}
            </span>
          )}
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="flex-1 px-2 py-1 text-sm font-semibold border border-[#d3c9b0] rounded bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
            />
          ) : (
            <h3 className="font-semibold text-[#4a3c31] truncate">
              {entry.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="text-xs px-2 py-1 text-[#8b5e3c] hover:underline disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-3 py-1 bg-[#8b5e3c] text-[#f4eedd] rounded font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Menyimpan' : 'Simpan'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[#8b5e3c] hover:underline"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-red-700 hover:underline"
              >
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-5 py-3 border-b border-[#d3c9b0] bg-[#f4eedd]">
          <div className="flex items-center gap-3 flex-wrap">
            {entry.foto_url && !foto && (
              <div className="relative">
                <img
                  src={entry.foto_url}
                  alt="current"
                  className="w-20 h-20 object-cover rounded border border-[#d3c9b0]"
                />
                <button
                  onClick={removeFoto}
                  className="absolute -top-2 -right-2 bg-red-700 text-[#f4eedd] rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-800"
                  type="button"
                >
                  ×
                </button>
              </div>
            )}
            <label className="text-xs px-3 py-2 border border-dashed border-[#8b5e3c] rounded cursor-pointer hover:bg-[#ebe1c9] text-[#4a3c31]">
              {foto ? `Pilih: ${foto.name}` : 'Ganti foto'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {entry.foto_url && !editing && (
        <img src={entry.foto_url} alt={entry.title} className="w-full h-64 object-cover" />
      )}

      <div className="p-5">
        {editing ? (
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={5}
            placeholder="Deskripsi"
            className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
          />
        ) : (
          <p className="text-[#4a3c31] whitespace-pre-wrap">
            {entry.deskripsi}
          </p>
        )}
        <p className="text-xs text-[#8b5e3c] mt-3">
          {new Date(entry.created_at).toLocaleString('id-ID')}
        </p>
        {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      </div>
    </div>
  )
}
