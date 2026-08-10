# Wedding site builder

Couples fill in a form, pick one of three looks, and get a shareable wedding
website they can edit forever. No accounts, no passwords, no paid services.

## Setting it up

**1 — Supabase** (free, no card)

1. Create a project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → run.
3. Storage → New bucket → name it `wedding-media` → tick **Public**.
4. Project Settings → API → copy the URL and the **service_role** key.

**2 — Locally**

```bash
cp .env.example .env.local   # fill in the three values
npm install
npm run dev
```

**3 — Vercel** (free, no card)

Push to GitHub, import the repo at vercel.com, and add the same three
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

The browser never talks to Supabase. Every read and write goes through a route
handler or a server component holding the service-role key, which is why there
is no auth provider and no row-level-security policy to write.

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

## Deliberately not built

Accounts, draft/publish history, RSVP emails, image cropping, a Google Sheets
sync, and a separate Schedule section (events already sort themselves by date).
Each of those is a day-three decision, not a day-one one.
