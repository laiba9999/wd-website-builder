import { db } from "@/lib/db";
import { RsvpSchema } from "@/lib/schema";

export async function POST(req: Request) {
  const parsed = RsvpSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the form" }, { status: 400 });
  }
  const r = parsed.data;

  // The wedding must exist and be published before we accept replies for it.
  const { data: wedding } = await db
    .from("weddings").select("id, is_published").eq("id", r.weddingId).maybeSingle();
  if (!wedding || !wedding.is_published) {
    return Response.json({ error: "This wedding isn't accepting replies" }, { status: 404 });
  }

  const { error } = await db.from("rsvps").insert({
    wedding_id: r.weddingId,
    guest_name: r.guestName,
    email: r.email || null,
    attending: r.attending,
    party_size: r.attending ? r.partySize : 0,
    dietary: r.dietary || null,
    message: r.message || null,
  });
  if (error) return Response.json({ error: "Couldn't send that. Try again." }, { status: 500 });

  return Response.json({ ok: true }, { status: 201 });
}
