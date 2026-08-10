import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { CreateWeddingSchema, defaultContent, THEMES_DEFAULT } from "@/lib/create";

export async function POST(req: Request) {
  const parsed = CreateWeddingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the form" }, { status: 400 });
  }
  const { coupleNames, weddingDate } = parsed.data;
  const slug = await uniqueSlug(coupleNames);

  const { data, error } = await db
    .from("weddings")
    .insert({
      slug,
      theme: THEMES_DEFAULT.theme,
      primary_color: THEMES_DEFAULT.primaryColor,
      bg_color: THEMES_DEFAULT.bgColor,
      content: defaultContent(coupleNames, weddingDate),
    })
    .select("slug, edit_token")
    .single();

  if (error || !data) {
    return Response.json({ error: "Couldn't create that just now. Try again." }, { status: 500 });
  }
  return Response.json({ slug: data.slug, editToken: data.edit_token }, { status: 201 });
}
