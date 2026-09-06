import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminParticipantActivities from "@/components/AdminParticipantActivities";
import { formatKm, secondsToHMS, intervalToSeconds, paceToDisplay } from "@/lib/utils";

export default async function AdminParticipantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (myProfile?.role !== "admin" && myProfile?.role !== "admin_utama")
    redirect("/dashboard/input-activity");

  const [{ data: profile }, { data: leaderboardRow }, { data: activities }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, nama, email, unit_kerja, bib_number, role")
        .eq("id", params.id)
        .single(),
      supabase.from("leaderboard").select("*").eq("user_id", params.id).single(),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", params.id)
        .order("tanggal_aktivitas", { ascending: false })
        .order("waktu_mulai", { ascending: false }),
    ]);

  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-accent hover:underline"
        >
          ← Kembali ke Admin Panel
        </Link>
      </div>

      <div className="card-dark">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-light">
          Detail Peserta
        </p>
        <h1 className="mt-1 text-xl font-bold">{profile.nama}</h1>
        <p className="text-sm text-muted">
          BIB #{profile.bib_number} · {profile.unit_kerja} · {profile.email}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total KM" value={`${formatKm(leaderboardRow?.total_km ?? 0)} KM`} />
          <Stat label="Total Entry" value={String(leaderboardRow?.total_entry ?? 0)} />
          <Stat
            label="Durasi Total"
            value={secondsToHMS(intervalToSeconds(leaderboardRow?.total_durasi ?? null))}
          />
          <Stat label="Pace Avg" value={`${paceToDisplay(leaderboardRow?.avg_pace ?? null)} /km`} />
        </div>
      </div>

      <AdminParticipantActivities activities={activities ?? []} />
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
