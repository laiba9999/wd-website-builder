# Wedding site builder

Couples fill in a form, pick one of three looks, and get a shareable wedding
website they can edit forever. No passwords, no paid services. Signing in is
optional — the secret edit link is the real way in.

## Setting it up

**1 — Supabase** (free, no card)

1. Create a project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → run.
3. Storage → New bucket → name it `wedding-media` → tick **Public**.
4. Project Settings → API → copy the URL, the **service_role** key, and the
   **anon** key.
5. Authentication → URL Configuration → add `http://localhost:3000/auth/callback`
   and `https://<your-domain>/auth/callback` to **Redirect URLs**. Magic links
   silently fail to redirect if you skip this.

**2 — Locally**

```bash
cp .env.example .env.local   # fill in the four values
npm install
npm run dev
```

**3 — Vercel** (free, no card)

Push to GitHub, import the repo at vercel.com, and add the same four
environment variables. `NEXT_PUBLIC_SITE_URL` becomes your live domain.

**4 — Keep-alive**

Supabase pauses a free project after 7 days of inactivity. In the GitHub repo,
add a secret named `SITE_URL` set to your Vercel URL. The workflow in
`.github/workflows/keepalive.yml` pings it every three days.

## How it hangs together

| Route | Who it's for |
|---|---|
| `/create` | Couple. Two fields, then hands over the secret edit link. |
| `/e/<edit-token>` | Couple. The whole editor. The token *is* the password. |
| `/e/<edit-token>/rsvps` | Couple. Replies, headline counts, CSV download. |
| `/w/<slug>` | Guests. The public site. |
| `/w/<slug>?token=…` | Couple. The same page before it's published — this is "preview". |
| `/login` | Couple. Optional magic-link sign-in. |
| `/dashboard` | Couple. Their sites, if they signed in. |

The browser never talks to Supabase **for data**. Every read and write goes
through a route handler or a server component holding the service-role key,
which is why there is no row-level-security policy to write.

## The two ways into the editor

They're independent, and the first one is the real one:

1. **The secret edit link** (`/e/<edit-token>`). Always works, no session
   needed. Holding the URL *is* the authorisation check, verified server-side
   against the `weddings` table on every request.
2. **Magic-link sign-in** (optional, additive). Only exists so a couple who
   loses their edit link can still find their sites. A wedding created while
   signed in records `owner_id`; `/dashboard` lists those and links straight
   into the same `/e/<edit-token>` editor. A wedding created signed-out has a
   null `owner_id` and is in no way lesser.

Sign-in never gates anything. If you never configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`/login` and `/dashboard` stop working and the rest of the app doesn't notice.

`middleware.ts` refreshes the session cookie on every request. It guards no
routes — it's there because Server Components can't write cookies, so without
it sessions expire at unpredictable moments.

`lib/schema.ts` is the source of truth for the shape of a wedding. Change it
there and the types, the validation and the editor defaults all follow.

## Where the cost would come from

Nothing here bills you. Three things would eventually:

- **Vercel Hobby is non-commercial only.** The day you charge a couple, or take
  a donation, you need Pro at $20/mo (or Netlify, whose free plan permits
  commercial use).
- **Supabase storage is 1 GB.** At ~250 KB per compressed image and 10 images
  per wedding, that's roughly 400 weddings. The compression in
  `components/editor/ImageUploader.tsx` is load-bearing — don't remove it.
- **Supabase egress.** Images are served straight from Supabase's CDN. If egress
  gets tight, put Vercel in front of them.

## The one limit that will bite first

**Supabase's built-in email sender is rate-limited to a handful of magic links
per hour, shared across the whole project** — not per user. Two or three couples
signing in at once can exhaust it, and the failure looks like "I never got the
email". That's fine at MVP traffic and genuinely not fine at launch traffic.

The fix is to plug a real sender into Authentication → Settings → SMTP
(Resend and Postmark both have free tiers big enough for this). Nothing in the
app changes — it's a Supabase dashboard setting. Do it before you tell more
than a few couples about sign-in.

Worth keeping in proportion: this only ever affects the *optional* sign-in
path. Edit links have no such limit and no email involved.

## Deliberately not built

Accounts as a requirement, password auth, draft/publish history, RSVP emails,
image cropping, a Google Sheets sync, and a separate Schedule section (events
already sort themselves by date). Each of those is a day-three decision, not a
day-one one.
