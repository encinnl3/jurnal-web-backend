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
  const [profile, setProfile] = useState<{name: string, avatar_url: string|null} | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await (supabase.from('profiles') as any)
        .select('name, avatar_url')
        .eq('id', id)
        .single()
      if (data) setProfile(data)
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-pattern">
      <div className="w-full max-w-md animate-in">
        <Link href="/" className="btn btn-ghost mb-8 text-sm text-fg-secondary">
          ← Kembali ke Beranda
        </Link>

        <div className="card p-10 text-center">
          <div className="avatar avatar-lg mx-auto mb-6 shadow-md">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" />
            ) : (
                profile?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <h1 className="text-3xl title-display mb-2">{profile?.name || '...'}</h1>
          <p className="text-fg-secondary mb-8">Masukkan password Anda</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="input"
              />
            </div>

            {error && <p className="message message-error">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Masuk...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
