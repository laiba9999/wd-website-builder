import { db } from "@/lib/db";

// Hit every 3 days by .github/workflows/keepalive.yml so Supabase never
// pauses the free project for inactivity.
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await db.from("weddings").select("id").limit(1);
  return Response.json({ ok: !error }, { status: error ? 500 : 200 });
}
