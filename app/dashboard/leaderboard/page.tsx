import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatKm, secondsToHMS, intervalToSeconds, paceToDisplay } from "@/lib/utils";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: me }, { data: rows }] = await Promise.all([
    supabase.from("leaderboard").select("*").eq("user_id", user.id).single(),
    supabase.from("leaderboard").select("*").order("rank", { ascending: true }).limit(200),
  ]);

  return (
    <div>
      <div className="card-dark">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">
          Ringkasan Anda
        </p>
        <h2 className="mt-1 text-xl font-bold">{me?.nama ?? "-"}</h2>
        <p className="mt-0.5 text-sm text-muted">
          Rank saat ini: <span className="font-semibold text-white">#{me?.rank ?? "-"}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total KM" value={`${formatKm(me?.total_km ?? 0)} KM`} />
          <Stat label="Total Entry" value={String(me?.total_entry ?? 0)} />
          <Stat
            label="Durasi Total"
            value={secondsToHMS(intervalToSeconds(me?.total_durasi ?? null))}
          />
          <Stat label="Pace Avg" value={`${paceToDisplay(me?.avg_pace ?? null)} /km`} />
        </div>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <h3 className="mb-4 text-lg font-bold">Leaderboard</h3>
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-panel2">
              <th className="table-head px-3 py-3">Rank</th>
              <th className="table-head px-3 py-3">Nama</th>
              <th className="table-head px-3 py-3 text-right">Total KM</th>
              <th className="table-head px-3 py-3 text-right">Total Entry</th>
              <th className="table-head px-3 py-3 text-right">Durasi Total</th>
              <th className="table-head px-3 py-3 text-right">Pace Avg</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr
                key={r.user_id}
                className={`border-b border-line/60 text-sm ${
                  r.user_id === user.id ? "bg-accent/10" : ""
                }`}
              >
                <td className="px-3 py-3 font-semibold">{r.rank}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{r.nama}</p>
                  <p className="text-xs text-muted">{r.unit_kerja}</p>
                </td>
                <td className="px-3 py-3 text-right font-semibold text-accent-light">
                  {formatKm(r.total_km)} KM
                </td>
                <td className="px-3 py-3 text-right text-muted">{r.total_entry}</td>
                <td className="px-3 py-3 text-right text-muted">
                  {secondsToHMS(intervalToSeconds(r.total_durasi))}
                </td>
                <td className="px-3 py-3 text-right text-muted">
                  {paceToDisplay(r.avg_pace)} /km
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
