import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileMenu from "@/components/ProfileMenu";
import NavTabs from "@/components/NavTabs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama, bib_number, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-ink">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-run-for-integrity.png"
              alt="Run For Integrity"
              className="h-16 w-16 rounded-lg object-contain"
            />
            <div>
              <p className="text-sm font-bold leading-tight">Dashboard Runner</p>
              <p className="text-xs text-muted leading-tight">DBI Virtual Run 2026</p>
            </div>
          </div>

          <ProfileMenu
            nama={profile?.nama ?? "Runner"}
            bibNumber={profile?.bib_number ?? 0}
          />
        </div>

        <NavTabs isAdmin={profile?.role === "admin" || profile?.role === "admin_utama"} />
      </header>

      <div className="flex-1 bg-white">
        <main className="mx-auto max-w-6xl px-6 py-8 text-ink">{children}</main>
      </div>
    </div>
  );
}
