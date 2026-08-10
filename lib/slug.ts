import { db } from "./db";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Slugs are permanent once created — a couple who has shared their link should
 * never be able to break it from the editor. So we resolve collisions here,
 * once, at creation time.
 */
export async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "our-wedding";
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await db.from("weddings").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Math.random().toString(36).slice(2, 7)}`;
}
