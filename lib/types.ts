export type Profile = {
  id: string
  name: string
  password: string
  avatar_url: string | null
  created_at: string
}

export type JurnalEntry = {
  id: string
  profile_id: string
  day: number
  title: string
  foto_url: string | null
  deskripsi: string
  created_at: string
}
