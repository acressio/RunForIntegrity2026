import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Route khusus untuk link "lupa password". Dipisah dari /auth/callback biar
// tidak bergantung pada query param (mis. ?type=recovery) yang ternyata
// tidak selalu diteruskan konsisten oleh Supabase saat membangun link akhir.
// Jalur ini SELALU mengarah ke /reset-password, tidak pernah ke dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=link_tidak_valid`);
}
