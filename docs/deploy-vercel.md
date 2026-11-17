# Deploying to Vercel

The project is configured for Vercel — [`vercel.json`](../vercel.json) sets the
framework, SPA rewrites and cache headers, so the dashboard needs no custom
build settings.

## Before the first deploy

Two values are placeholders. **Both must be replaced or the site will lose
leads.**

1. **Phone number** — [`src/data/site.ts`](../src/data/site.ts). `+91 90000 00000`
   appears on the hero, header, closing banner and Thank You page.
2. **Lead endpoint** — `VITE_ENQUIRY_ENDPOINT`. Without it the form submits and
   redirects but **nothing is recorded**. See
   [google-sheets-setup.md](./google-sheets-setup.md).

Optional but worth doing: add a 1200×630 `og-image.jpg` to `public/` for link
previews, and a `favicon.ico`.

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
| `VITE_ENQUIRY_ENDPOINT` | the Apps Script `/exec` URL |

Without the two Supabase values the website still renders — it falls back to
its built-in content — but `/admin` cannot connect and nothing can be edited.
See [cms.md](./cms.md).

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

1. `/` loads and the enquiry pop-up appears after ~3 seconds.
2. Submit a real test enquiry. You should land on `/thank-you` **and** a row
   should appear in the Google Sheet.
3. Open `/thank-you` directly — it must render, not 404.
4. Open a nonsense path — the 404 page should render.
5. `/robots.txt` and `/sitemap.xml` resolve.

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
