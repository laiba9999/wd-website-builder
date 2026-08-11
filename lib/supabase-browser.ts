"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client, built on the **anon** key.
 *
 * This client exists for exactly one job: sending a magic-link email and
 * carrying the resulting session cookie. It never reads or writes `weddings`
 * or `rsvps` — RLS is on with no policies, so the anon key cannot touch
 * either table even if someone lifts it out of the bundle (which they can:
 * NEXT_PUBLIC_ values are inlined at build time, and that is fine for this
 * key by design).
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example.",
    );
  }
  return createBrowserClient(url, key);
}
