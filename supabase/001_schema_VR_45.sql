-- ============================================================
-- SCHEMA: Virtual Run Dashboard
-- Jalankan seluruh file ini di Supabase SQL Editor (satu kali)
-- ============================================================

-- ------------------------------------------------------------
-- 1. EVENT SETTINGS (target jarak, tanggal race window)
--    Tabel single-row supaya admin bisa ubah target tanpa redeploy
-- ------------------------------------------------------------
create table public.event_settings (
  id boolean primary key default true check (id),
  target_km numeric(6,2) not null default 45,
  race_start date not null,
  race_end date not null
);

insert into public.event_settings (target_km, race_start, race_end)
values (45, '2026-07-11', '2026-08-22');

-- ------------------------------------------------------------
-- 2. PROFILES (data peserta, 1 baris = 1 auth.users)
-- ------------------------------------------------------------
create sequence public.bib_seq start 1001;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nama text not null,
  email text not null,
  unit_kerja text not null,
  bib_number integer not null unique default nextval('public.bib_seq'),
  role text not null default 'peserta' check (role in ('peserta', 'admin')),
  foto_profil text,
  created_at timestamptz not null default now()
);

-- Auto-create profile setiap kali ada user baru sign up.
-- nama & unit_kerja diambil dari metadata yang dikirim saat signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama, email, unit_kerja)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'unit_kerja', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 3. ACTIVITIES (record lari peserta)
--    waktu_selesai & pace dihitung otomatis oleh database
-- ------------------------------------------------------------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tanggal_aktivitas date not null,
  waktu_mulai time not null,
  jarak_km numeric(6, 2) not null check (jarak_km > 0),
  durasi interval not null check (durasi > interval '0'),
  waktu_selesai time generated always as (waktu_mulai + durasi) stored,
  pace interval generated always as (durasi / jarak_km) stored,
  heart_rate integer check (heart_rate is null or heart_rate between 30 and 250),
  elevation_gain numeric(6, 1),
  bukti_strava text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_user_id_idx on public.activities (user_id);
create index activities_tanggal_idx on public.activities (tanggal_aktivitas);

-- auto-update updated_at setiap kali record diedit
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute procedure public.set_updated_at();

-- ------------------------------------------------------------
-- 4. HELPER: cek apakah user saat ini admin
--    (security definer supaya tidak kena rekursi RLS)
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 5. VIEW: leaderboard (agregasi otomatis per peserta)
--    Diurutkan berdasarkan total jarak (rank)
-- ------------------------------------------------------------
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.nama,
  p.unit_kerja,
  p.bib_number,
  coalesce(sum(a.jarak_km), 0) as total_km,
  count(a.id) as total_entry,
  coalesce(sum(a.durasi), interval '0') as total_durasi,
  case
    when coalesce(sum(a.jarak_km), 0) > 0
    then sum(a.durasi) / sum(a.jarak_km)
    else null
  end as avg_pace,
  rank() over (order by coalesce(sum(a.jarak_km), 0) desc) as rank
from public.profiles p
left join public.activities a on a.user_id = p.id
group by p.id, p.nama, p.unit_kerja, p.bib_number;

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.event_settings enable row level security;

-- PROFILES: semua user login boleh baca (dibutuhkan utk leaderboard/nama)
create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- PROFILES: user hanya boleh update profil sendiri; admin boleh semua
create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- PROFILES: hanya admin yang boleh hapus
create policy "profiles_delete_admin_only"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ACTIVITIES: semua user login boleh baca (dibutuhkan utk leaderboard)
create policy "activities_select_all_authenticated"
  on public.activities for select
  to authenticated
  using (true);

-- ACTIVITIES: user hanya boleh insert utk dirinya sendiri
create policy "activities_insert_own"
  on public.activities for insert
  to authenticated
  with check (user_id = auth.uid());

-- ACTIVITIES: user hanya boleh update/hapus data sendiri; admin boleh semua
create policy "activities_update_own_or_admin"
  on public.activities for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "activities_delete_own_or_admin"
  on public.activities for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- EVENT_SETTINGS: semua boleh baca, hanya admin boleh ubah
create policy "event_settings_select_all"
  on public.event_settings for select
  to authenticated
  using (true);

create policy "event_settings_update_admin_only"
  on public.event_settings for update
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 7. CARA MEMBUAT AKUN ADMIN PERTAMA
--    Jalankan setelah akun tsb sign up normal lewat web:
-- ------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'admin@contoh.go.id';
