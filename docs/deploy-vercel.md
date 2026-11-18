# Deploying to Vercel

The project is configured for Vercel — [`vercel.json`](../vercel.json) sets the
framework, SPA rewrites and cache headers, so the dashboard needs no custom
build settings.

## Before the first deploy

Work through this list. The first three are the ones that cost real money
or real leads if they are wrong.

### 1. Set the environment variables in Vercel

See [Environment variables](#environment-variables) below. Without the two
Supabase values the site still renders from its built-in content, but
`/admin` cannot connect, **and enquiries have nowhere to go**.

### 2. Secure the content manager

- Change the CMS password. Supabase dashboard → **Authentication → Users**.
- Turn open signups off: **Authentication → Sign In / Providers → Email** →
  **Allow new users to sign up** off. The `cms_users` allowlist already
  stops a stranger editing anything, but this stops them registering at all.
- Optional: **Authentication → Policies** → enable leaked-password
  protection, which checks new passwords against known breaches.

### 3. Put the real social links in

They currently point at `instagram.com`, `facebook.com`, `linkedin.com` and
`youtube.com` — the networks' front pages, not the studio's profiles. Set
them in the CMS under **Social links**. Until then the icons in the contact
section send visitors nowhere useful, and the studio's profiles are left out
of the page's structured data.

### 4. Check the studio's own details

In the CMS under **Site content → Studio & contact**: the phone number, the
digits used for the call and WhatsApp buttons, the email and the address.
The phone field has a warning on it if the two phone values disagree.

### Already done

The phone number, the page titles and descriptions, the structured data, the
`og-image.jpg` and the favicons are all in place.

## Deploy

With the Vercel CLI:

```bash
npx vercel
```

Then promote to production:

```bash
npx vercel --prod
```

Or push the repo to GitHub and import it at vercel.com/new — Vercel detects
Vite and reads `vercel.json`.

## Environment variables

In **Project Settings → Environment Variables**, add for Production, Preview
and Development:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xuzdtsnfomfegfygxiox.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the publishable key from Supabase → Data API |
| `VITE_ENQUIRY_ENDPOINT` | the Apps Script `/exec` URL — optional |

Without the two Supabase values the website still renders — it falls back to
its built-in content — but `/admin` cannot connect and nothing can be edited.
See [cms.md](./cms.md).

`VITE_ENQUIRY_ENDPOINT` is optional. Every enquiry is written to the CMS
first, so leaving it blank costs the spreadsheet copy, not the lead. The
form only refuses to submit when it has nowhere at all to put the enquiry.

`VITE_*` values are inlined at build time, so **redeploy after changing one** —
editing the variable alone does nothing to the live site.

## What vercel.json does

- **Rewrites** every path without a file extension to `index.html`. This is what
  makes `/thank-you` work; without it that URL 404s and the Google Ads
  conversion never fires.
- **Caches** `/assets/*` for a year as `immutable`. Safe because Vite hashes
  every filename.
- Sets `nosniff`, `SAMEORIGIN`, a referrer policy, and denies camera/mic/geo.

## After deploying — verify

1. `/` loads and the enquiry pop-up appears after a few seconds.
2. Submit a test enquiry. You should land on `/thank-you`, and the enquiry
   should appear under **Enquiries** in the CMS (and in the Google Sheet, if
   you configured one). Delete the test row afterwards.
3. Tap the phone number and the WhatsApp button — both must dial the
   studio's real number, not a placeholder.
4. Open `/thank-you` directly — it must render, not 404.
5. Open a nonsense path — the 404 page should render.
6. `/robots.txt` and `/sitemap.xml` resolve.
7. Sign in at `/admin`, open each section in turn, change something small
   and confirm the website shows it without a reload.

## Then configure Google Ads

Create a conversion action using **Page load** with destination URL
`https://www.nabasrishti.in/thank-you`. That is what the Thank You page exists
for (audit item 7).

## Domain

Point `nabasrishti.in` at the project under **Settings → Domains**. If the
final domain differs from `www.nabasrishti.in`, update the canonical and
Open Graph URLs in [`index.html`](../index.html) and the URL in
[`public/sitemap.xml`](../public/sitemap.xml).

## Notes

- `npm run build` runs `tsc --noEmit` first, so a type error fails the deploy
  rather than shipping broken code. `npm run build:fast` skips that check.
- The build is **not** single-file any more. That plugin inlined ~480 KB of JS
  into `index.html`, which cannot be cached and blocks the parser. Output is
  now hashed chunks: app code (~44 KB) separate from vendor code, so a content
  change does not invalidate the vendor cache.
