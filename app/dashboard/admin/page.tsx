import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminEventSettings from "@/components/AdminEventSettings";
import AdminParticipants from "@/components/AdminParticipants";
import AdminActivities from "@/components/AdminActivities";
import AdminAuditLog from "@/components/AdminAuditLog";

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

  const myRole = myProfile?.role;
  if (myRole !== "admin" && myRole !== "admin_utama") redirect("/dashboard/input-activity");

  const isAdminUtama = myRole === "admin_utama";

  const [{ data: settings }, { data: profiles }, { data: leaderboard }, { data: activities }, auditLogResult] =
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
      isAdminUtama
        ? supabase
            .from("admin_audit_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: null }),
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
          {isAdminUtama
            ? "Kelola pengaturan event, peserta, admin, dan moderasi aktivitas."
            : "Kelola peserta dan moderasi aktivitas."}
        </p>
      </div>

      {isAdminUtama && settings && <AdminEventSettings settings={settings} />}

      <AdminParticipants rows={participantRows} isAdminUtama={isAdminUtama} currentUserId={user.id} />

      <AdminActivities rows={(activities as any) ?? []} />

      {isAdminUtama && <AdminAuditLog rows={auditLogResult.data ?? []} />}
    </div>
  );
}
