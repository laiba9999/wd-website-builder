# Wedding site builder

Couples create an invited account, fill in a form, pick one of three looks,
and get a shareable wedding website. New accounts require the private
invitation code configured by the site owner.

## Setting it up

**1 — Supabase** (free, no card)

1. Create a project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → run.
3. Storage → New bucket → name it `wedding-media` → tick **Public**.
4. Project Settings → API → copy the URL, the **service_role** key, and the
   **anon** key.
5. Authentication → URL Configuration → add `http://localhost:3000/set-password`
   and `https://<your-domain>/set-password` to **Redirect URLs**. Invitation
   links cannot finish account setup if you skip this.
6. Authentication → Providers → Email → turn off public user sign-ups. The app
   creates users through the protected server-side invitation endpoint instead.

**2 — Locally**

```bash
cp .env.example .env.local   # fill in all five values, including INVITE_CODE
npm install
npm run dev
```

**3 — Vercel** (free, no card)

Push to GitHub, import the repo at vercel.com, and add the same five
environment variables. `NEXT_PUBLIC_SITE_URL` becomes your live domain.

**4 — Keep-alive**

Supabase pauses a free project after 7 days of inactivity. In the GitHub repo,
add a secret named `SITE_URL` set to your Vercel URL. The workflow in
`.github/workflows/keepalive.yml` pings it every three days.

## How it hangs together

| Route | Who it's for |
|---|---|
| `/signup` | New couple. Invitation code and email address. |
| `/set-password` | Invited couple. Finishes account setup from the email link. |
| `/login` | Existing couple. Email-and-password sign-in. |
| `/create` | Signed-in couple. Two fields, then hands over the secret edit link. |
| `/e/<edit-token>` | Couple. The whole editor. The token *is* the password. |
| `/e/<edit-token>/rsvps` | Couple. Replies, headline counts, CSV download. |
| `/w/<slug>` | Guests. The public site. |
| `/w/<slug>?token=…` | Couple. The same page before it's published — this is "preview". |
| `/dashboard` | Signed-in couple. Their wedding sites. |

The browser never talks to Supabase **for data**. Every read and write goes
through a route handler or a server component holding the service-role key,
which is why there is no row-level-security policy to write.

## Accounts and editor links

New accounts are created only after `/api/auth/invite` validates `INVITE_CODE`
server-side. Supabase sends the invitation email; its link opens
`/set-password`, and the couple then signs in with email and password.

Creating a wedding requires a verified session. The wedding records that
user's `owner_id`, and `/dashboard` lists only weddings owned by that user.
The API repeats the session check, so bypassing the page cannot create an
anonymous wedding.

Existing secret edit links (`/e/<edit-token>`) remain valid for backwards
compatibility. Holding the unguessable URL is the authorisation check for that
editor, verified server-side against the `weddings` table on every request.

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

**Supabase's built-in email sender is rate-limited to a handful of invitations
per hour, shared across the whole project** — not per user. Two or three couples
registering at once can exhaust it, and the failure looks like "I never got the
email". That's fine at MVP traffic and genuinely not fine at launch traffic.

The fix is to plug a real sender into Authentication → Settings → SMTP
(Resend and Postmark both have free tiers big enough for this). Nothing in the
app changes — it's a Supabase dashboard setting. Do it before you tell more
than a few couples about registration.

## Deliberately not built

Draft/publish history, RSVP emails, image cropping, a Google Sheets sync, and a
separate Schedule section (events already sort themselves by date).
