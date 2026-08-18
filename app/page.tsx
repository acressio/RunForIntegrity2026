import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage({
  searchParams,
}: {
  searchParams: { code?: string; token_hash?: string; type?: string };
}) {
  // Jaring pengaman: kalau link email mendarat di root (mis. Site URL
  // belum tepat), teruskan ke /auth/callback yang sekarang bisa membaca
  // jenis link (token_hash + type) secara eksplisit, bukan menebak.
  if (searchParams?.token_hash && searchParams?.type) {
    redirect(
      `/auth/callback?token_hash=${encodeURIComponent(searchParams.token_hash)}&type=${encodeURIComponent(searchParams.type)}`
    );
  }
  if (searchParams?.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(searchParams.code)}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard/input-activity" : "/login");
}
