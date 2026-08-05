-- ============================================================
-- REVISI: target jarak, periode lomba, dan bukti aktivitas wajib
-- Jalankan file ini SETELAH 001_schema_VR_45.sql dan 002_tambahan.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1. Update target jarak & periode race window
--    (Tabel event_settings sudah terisi 1 baris dari 001, jadi
--    di sini kita UPDATE, bukan INSERT ulang.)
--    Catatan: perubahan ini juga bisa dilakukan langsung lewat
--    halaman Admin di web setelah admin login, tanpa perlu SQL.
-- ------------------------------------------------------------
update public.event_settings
set target_km = 50,
    race_start = '2026-08-17',
    race_end   = '2026-09-17'
where id = true;

-- ------------------------------------------------------------
-- 2. Bukti aktivitas (link Strava) sekarang wajib diisi di form,
--    jadi ditegakkan juga di level database.
--
--    PENTING: kalau sudah ada data lama dengan bukti_strava kosong,
--    perintah kedua di bawah akan GAGAL. Jalankan dulu query cek ini:
--
--      select id, user_id, tanggal_aktivitas from public.activities
--      where bukti_strava is null or bukti_strava = '';
--
--    Kalau ada hasilnya, isi manual dulu (update satu-satu, atau
--    hapus record tsb) sebelum menjalankan ALTER di bawah. Kalau
--    tabel masih kosong / semua sudah terisi, langsung jalankan saja.
-- ------------------------------------------------------------
alter table public.activities
  alter column bukti_strava set not null;
