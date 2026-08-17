import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  // Jaring pengaman: kalau link email Supabase (reset password / konfirmasi)
  // mendarat di root karena Redirect URL belum pas dikonfigurasi, teruskan
  // "code"-nya ke /auth/reset-callback (bukan /auth/callback) supaya paling
  // aman: user diminta set password baru dulu, bukan langsung masuk dashboard.
  if (searchParams?.code) {
    redirect(`/auth/reset-callback?code=${encodeURIComponent(searchParams.code)}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard/input-activity" : "/login");
}
