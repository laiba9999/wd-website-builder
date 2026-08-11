import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Where the emailed magic link lands. Swaps the one-time code for a session
 * cookie, then sends the couple to their dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets a link deep-link somewhere other than the dashboard later.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Only ever redirect within this site — never to an attacker-supplied
      // absolute URL that arrived in the query string.
      const target = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  // Expired, already used, or missing. /login explains and offers a fresh one.
  return NextResponse.redirect(`${origin}/login?error=link`);
}
