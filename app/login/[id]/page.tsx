'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useSession } from '@/components/SessionProvider'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LoginPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { setSession } = useSession()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileName, setProfileName] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data } = await (supabase.from('profiles') as any)
        .select('name')
        .eq('id', id)
        .single()
      if (data) setProfileName(data.name)
    })()
  }, [id])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await (supabase.from('profiles') as any)
      .select('id, name, password')
      .eq('id', id)
      .single()

    setLoading(false)

    if (error || !data) {
      setError('Profil tidak ditemukan')
      return
    }

    if (data.password !== password) {
      setError('Password salah')
      return
    }

    setSession({ profileId: data.id, name: data.name })
    router.push(`/profile/${data.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-sm text-[#8b5e3c] hover:text-[#4a3c31] mb-6 inline-block"
        >
          ← Kembali
        </Link>

        <div className="diary-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8b5e3c] to-[#5d3f25] flex items-center justify-center text-[#f1e7d0] font-bold text-2xl shadow-md mx-auto mb-4">
              {profileName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h1 className="text-2xl font-bold text-[#4a3c31] handwriting">
              {profileName || 'Loading...'}
            </h1>
            <p className="text-sm text-[#8b5e3c] mt-1">
              Masukkan password untuk login
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-[#d3c9b0] rounded-xl bg-[#fbf6e9] text-[#4a3c31] focus:outline-none focus:ring-2 focus:ring-[#8b5e3c] placeholder:text-[#a89a85]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-700 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8b5e3c] text-[#f1e7d0] px-4 py-3 rounded-xl font-semibold hover:bg-[#5d3f25] transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-xs text-center text-[#8b5e3c] mt-6">
            Lupa password? Hubungi admin.
          </p>
        </div>
      </div>
    </div>
  )
}
