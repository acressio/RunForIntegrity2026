import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Route ini khusus untuk konfirmasi signup (kalau nanti diaktifkan).
// Link "lupa password" pakai jalur terpisah: /auth/reset-callback.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard/input-activity`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link_tidak_valid`);
}
