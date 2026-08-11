import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for **auth only**, using the anon key and the
 * request's cookies.
 *
 * Deliberately not the same client as `lib/db.ts`. That one holds the
 * service-role key and does all the data work; this one only ever answers
 * "who, if anyone, is signed in?". Keeping them apart means a mistake here
 * can't accidentally hand the browser a service-role query.
 */
export function authConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example.",
    );
  }

  const store = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) store.set(name, value, options);
        } catch {
          // Server Components are not allowed to write cookies. That's exactly
          // what middleware.ts is for — it refreshes the session on every
          // request, so swallowing this is safe rather than lossy.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null. Uses getUser() rather than getSession():
 * getSession() trusts whatever the cookie says, getUser() verifies it against
 * the auth server. Anything that gates access must use this one.
 */
export async function currentUser() {
  // Auth is an optional extra, so "not configured" has to mean "nobody is
  // signed in" rather than an exception. Otherwise a project running without
  // an anon key 500s on /dashboard instead of sending people to /login, and
  // creating a wedding would fail for a reason that has nothing to do with
  // creating a wedding.
  if (!authConfigured()) return null;

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
