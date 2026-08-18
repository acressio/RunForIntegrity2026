import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Satu route ini menangani KEDUA jenis link email: konfirmasi signup DAN
// reset password. Jenisnya (type) dikirim eksplisit oleh template email
// itu sendiri (lihat HTML template terbaru: pakai {{ .TokenHash }} dan
// {{ .SiteURL }} langsung, bukan {{ .ConfirmationURL }}), jadi tidak lagi
// bergantung pada mekanisme redirect_to Supabase yang sempat tidak
// konsisten meneruskan info jenis link.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code"); // fallback untuk link lama yang masih beredar

  const supabase = createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      const next = type === "recovery" ? "/reset-password" : "/dashboard/input-activity";
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard/input-activity`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_tidak_valid`);
}
