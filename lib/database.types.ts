export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      jurnal_entries: {
        Row: {
          id: string
          profile_id: string
          day: number
          title: string
          foto_url: string | null
          deskripsi: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          day: number
          title: string
          foto_url?: string | null
          deskripsi: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          day?: number
          title?: string
          foto_url?: string | null
          deskripsi?: string
          created_at?: string
        }
      }
    }
  }
}
