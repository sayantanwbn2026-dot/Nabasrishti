# Putting the site live on Hostinger

The site is a single-page app: one `index.html` plus a folder of hashed
assets. Hostinger serves it as static files, which is the cheapest and
fastest thing it can do — there is no Node process to keep running.

What makes that work is `.htaccess`, which ships inside the build. Without
it every address except the home page returns Hostinger's own 404, because
there is no `thank-you.html` or `admin.html` on disk for it to find.

> **One thing to settle before the first upload.** `VITE_*` values are
> compiled into the JavaScript at build time, not read when the site runs.
> There is no environment-variable screen to fill in afterwards on shared
> hosting. If you change one, you rebuild and re-upload.

---

## 1. Set the values the build needs

In the project folder, create a file called `.env.production` (it is
ignored by git and never uploaded):

```
VITE_SUPABASE_URL=https://xuzdtsnfomfegfygxiox.supabase.co
VITE_SUPABASE_ANON_KEY=<the anon key from Supabase → Project Settings → API>
VITE_ENQUIRY_ENDPOINT=<the Apps Script /exec URL, if the Google Sheet is set up>
```

The anon key is meant to be public — it is in the JavaScript either way,
and what it can touch is decided by the database's row-level security, not
by keeping the key secret. The **service role** key is the one that must
never be in a build.

`VITE_ENQUIRY_ENDPOINT` is optional. Without it, enquiries still reach the
CMS; you only lose the marketing team's copy in the sheet. See
[google-sheets-setup.md](google-sheets-setup.md).

## 2. Build

```
npm install
npm run build
```

This type-checks first and refuses to build if anything is wrong, so a
clean run means the code compiled. The result is the `dist` folder.

Check that `dist/.htaccess` exists before going further — some archive
tools and file managers hide dotfiles, and a build uploaded without it is
exactly the broken-every-page-but-home problem described above.

```
ls -a dist
```

## 3. Clear the old site

In hPanel: **Files → File Manager → `public_html`**.

The old site's files are in there. Before deleting anything, take a copy:
select everything, **Compress** to a zip, and download it. If the new site
needs to come down for any reason, that zip is the way back.

Then delete the contents of `public_html` — the folder itself stays.

> Leave alone anything Hostinger put there for its own purposes: a
> `.well-known` folder (used for SSL certificate renewal), and any email
> or domain-verification files. Deleting `.well-known` can break HTTPS
> renewal.

## 4. Upload

Upload the **contents** of `dist`, not the folder. `index.html` must end
up at `public_html/index.html`, not `public_html/dist/index.html`.

The quickest way is to zip the contents locally, upload the one zip, and
use File Manager's **Extract**. Afterwards, confirm `.htaccess` arrived:
in File Manager, **Settings → Show hidden files**.

## 5. Check it

Visit each of these. All five must work, and the last two are the ones
that prove `.htaccess` is doing its job:

1. `https://www.nabasrishti.in/` — the home page.
2. `https://nabasrishti.in/` — should redirect to the `www` address.
3. `http://www.nabasrishti.in/` — should redirect to `https`.
4. `https://www.nabasrishti.in/admin` — the CMS sign-in screen.
5. `https://www.nabasrishti.in/thank-you` — the page adverts count a
   conversion on.

Then submit a real enquiry through the form and confirm it appears under
**Enquiries** in the CMS.

If every page except the home page 404s, `.htaccess` did not make it up.
If the whole site returns 500, `.htaccess` arrived but the server rejected
a line in it: comment out `Options -MultiViews` and `Options -Indexes`
first, as those are the two directives shared hosting is most likely to
refuse.

---

## Putting up a new version later

1. `npm run build`
2. Delete the old `assets` folder in `public_html` — leaving it behind
   accumulates every past build's files, which is wasted space but
   otherwise harmless.
3. Upload the new `dist` contents, overwriting.

Nothing in the CMS is affected: the text, pictures, projects, pricing and
enquiries all live in Supabase, not in these files. Uploading a new build
never puts content back to an earlier state.

`.htaccess` tells browsers never to cache `index.html`, so a new version is
picked up on the next visit without anyone having to clear anything.

## What is where

| | |
|---|---|
| Pages, pictures, pricing, enquiries | Supabase — edited at `/admin` |
| Uploaded images | Supabase Storage |
| The site itself | `public_html` on Hostinger |
| Lead copies for marketing | Google Sheet, via Apps Script |

The CMS writes to Supabase directly from the browser, so the content is
live the moment it is saved. Hostinger is only serving files; it does not
need to know anything changed.

## Still to do on the Supabase side

These are security settings, not deployment steps, but they should be done
before the site is advertised:

- **Change the CMS password.** The one used during the build was shared in
  plain text over chat and should be treated as known.
- **Turn off open sign-ups** — Supabase → Authentication → Providers →
  Email → disable "Enable sign ups", so `/admin` cannot be used to create
  an account.
- **Turn on leaked-password protection** — Authentication → Policies.
