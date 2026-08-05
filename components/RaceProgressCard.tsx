import { formatKm } from "@/lib/utils";

const MILESTONES_KM = [15, 35, 50];

export default function RaceProgressCard({
  totalKm,
  targetKm,
  raceStart,
  raceEnd,
}: {
  totalKm: number;
  targetKm: number;
  raceStart: string;
  raceEnd: string;
}) {
  const pct = targetKm > 0 ? Math.min(100, (totalKm / targetKm) * 100) : 0;
  const remainingKm = Math.max(0, targetKm - totalKm);

  const today = new Date();
  const end = new Date(raceEnd + "T23:59:59");
  const daysLeft = Math.max(
    0,
    Math.ceil((end.getTime() - today.getTime()) / 86400000)
  );
  const targetPerDay = daysLeft > 0 ? remainingKm / daysLeft : remainingKm;

  const milestones = MILESTONES_KM.map((km) => ({
    km,
    fraction: targetKm > 0 ? Math.min(100, (km / targetKm) * 100) : 0,
    reached: totalKm >= km,
  }));

  return (
    <div className="card-dark">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">
            Ringkasan Aktivitas
          </p>
          <h2 className="mt-1 text-xl font-bold">Progress Kamu</h2>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black leading-none text-accent-light drop-shadow-[0_0_18px_rgba(224,51,47,0.45)]">
            {pct.toFixed(1).replace(".", ",")}%
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatKm(totalKm)} dari {formatKm(targetKm, 0)} km
          </p>
        </div>
      </div>

      {/* Spotlight progress bar */}
      <div className="mt-8">
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-panel2 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-dark via-accent to-accent-light shadow-[0_0_16px_rgba(255,91,82,0.6)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Milestones sit on their own track, connected by a line, aligned to the bar above */}
        <div className="relative mt-5 h-14">
          <div className="absolute left-0 right-0 top-3 h-0.5 bg-line" />
          {milestones.map((m) => (
            <div
              key={m.km}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${m.fraction}%` }}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                  m.reached
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                    : "border-line bg-panel2 text-muted"
                }`}
              >
                {m.reached ? "✓" : ""}
              </div>
              <p className="mt-1.5 whitespace-nowrap text-xs font-semibold">
                {m.km} km
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl2 border border-line bg-panel/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Sisa ke Finish</p>
          <p className="mt-1 text-2xl font-bold text-accent-light">
            {formatKm(remainingKm)} km
          </p>
          <p className="text-xs text-muted">menuju total {formatKm(targetKm, 0)} km</p>
        </div>

        <div className="rounded-xl2 border border-line bg-panel/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Target Harian</p>
          <p className="mt-1 text-2xl font-bold">
            {formatKm(targetPerDay)} km / hari
          </p>
          <p className="text-xs text-muted">
            {formatKm(remainingKm)} km dalam {daysLeft} hari tersisa
          </p>
        </div>
      </div>
    </div>
  );
}
