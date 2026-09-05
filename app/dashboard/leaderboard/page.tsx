import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeaderboardTable from "@/components/LeaderboardTable";
import { formatKm, secondsToHMS, intervalToSeconds, paceToDisplay } from "@/lib/utils";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: me }, { data: rows }] = await Promise.all([
    supabase.from("leaderboard").select("*").eq("user_id", user.id).single(),
    supabase.from("leaderboard").select("*").order("rank", { ascending: true }).limit(500),
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

      <LeaderboardTable rows={rows ?? []} currentUserId={user.id} />
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
