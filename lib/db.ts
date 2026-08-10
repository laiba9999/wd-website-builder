import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { Wedding, ThemeKey } from "./schema";

/**
 * Server-only Supabase client using the service-role key.
 *
 * The browser never talks to Supabase directly — every read and write in this
 * app goes through a route handler or a server component. That is why we can
 * skip row-level security for the MVP: the secret edit token in the URL is the
 * authorisation check, and it is only ever checked on the server.
 */
if (typeof window !== "undefined") {
  throw new Error("lib/db.ts is server-only. Do not import it into a client component.");
}

type Client = SupabaseClient<Database>;
let instance: Client | null = null;

function client(): Client {
  if (!instance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example.");
    }
    instance = createClient<Database>(url, key, { auth: { persistSession: false } });
  }
  return instance;
}

/**
 * Lazy on purpose. If the client were built at module load, `next build`
 * would need live credentials just to compile — this way a missing env var
 * fails at request time with a readable message instead.
 */
export const db = new Proxy({} as Client, {
  get: (_target, prop) => Reflect.get(client(), prop, client()),
});

export const BUCKET = "wedding-media";

type Row = Database["public"]["Tables"]["weddings"]["Row"];

function toWedding(row: Row): Wedding {
  return {
    id: row.id,
    slug: row.slug,
    editToken: row.edit_token,
    isPublished: row.is_published,
    theme: row.theme as ThemeKey,
    primaryColor: row.primary_color,
    bgColor: row.bg_color,
    content: row.content,
  };
}

export async function getWeddingByToken(token: string): Promise<Wedding | null> {
  const { data } = await db.from("weddings").select("*").eq("edit_token", token).maybeSingle();
  return data ? toWedding(data) : null;
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | null> {
  const { data } = await db.from("weddings").select("*").eq("slug", slug).maybeSingle();
  return data ? toWedding(data) : null;
}

/** Public URL for a stored image. The bucket is public, so this is just string maths. */
export function publicUrl(path: string): string {
  if (!path) return "";
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
