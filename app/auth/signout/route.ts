import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * POST only. A GET would let any <img src="/auth/signout"> on the internet
 * sign a couple out, which is a silly thing to leave lying around.
 *
 * Signing out only forgets the shortcut — every wedding is still reachable
 * through its edit link.
 */
export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
