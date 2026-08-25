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
    const ext = 'jpg'
    const fileName = `${entry.profile_id}/${entry.id}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('jurnal-foto')
      .upload(fileName, compressed, { upsert: true })

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

    const { data, error } = await (supabase
      .from('jurnal_entries') as any)
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
    const { data, error } = await (supabase
      .from('jurnal_entries') as any)
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
    <div className="diary-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4 border-b border-[#efebe9] flex items-center justify-between bg-gradient-to-r from-[#fff8e7] to-transparent">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {editing ? (
            <input
              type="number"
              min={1}
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-1.5 text-sm border border-[#efebe9] rounded-lg bg-white text-[#3e2723]"
            />
          ) : (
            <span className="stamp">Day {entry.day}</span>
          )}
          {editing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul"
              className="flex-1 px-3 py-1.5 text-base font-semibold border border-[#efebe9] rounded-lg bg-white text-[#3e2723]"
            />
          ) : (
            <h3 className="text-lg font-semibold text-[#3e2723] handwriting truncate">
              {entry.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="text-xs px-3 py-1.5 text-[#5d4037] hover:bg-[#efebe9] rounded-lg disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs px-4 py-1.5 btn-primary rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Simpan' : 'Simpan'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1.5 text-[#5d4037] hover:bg-[#efebe9] rounded-lg transition"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="px-6 py-4 border-b border-[#efebe9] bg-[#fff8e7]">
          <div className="flex items-center gap-3 flex-wrap">
            {entry.foto_url && !foto && (
              <div className="relative">
                <img
                  src={entry.foto_url}
                  alt="current"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-[#efebe9]"
                />
                <button
                  onClick={removeFoto}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-700 shadow"
                  type="button"
                >
                  &times;
                </button>
              </div>
            )}
            <label className="text-xs px-4 py-2.5 border-2 border-dashed border-[#8d6e63] rounded-xl cursor-pointer hover:bg-[#efebe9] text-[#5d4037] font-medium">
              {foto ? `Pilih: ${foto.name}` : '+ Ganti foto'}
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
        <div className="relative">
          <img
            src={entry.foto_url}
            alt={entry.title}
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-6">
        {editing ? (
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={6}
            placeholder="Ceritakan kegiatan hari ini..."
            className="w-full px-4 py-3 border border-[#efebe9] rounded-xl bg-white text-[#3e2723] paper-lines focus:ring-2 focus:ring-[#8d6e63] transition"
          />
        ) : (
          <p className="text-[#3e2723] whitespace-pre-wrap leading-relaxed">
            {entry.deskripsi}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#efebe9]">
          <p className="text-xs text-[#8d6e63]">
            &#128197; {new Date(entry.created_at).toLocaleString('id-ID')}
          </p>
        </div>
        {error && <p className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded-lg mt-3">{error}</p>}
      </div>
    </div>
  )
}