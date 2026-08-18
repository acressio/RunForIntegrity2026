-- ============================================================
-- BATASI PENDAFTARAN HANYA UNTUK EMAIL @bpkp.go.id
-- Jalankan file ini SETELAH 001, 002, 003.
-- ============================================================

-- Ini penegakan level DATABASE - lapisan paling kuat, tidak bisa
-- diakali walau seseorang memanggil API Supabase langsung tanpa
-- lewat form website kita. Kalau email tidak berdomain @bpkp.go.id,
-- SELURUH proses sign up (termasuk pembuatan akun di auth.users)
-- akan gagal dan dibatalkan otomatis.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or lower(new.email) not like '%@bpkp.go.id' then
    raise exception 'Pendaftaran hanya untuk email dengan domain @bpkp.go.id';
  end if;

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

-- Catatan: perintah di atas cukup CREATE OR REPLACE saja (fungsi lama
-- yang sudah dipakai trigger "on_auth_user_created" langsung tertimpa
-- isinya), tidak perlu drop/buat ulang trigger-nya.
