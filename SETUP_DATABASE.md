# Setup Database Supabase

Buka SQL Editor: https://supabase.com/dashboard/project/knucpekhuydnlauduipk/sql/new

Copy semua isi block di bawah ini lalu klik **Run**:

```sql
drop table if exists public.jurnal_entries; drop table if exists public.profiles; create table if not exists public.profiles (id uuid primary key default gen_random_uuid(), name text not null, password text not null default '', avatar_url text, created_at timestamptz not null default now()); create table if not exists public.jurnal_entries (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, day int not null, title text not null, foto_url text, deskripsi text not null, created_at timestamptz not null default now()); alter table public.profiles enable row level security; alter table public.jurnal_entries enable row level security; create policy "Allow all profiles" on public.profiles for all using (true) with check (true); create policy "Allow all jurnal_entries" on public.jurnal_entries for all using (true) with check (true); alter publication supabase_realtime add table public.profiles; alter publication supabase_realtime add table public.jurnal_entries; insert into storage.buckets (id, name, public) values ('jurnal-foto', 'jurnal-foto', true) on conflict (id) do nothing; insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing; insert into public.profiles (name, password) values ('Farhan', 'farhan123'), ('Akmal', 'akmal123'), ('Janandra', 'janandra123') on conflict do nothing;
```

## Password Default

- **Farhan**: `farhan123`
- **Akmal**: `akmal123`
- **Janandra**: `janandra123`

## Alur Aplikasi

1. **Landing Page**: Hero section besar "Jurnal PKL" + 3 kartu profil bulat
2. **Visitor Page**: Klik profil → lihat jurnal harian
3. **Mode Admin**: Klik tombol Admin → masukkan password → dashboard admin
4. **Dashboard Admin**: Statistik, pengaturan avatar/password, CRUD jurnal
5. **Keluar**: Kembali ke visitor mode

## Design System

- **Font**: Playfair Display (serif) untuk headings, Inter untuk body
- **Warna**: Mocha/Cream - Tanah - Bukan biru/ungu
- **Style**: Editorial minimal dengan border-radius besar (40px)
- **Efek**: Hover lift, blur backdrop, shadow halus
