import { db, getWeddingByToken } from "@/lib/db";
import { WeddingPatchSchema } from "@/lib/schema";

/**
 * The whole editor saves through here: one PATCH carrying the entire content
 * object. The token in the URL is the authorisation check — no session, no
 * cookie, no auth provider.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const existing = await getWeddingByToken(token);
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const parsed = WeddingPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Something didn't validate" }, { status: 400 });
  }
  const p = parsed.data;

  const { error } = await db
    .from("weddings")
    .update({
      content: p.content,
      theme: p.theme,
      primary_color: p.primaryColor,
      bg_color: p.bgColor,
      is_published: p.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("edit_token", token);

  if (error) return Response.json({ error: "Couldn't save. Try again." }, { status: 500 });
  return Response.json({ ok: true, savedAt: new Date().toISOString() });
}
