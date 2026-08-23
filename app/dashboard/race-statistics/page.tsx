import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RaceStatsHeader from "@/components/RaceStatsHeader";
import RaceCategoryCard, { type CategoryEntry } from "@/components/RaceCategoryCard";
import { formatKm, secondsToPaceDisplay } from "@/lib/utils";
import type { RaceCategoryRow } from "@/types/database";

const MIN_KM_FOR_NGACIR = 10;

function tsAsc(a: string | null, b: string | null): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return new Date(a).getTime() - new Date(b).getTime();
}

function toEntries(
  rows: RaceCategoryRow[],
  valueFormatter: (r: RaceCategoryRow) => string
): CategoryEntry[] {
  return rows.slice(0, 3).map((r) => ({
    userId: r.user_id,
    nama: r.nama,
    unitKerja: r.unit_kerja,
    value: valueFormatter(r),
  }));
}

export default async function RaceStatisticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: settings }, { data: rows }] = await Promise.all([
    supabase.from("event_settings").select("*").single(),
    supabase.from("race_categories").select("*"),
  ]);

  const targetKm = settings?.target_km ?? 50;
  const raceStart = settings?.race_start ?? "";
  const raceEnd = settings?.race_end ?? "";
  const allRows = rows ?? [];

  const totalParticipants = allRows.length;
  const finisherCount = allRows.filter((r) => r.total_km >= targetKm).length;

  // Si Paling Ultra - total jarak terjauh
  const ultra = [...allRows]
    .filter((r) => r.total_km > 0)
    .sort((a, b) => b.total_km - a.total_km || tsAsc(a.last_activity_at, b.last_activity_at));

  // Si Paling Ngacir - avg pace tercepat, minimal total 10 km
  const ngacir = [...allRows]
    .filter((r) => r.total_km >= MIN_KM_FOR_NGACIR && r.avg_pace_seconds !== null)
    .sort(
      (a, b) =>
        (a.avg_pace_seconds ?? 0) - (b.avg_pace_seconds ?? 0) ||
        tsAsc(a.last_activity_at, b.last_activity_at)
    );

  // Si Anak Gunung - total elevation gain tertinggi
  const anakGunung = [...allRows]
    .filter((r) => r.total_elevation > 0)
    .sort(
      (a, b) =>
        b.total_elevation - a.total_elevation || tsAsc(a.last_activity_at, b.last_activity_at)
    );

  // Si Paling Konsisten - rekor streak harian terpanjang, tiebreak: yang lebih dulu mencapai
  const konsisten = [...allRows]
    .filter((r) => r.max_streak > 0)
    .sort((a, b) => b.max_streak - a.max_streak || tsAsc(a.streak_end_date, b.streak_end_date));

  return (
    <div className="space-y-8">
      <RaceStatsHeader
        raceStart={raceStart}
        raceEnd={raceEnd}
        targetKm={targetKm}
        finisherCount={finisherCount}
        totalParticipants={totalParticipants}
      />

      <div>
        <h3 className="text-lg font-bold text-ink">Race Categories</h3>
        <p className="mb-5 text-sm text-gray-500">
          Hanya untuk seru-seruan ya, belum tentu dapat hadiah semua 😄
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <RaceCategoryCard
            iconSrc="/icon-ultra.png"
            title="Si Paling Ultra"
            metricLabel="Total jarak tempuh terjauh"
            entries={toEntries(ultra, (r) => `${formatKm(r.total_km)} km`)}
          />
          <RaceCategoryCard
            iconSrc="/icon-ngacir.png"
            title="Si Paling Ngacir"
            metricLabel={`Avg pace tercepat (min. total ${MIN_KM_FOR_NGACIR} km)`}
            entries={toEntries(ngacir, (r) => `${secondsToPaceDisplay(r.avg_pace_seconds)} /km`)}
          />
          <RaceCategoryCard
            iconSrc="/icon-gunung.png"
            title="Si Anak Gunung"
            metricLabel="Total elevation gain tertinggi"
            entries={toEntries(
              anakGunung,
              (r) => `${r.total_elevation.toLocaleString("id-ID")} m`
            )}
          />
          <RaceCategoryCard
            iconSrc="/icon-konsisten.png"
            title="Si Paling Konsisten"
            metricLabel="Rekor streak harian terpanjang"
            entries={toEntries(konsisten, (r) => `${r.max_streak} hari`)}
          />
        </div>
      </div>
    </div>
  );
}
