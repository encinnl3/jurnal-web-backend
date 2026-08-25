'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function NewProfilePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Nama wajib diisi')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error } = await (supabase
      .from('profiles') as any)
      .insert({ name: name.trim() })
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push(`/profile/${data.id}`)
  }

  return (
    <div className="min-h-full px-6 py-10 bg-[#f4eedd]">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8b5e3c] hover:text-[#4a3c31] mb-4 inline-block"
        >
          ← Kembali
    </Link>

        <div className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#4a3c31] mb-1">
            Tambah Profile
        </h1>
          <p className="text-sm text-[#8b5e3c] mb-6">
            Buat profile peserta PKL baru
        </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4a3c31] mb-1">
                Nama
            </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Andi Saputra"
                className="w-full px-3 py-2 border border-[#d3c9b0] rounded-lg bg-[#f4eedd] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c]"
              />
          </div>

            {error && (
              <p className="text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8b5e3c] text-[#f4eedd] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  </div>
  )
}
