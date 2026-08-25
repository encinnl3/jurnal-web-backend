'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile, JurnalEntry } from '@/lib/types'
import Link from 'next/link'
import JurnalForm from '@/components/JurnalForm'
import JurnalEntryCard from '@/components/JurnalEntryCard'

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [entries, setEntries] = useState<JurnalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: profileData }, { data: entryData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase
          .from('jurnal_entries')
          .select('*')
          .eq('profile_id', id)
          .order('day', { ascending: true }),
      ])

      setProfile(profileData)
      setEntries(entryData || [])
      setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel(`jurnal-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jurnal_entries',
          filter: `profile_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => {
              if (prev.find((e) => e.id === (payload.new as JurnalEntry).id)) return prev
              return [...prev, payload.new as JurnalEntry].sort((a, b) => a.day - b.day)
            })
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) =>
              prev.map((e) =>
                e.id === (payload.new as JurnalEntry).id ? (payload.new as JurnalEntry) : e
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((e) => e.id !== (payload.old as JurnalEntry).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const handleDelete = async (entryId: string) => {
    if (!confirm('Hapus entry ini?')) return
    await supabase.from('jurnal_entries').delete().eq('id', entryId)
  }

  const handleEntryChanged = (updated: JurnalEntry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) => a.day - b.day)
    )
  }

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-[#8b5e3c]">Loading</div>
    )
  }

  if (!profile) {
    return (
      <div className="px-6 py-10 max-w-md mx-auto text-center">
        <p className="text-[#8b5e3c] mb-4">Profile tidak ditemukan</p>
        <Link href="/" className="text-[#8b5e3c] hover:underline">
          Kembali ke daftar
    </Link>
    </div>
    )
  }

  return (
    <div className="min-h-full px-6 py-10 bg-[#f4eedd]">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-sm text-[#8b5e3c] hover:text-[#4a3c31] mb-4 inline-block"
        >
          ← Kembali
    </Link>

        <div className="bg-[#ebe1c9] border border-[#d3c9b0] rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#8b5e3c] flex items-center justify-center text-[#f4eedd] font-bold text-2xl">
              {profile.name.charAt(0).toUpperCase()}
          </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4a3c31]">
                {profile.name}
            </h1>
              <p className="text-sm text-[#8b5e3c]">
                Dibuat {new Date(profile.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
      </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#4a3c31]">
            Jurnal Harian ({entries.length})
        </h2>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-[#8b5e3c] text-[#f4eedd] px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            {showForm ? 'Tutup' : '+ Tambah Entry'}
        </button>
      </div>

        {showForm && (
          <JurnalForm
            profileId={id}
            onSuccess={() => setShowForm(false)}
          />
        )}

        {entries.length === 0 ? (
          <div className="bg-[#ebe1c9] border border-[#d3c9b0] border-dashed rounded-xl p-10 text-center">
            <p className="text-[#8b5e3c]">
              Belum ada jurnal entry. Tambah day 1 pertama.
          </p>
        </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JurnalEntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => handleDelete(entry.id)}
                onChanged={handleEntryChanged}
              />
            ))}
          </div>
        )}
    </div>
  </div>
  )
}
