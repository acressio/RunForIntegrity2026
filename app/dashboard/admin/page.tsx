import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminEventSettings from "@/components/AdminEventSettings";
import AdminParticipants from "@/components/AdminParticipants";
import AdminActivities from "@/components/AdminActivities";

export default async function AdminPage() {
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

  if (myProfile?.role !== "admin") redirect("/dashboard/input-activity");

  const [{ data: settings }, { data: profiles }, { data: leaderboard }, { data: activities }] =
    await Promise.all([
      supabase.from("event_settings").select("*").single(),
      supabase
        .from("profiles")
        .select("id, nama, email, unit_kerja, bib_number, role")
        .order("bib_number", { ascending: true }),
      supabase.from("leaderboard").select("user_id, total_km"),
      supabase
        .from("activities")
        .select("id, tanggal_aktivitas, jarak_km, durasi, pace, bukti_strava, profiles(nama, bib_number)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const kmByUser = new Map((leaderboard ?? []).map((l) => [l.user_id, l.total_km]));
  const participantRows = (profiles ?? []).map((p) => ({
    ...p,
    total_km: kmByUser.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Admin Panel</h1>
        <p className="text-sm text-gray-500">
          Kelola pengaturan event, peserta, dan moderasi aktivitas.
        </p>
      </div>

      {settings && <AdminEventSettings settings={settings} />}

      <AdminParticipants rows={participantRows} />

      <AdminActivities rows={(activities as any) ?? []} />
    </div>
  );
}
