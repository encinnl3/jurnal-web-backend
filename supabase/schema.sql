-- profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- jurnal entries
create table if not exists public.jurnal_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day int not null,
  title text not null,
  foto_url text,
  deskripsi text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.jurnal_entries enable row level security;

create policy "Allow all profiles"
  on public.profiles for all
  using (true) with check (true);

create policy "Allow all jurnal_entries"
  on public.jurnal_entries for all
  using (true) with check (true);

-- storage bucket: jurnal-foto
insert into storage.buckets (id, name, public)
values ('jurnal-foto', 'jurnal-foto', true)
on conflict (id) do nothing;

create policy "Public read jurnal-foto"
  on storage.objects for select
  using (bucket_id = 'jurnal-foto');

create policy "Public upload jurnal-foto"
  on storage.objects for insert
  with check (bucket_id = 'jurnal-foto');
