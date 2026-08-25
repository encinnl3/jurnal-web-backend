# Jurnal PKL

Website jurnal PKL dengan realtime update menggunakan Next.js dan Supabase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Konfigurasi Supabase:
   - Buat project di [Supabase](https://supabase.com)
   - Copy `.env.local` dan isi dengan URL dan key dari Supabase:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```
   - Jalankan SQL di `supabase/schema.sql` di SQL Editor Supabase

3. Jalankan development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Fitur

- ✅ CRUD Profile peserta PKL
- ✅ CRUD Jurnal entry per profile (day, title, foto, deskripsi)
- ✅ Edit inline realtime seperti WordPress
- ✅ Upload foto ke Supabase Storage
- ✅ Realtime updates dengan Supabase Realtime
- ✅ Dark mode support

## Struktur Database

### profiles
- id (uuid, primary key)
- name (text)
- created_at (timestamp)

### jurnal_entries
- id (uuid, primary key)
- profile_id (uuid, foreign key)
- day (int)
- title (text)
- foto_url (text, nullable)
- deskripsi (text)
- created_at (timestamp)
