import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  // Link "lupa password" diarahkan ke /reset-password.
  // Link konfirmasi signup (kalau nanti diaktifkan) diarahkan ke dashboard.
  const next = type === "recovery" ? "/reset-password" : "/dashboard/input-activity";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_tidak_valid`);
}
