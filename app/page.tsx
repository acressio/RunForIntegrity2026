import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage({
  searchParams,
}: {
  searchParams: { code?: string; type?: string };
}) {
  // Jaring pengaman: kalau link email Supabase (reset password / konfirmasi)
  // mendarat di root karena Redirect URL belum pas dikonfigurasi, teruskan
  // "code"-nya ke /auth/callback supaya tetap diproses, bukan hilang begitu saja.
  if (searchParams?.code) {
    const params = new URLSearchParams();
    params.set("code", searchParams.code);
    if (searchParams.type) params.set("type", searchParams.type);
    redirect(`/auth/callback?${params.toString()}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard/input-activity" : "/login");
}
