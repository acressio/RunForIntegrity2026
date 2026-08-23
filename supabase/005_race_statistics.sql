-- ============================================================
-- RACE STATISTICS: view untuk halaman "Race Statistics"
-- (waktu race, peserta finish, dan 4 kategori: Ultra/Ngacir/
-- Anak Gunung/Konsisten)
-- Jalankan file ini SETELAH 001, 002, 003, 004.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Hitung "rekor streak harian terpanjang" per peserta.
--    Teknik "islands and gaps": kelompokkan tanggal aktivitas
--    yang berurutan jadi satu grup, lalu ambil grup terpanjang
--    per peserta. Kalau peserta punya beberapa streak dengan
--    panjang sama, ambil yang paling awal tercapai (streak_end
--    paling kecil) - konsisten dengan aturan "yang pertama
--    mencapai" yang dipakai di semua kategori.
-- ------------------------------------------------------------
create or replace view public.race_streaks as
with distinct_days as (
  select distinct user_id, tanggal_aktivitas
  from public.activities
),
grouped as (
  select
    user_id,
    tanggal_aktivitas,
    tanggal_aktivitas
      - (row_number() over (partition by user_id order by tanggal_aktivitas))::int
        * interval '1 day' as grp
  from distinct_days
),
streaks as (
  select
    user_id,
    grp,
    count(*) as streak_length,
    max(tanggal_aktivitas) as streak_end
  from grouped
  group by user_id, grp
)
select distinct on (user_id)
  user_id,
  streak_length,
  streak_end
from streaks
order by user_id, streak_length desc, streak_end asc;

-- ------------------------------------------------------------
-- 2. View utama: gabungan semua metrik per peserta yang
--    dibutuhkan halaman Race Statistics.
--    - total_km, total_elevation: sederhana, SUM per peserta.
--    - avg_pace_seconds: total durasi / total jarak (dalam detik),
--      angka lebih kecil = lebih cepat.
--    - max_streak, streak_end_date: dari view race_streaks.
--    - last_activity_at: dipakai FE sebagai tiebreak "yang lebih
--      dulu mencapai" untuk kategori Ultra/Ngacir/Anak Gunung
--      (streak pakai streak_end_date sendiri, bukan ini).
-- ------------------------------------------------------------
create or replace view public.race_categories as
select
  p.id as user_id,
  p.nama,
  p.unit_kerja,
  p.bib_number,
  coalesce(sum(a.jarak_km), 0) as total_km,
  case
    when coalesce(sum(a.jarak_km), 0) > 0
    then extract(epoch from (sum(a.durasi) / sum(a.jarak_km)))
    else null
  end as avg_pace_seconds,
  coalesce(sum(a.elevation_gain), 0) as total_elevation,
  coalesce(rs.streak_length, 0) as max_streak,
  rs.streak_end as streak_end_date,
  max(a.created_at) as last_activity_at
from public.profiles p
left join public.activities a on a.user_id = p.id
left join public.race_streaks rs on rs.user_id = p.id
group by p.id, p.nama, p.unit_kerja, p.bib_number, rs.streak_length, rs.streak_end;

-- Catatan RLS: view ini otomatis ikut aturan RLS tabel aslinya
-- (profiles & activities sudah "select all authenticated" sejak
-- 001_schema_VR_45.sql), jadi tidak perlu policy tambahan.
