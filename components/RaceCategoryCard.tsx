export type CategoryEntry = {
  userId: string;
  nama: string;
  unitKerja: string;
  value: string; // already formatted display value, e.g. "187,42 km"
};

const RANK_BADGE_CLASS = [
  "bg-rank-gold text-ink", // #1
  "bg-rank-silver text-ink", // #2
  "bg-rank-bronze text-ink", // #3
];

export default function RaceCategoryCard({
  iconSrc,
  title,
  metricLabel,
  entries,
}: {
  iconSrc: string;
  title: string;
  metricLabel: string;
  entries: CategoryEntry[];
}) {
  return (
    <div className="card-dark">
      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent/15 p-1.5">
          <img src={iconSrc} alt="" className="h-full w-full object-contain" />
        </div>
        <p className="text-[15px] font-extrabold">{title}</p>
      </div>
      <p className="mb-4 text-xs text-muted">{metricLabel}</p>

      {entries.length === 0 ? (
        <p className="rounded-xl2 border border-line bg-white/[0.02] px-4 py-6 text-center text-xs text-muted">
          Belum ada data untuk kategori ini.
        </p>
      ) : (
        <div className="flex flex-col">
          {entries.map((entry, i) => {
            const isFirst = i === 0;
            return (
              <div
                key={entry.userId}
                className={
                  isFirst
                    ? "mb-1.5 flex items-center justify-between gap-3 rounded-xl2 border border-rank-gold/35 bg-rank-gold/[0.08] px-3.5 py-3"
                    : "flex items-center justify-between gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      isFirst ? "h-[30px] w-[30px] text-sm" : "h-6 w-6"
                    } ${RANK_BADGE_CLASS[i]}`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`truncate font-bold ${isFirst ? "text-[15px]" : "text-[13px]"}`}
                    >
                      {entry.nama}
                    </p>
                    <p className="truncate text-[11px] text-muted">{entry.unitKerja}</p>
                  </div>
                </div>
                <div
                  className={`flex-shrink-0 whitespace-nowrap font-extrabold text-accent-light ${
                    isFirst ? "text-[17px]" : "text-[13px]"
                  }`}
                >
                  {entry.value}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
