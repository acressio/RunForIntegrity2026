-- ============================================================
-- TAMBAHAN dari schema_VR_45.sql
-- Jalankan file ini SETELAH schema_VR_45.sql di Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Izin admin untuk insert aktivitas atas nama peserta lain
--    (berguna kalau admin perlu input manual dari laporan offline)
-- ------------------------------------------------------------
create policy "activities_insert_admin"
  on public.activities for insert
  to authenticated
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 2. (Opsional tapi disarankan) validasi tanggal aktivitas ada
--    di dalam race window, dicek di level database sbg jaring
--    pengaman kedua selain validasi di form.
-- ------------------------------------------------------------
create or replace function public.validate_activity_date()
returns trigger
language plpgsql
as $$
declare
  v_start date;
  v_end date;
begin
  select race_start, race_end into v_start, v_end from public.event_settings limit 1;
  if new.tanggal_aktivitas < v_start or new.tanggal_aktivitas > v_end then
    raise exception 'Tanggal aktivitas harus di antara % dan %', v_start, v_end;
  end if;
  return new;
end;
$$;

create trigger activities_validate_date
  before insert or update on public.activities
  for each row execute procedure public.validate_activity_date();
