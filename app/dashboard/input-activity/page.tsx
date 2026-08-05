import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RaceProgressCard from "@/components/RaceProgressCard";
import ActivityManager from "@/components/ActivityManager";

export default async function InputActivityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: settings }, { data: activities }, { data: leaderboardRow }] =
    await Promise.all([
      supabase.from("event_settings").select("*").single(),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("tanggal_aktivitas", { ascending: false })
        .order("waktu_mulai", { ascending: false }),
      supabase.from("leaderboard").select("total_km").eq("user_id", user.id).single(),
    ]);

  const targetKm = settings?.target_km ?? 50;
  const totalKm = leaderboardRow?.total_km ?? 0;

  return (
    <div>
      <RaceProgressCard
        totalKm={totalKm}
        targetKm={targetKm}
        raceStart={settings?.race_start ?? ""}
        raceEnd={settings?.race_end ?? ""}
      />

      <ActivityManager
        userId={user.id}
        activities={activities ?? []}
        raceStart={settings?.race_start ?? ""}
        raceEnd={settings?.race_end ?? ""}
      />
    </div>
  );
}
