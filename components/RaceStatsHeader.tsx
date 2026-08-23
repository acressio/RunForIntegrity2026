import { formatKm } from "@/lib/utils";

export default function RaceStatsHeader({
  raceStart,
  raceEnd,
  targetKm,
  finisherCount,
  totalParticipants,
}: {
  raceStart: string;
  raceEnd: string;
  targetKm: number;
  finisherCount: number;
  totalParticipants: number;
}) {
  const start = new Date(raceStart + "T00:00:00");
  const end = new Date(raceEnd + "T23:59:59");
  const today = new Date();

  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const elapsedDaysRaw = Math.round((today.getTime() - start.getTime()) / 86400000);
  const elapsedDays = Math.min(totalDays, Math.max(0, elapsedDaysRaw));
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const timePct = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

  const finisherPct =
    totalParticipants > 0 ? Math.min(100, (finisherCount / totalParticipants) * 100) : 0;

  return (
    <div className="card-dark">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">
        Race Statistics
      </p>
      <h2 className="mt-1 text-xl font-bold">Waktu Race</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl2 border border-line bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Hari Berjalan</p>
          <p className="mt-1.5 text-2xl font-extrabold">
            {elapsedDays}
            <span className="ml-1 text-sm font-semibold text-muted">/ {totalDays} hari</span>
          </p>
        </div>
        <div className="rounded-xl2 border border-line bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Sisa Waktu</p>
          <p className="mt-1.5 text-2xl font-extrabold text-accent-light">{remainingDays} hari</p>
        </div>
        <div className="rounded-xl2 border border-line bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Race Berakhir</p>
          <p className="mt-1.5 text-lg font-extrabold">
            {end.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-panel2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-dark via-accent to-accent-light"
          style={{ width: `${timePct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>
          {start.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}{" "}
          (mulai)
        </span>
        <span>{timePct.toFixed(1).replace(".", ",")}% waktu telah berjalan</span>
        <span>
          {end.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}{" "}
          (selesai)
        </span>
      </div>

      <div className="my-6 h-px bg-line" />

      <div className="mb-2.5 flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">Peserta Finish</p>
        <p className="text-xl font-extrabold">
          {finisherCount}
          <span className="ml-1 text-sm font-semibold text-muted">
            / {totalParticipants} peserta
          </span>
        </p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-300"
          style={{ width: `${finisherPct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>0 peserta</span>
        <span>
          {finisherPct.toFixed(1).replace(".", ",")}% sudah finish (&ge; {formatKm(targetKm, 0)} km)
        </span>
        <span>{totalParticipants} peserta</span>
      </div>
    </div>
  );
}
