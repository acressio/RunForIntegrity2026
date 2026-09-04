-- ============================================================
-- RACE CATEGORIES TAMBAHAN: "Si Paling Kompak"
-- Unit kerja dengan total jarak tempuh terjauh (agregat seluruh
-- anggotanya), dengan kemampuan drill-down ke tiap anggota.
-- Jalankan file ini SETELAH 001-005.
-- ============================================================

create or replace view public.race_unit_summary as
select
  p.unit_kerja,
  coalesce(sum(a.jarak_km), 0) as total_km,
  count(a.id) as total_entry,
  coalesce(sum(a.durasi), interval '0') as total_durasi,
  case
    when coalesce(sum(a.jarak_km), 0) > 0
    then extract(epoch from (sum(a.durasi) / sum(a.jarak_km)))
    else null
  end as avg_pace_seconds,
  count(distinct p.id) as member_count,
  count(distinct a.user_id) as active_member_count
from public.profiles p
left join public.activities a on a.user_id = p.id
group by p.unit_kerja;

-- Catatan:
-- - "member_count" = jumlah seluruh peserta terdaftar di unit itu
--   (termasuk yang belum pernah input aktivitas sama sekali).
-- - "active_member_count" = jumlah peserta di unit itu yang SUDAH
--   pernah input minimal satu aktivitas (dipakai sebagai keterangan
--   "X anggota aktif" di kartu Si Paling Kompak).
-- - Drill-down daftar anggota per unit TIDAK perlu view/query baru -
--   halaman Race Statistics cukup memfilter data yang sudah diambil
--   dari view "leaderboard" (sudah ada sejak 001_schema_VR_45.sql)
--   berdasarkan unit_kerja, murni di sisi frontend tanpa request
--   tambahan ke database saat baris unit diklik.
-- RLS: view ini otomatis ikut aturan RLS tabel aslinya, sama seperti
-- race_categories - tidak perlu policy tambahan.
