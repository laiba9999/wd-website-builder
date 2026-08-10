import { db, getWeddingByToken } from "@/lib/db";
import { rsvpsToCsv } from "@/lib/csv";
import { slugify } from "@/lib/slug";

/** Downloads every reply as a CSV — the couple opens it in Excel or Sheets. */
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const wedding = await getWeddingByToken(token);
  if (!wedding) return new Response("Not found", { status: 404 });

  const { data } = await db
    .from("rsvps").select("*").eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });

  const csv = rsvpsToCsv(
    (data ?? []).map((r) => ({
      id: r.id, guestName: r.guest_name, email: r.email, attending: r.attending,
      partySize: r.party_size, dietary: r.dietary, message: r.message, createdAt: r.created_at,
    }))
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps-${slugify(wedding.slug)}.csv"`,
    },
  });
}
