import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { currentUser } from "@/lib/supabase-server";
import { CreateWeddingSchema, defaultContent, THEMES_DEFAULT } from "@/lib/create";

export async function POST(req: Request) {
  const parsed = CreateWeddingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the form" }, { status: 400 });
  }
  const { coupleNames, weddingDate } = parsed.data;
  const slug = await uniqueSlug(coupleNames);

  // If they happen to be signed in, claim the wedding so it shows on their
  // dashboard. If not, owner_id stays null and the site is exactly as usable
  // — the edit link is the real key. Signing in is never required.
  const user = await currentUser().catch(() => null);

  const { data, error } = await db
    .from("weddings")
    .insert({
      slug,
      owner_id: user?.id ?? null,
      theme: THEMES_DEFAULT.theme,
      primary_color: THEMES_DEFAULT.primaryColor,
      bg_color: THEMES_DEFAULT.bgColor,
      content: defaultContent(coupleNames, weddingDate),
    })
    .select("slug, edit_token")
    .single();

  if (error || !data) {
    // The couple gets a calm message; the server log gets the real reason.
    // Most likely cause on a fresh deploy is schema drift — e.g. a database
    // created before `owner_id` existed. See the migration note in
    // supabase/schema.sql.
    console.error("POST /api/weddings failed:", error?.message ?? "no row returned");
    return Response.json({ error: "Couldn't create that just now. Try again." }, { status: 500 });
  }
  return Response.json({ slug: data.slug, editToken: data.edit_token }, { status: 201 });
}
