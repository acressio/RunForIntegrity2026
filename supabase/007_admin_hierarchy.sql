-- ============================================================
-- SISTEM ADMIN UTAMA & ADMIN BIASA + LOG AKTIVITAS ADMIN
-- Jalankan file ini SETELAH 001-006.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Perluas kolom "role" jadi 3 tingkat:
--    peserta -> admin (biasa) -> admin_utama
-- ------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('peserta', 'admin', 'admin_utama'));

-- ------------------------------------------------------------
-- 2. Fungsi bantu: cek Admin Utama (terpisah dari is_admin()
--    yang sudah ada sejak 001, yang tetap berarti "admin ATAU
--    admin_utama" - Admin Utama otomatis mewarisi hak Admin Biasa).
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
    where id = auth.uid() and role in ('admin', 'admin_utama')
  );
$$;

create or replace function public.is_admin_utama()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin_utama'
  );
$$;

-- ------------------------------------------------------------
-- 3. Tabel log aktivitas admin - write-once, tidak ada policy
--    UPDATE/DELETE sama sekali (termasuk untuk admin_utama),
--    supaya tidak bisa diakali/dihapus lewat jalur manapun di
--    aplikasi. Diisi otomatis lewat trigger, bukan oleh kode FE.
-- ------------------------------------------------------------
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_nama text not null,
  aksi text not null check (aksi in (
    'hapus_aktivitas', 'hapus_peserta', 'ubah_role', 'ubah_pengaturan_event'
  )),
  detail text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy "audit_log_select_admin_utama_only"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin_utama());

-- Sengaja TIDAK ADA policy insert/update/delete untuk role authenticated -
-- baris hanya bisa masuk lewat fungsi trigger (security definer) di bawah,
-- tidak bisa diinsert manual dari aplikasi/API.

create or replace function public.write_audit_log(
  p_aksi text,
  p_detail text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nama text;
begin
  select nama into v_nama from public.profiles where id = auth.uid();
  insert into public.admin_audit_log (actor_id, actor_nama, aksi, detail)
  values (auth.uid(), coalesce(v_nama, 'Tidak diketahui'), p_aksi, p_detail);
end;
$$;

-- ------------------------------------------------------------
-- 4. Trigger: catat log setiap kali aktivitas dihapus oleh ADMIN
--    (bukan oleh peserta yang hapus punya sendiri).
-- ------------------------------------------------------------
create or replace function public.log_delete_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_nama text;
begin
  if auth.uid() is distinct from old.user_id then
    select nama into v_target_nama from public.profiles where id = old.user_id;
    perform public.write_audit_log(
      'hapus_aktivitas',
      format(
        'Menghapus aktivitas %s km tanggal %s milik %s',
        old.jarak_km, old.tanggal_aktivitas, coalesce(v_target_nama, 'peserta tidak dikenal')
      )
    );
  end if;
  return old;
end;
$$;

create trigger activities_log_delete
  before delete on public.activities
  for each row execute procedure public.log_delete_activity();

-- ------------------------------------------------------------
-- 5. Trigger: catat log setiap kali akun peserta dihapus.
-- ------------------------------------------------------------
create or replace function public.log_delete_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.write_audit_log(
    'hapus_peserta',
    format('Menghapus akun peserta %s (BIB #%s)', old.nama, old.bib_number)
  );
  return old;
end;
$$;

create trigger profiles_log_delete
  before delete on public.profiles
  for each row execute procedure public.log_delete_profile();

-- ------------------------------------------------------------
-- 6. Trigger: catat log + safeguard setiap kali "role" berubah.
--    - Hanya Admin Utama yang boleh mengubah role siapa pun.
--    - Tidak boleh sampai jumlah admin_utama jadi nol.
-- ------------------------------------------------------------
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sisa_admin_utama int;
begin
  if new.role is distinct from old.role then
    if not public.is_admin_utama() then
      raise exception 'Hanya Admin Utama yang dapat mengubah status admin.';
    end if;

    if old.role = 'admin_utama' and new.role <> 'admin_utama' then
      select count(*) into v_sisa_admin_utama
      from public.profiles
      where role = 'admin_utama' and id <> old.id;

      if v_sisa_admin_utama = 0 then
        raise exception 'Tidak dapat mencabut status ini - minimal harus ada 1 Admin Utama.';
      end if;
    end if;

    perform public.write_audit_log(
      'ubah_role',
      format('Mengubah role %s dari "%s" menjadi "%s"', new.nama, old.role, new.role)
    );
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute procedure public.guard_role_change();

-- Safeguard tambahan: tolak juga kalau Admin Utama terakhir dihapus akunnya.
create or replace function public.guard_delete_admin_utama()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sisa_admin_utama int;
begin
  if old.role = 'admin_utama' then
    select count(*) into v_sisa_admin_utama
    from public.profiles
    where role = 'admin_utama' and id <> old.id;

    if v_sisa_admin_utama = 0 then
      raise exception 'Tidak dapat menghapus akun ini - minimal harus ada 1 Admin Utama.';
    end if;
  end if;
  return old;
end;
$$;

create trigger profiles_guard_delete_admin_utama
  before delete on public.profiles
  for each row execute procedure public.guard_delete_admin_utama();

-- ------------------------------------------------------------
-- 7. Trigger: catat log setiap kali pengaturan event diubah.
-- ------------------------------------------------------------
create or replace function public.log_update_event_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.write_audit_log(
    'ubah_pengaturan_event',
    format(
      'Target: %s km -> %s km | Periode: %s s/d %s -> %s s/d %s',
      old.target_km, new.target_km,
      old.race_start, old.race_end, new.race_start, new.race_end
    )
  );
  return new;
end;
$$;

create trigger event_settings_log_update
  after update on public.event_settings
  for each row execute procedure public.log_update_event_settings();

-- ------------------------------------------------------------
-- 8. Perketat policy event_settings: khusus Admin Utama boleh ubah
--    (sebelumnya di 001_schema_VR_45.sql, semua admin boleh).
-- ------------------------------------------------------------
drop policy if exists "event_settings_update_admin_only" on public.event_settings;

create policy "event_settings_update_admin_utama_only"
  on public.event_settings for update
  to authenticated
  using (public.is_admin_utama());

-- Catatan: policy activities & profiles untuk delete/update yang sudah ada
-- sejak 001_schema_VR_45.sql TIDAK PERLU diubah - keduanya sudah pakai
-- is_admin(), yang sekarang otomatis mencakup admin_utama juga. Sesuai
-- keputusan: hapus aktivitas & hapus peserta tetap boleh Admin Biasa.

-- ------------------------------------------------------------
-- 9. WAJIB DIJALANKAN SEKALI: naikkan akun admin lama Anda jadi
--    Admin Utama pertama. Tanpa ini, tidak ada satu pun Admin
--    Utama di sistem setelah migrasi ini.
--    Ganti email di bawah dengan email admin Anda saat ini.
-- ------------------------------------------------------------
-- update public.profiles set role = 'admin_utama' where email = 'admin@bpkp.go.id';
