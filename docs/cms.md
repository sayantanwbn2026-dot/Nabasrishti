# The content manager

The website reads its content from Supabase. Everything you can see on the
site can be changed at **`/admin`** — no code, no deploy.

- Live: `https://www.nabasrishti.in/admin`
- Local: `http://localhost:5173/admin`

Supabase project: **nabasrishti** (`xuzdtsnfomfegfygxiox`, Mumbai).

---

## Setting up your login — do this first

Two steps. The CMS will not let you save anything until both are done.

### 1. Create the account

Supabase dashboard → **Authentication → Users → Add user**. Enter the email
and password you want to sign in with, and tick **Auto Confirm User** so it
works immediately.

### 2. Put that email on the allowlist

Supabase dashboard → **SQL Editor**, and run this with your own email:

```sql
insert into public.cms_users (email, note)
values ('you@example.com', 'Studio owner');
```

**Why this exists:** Supabase allows anyone to register an account by
default. Without the allowlist, a stranger could sign up and edit your entire
website. Signing in is not enough — only emails in `cms_users` can change
anything. Everyone else, signed in or not, gets read-only access.

To add a colleague later, run the same insert with their email after creating
their account. To remove someone:

```sql
delete from public.cms_users where email = 'them@example.com';
```

> Also worth doing: **Authentication → Sign In / Providers → Email** and turn
> **Allow new users to sign up** off. The allowlist already protects your
> content; this stops strangers creating accounts at all.

---

## What you can change

### Site content
Everything that appears once, grouped into tabs:

| Tab | Covers |
|---|---|
| Studio & contact | Name, phone, email, location |
| Hero banner | Background photo, headline, service highlights, button text, tagline |
| Studio section | The big statement, the photograph, the counting statistics |
| Section headings | Every label and heading down the page |
| Closing & footer | Final banner and footer text |
| Enquiry form | Form wording, the service dropdown, pop-up delay, thank-you page |
| SEO | Browser tab title and the description Google shows |

### Projects
The list controls the home-page gallery. Click a project to open its editor.

**Details** — name, web address, type, location, year, the story, scope list.

**Card on the home page** — the image, plus how the card sits in the gallery:
full width, half, narrow left, narrow right, or wide right. "Image shape" is
width ÷ height: `1` square, `1.33` classic, `1.78` widescreen.

**Page options** — whether the story sits beside or above the scope list,
whether the scope and enquiry button show, and whether the project is visible
at all. Turn visibility off to work on a project privately.

**Page content** — this is where each project page becomes its own thing. Add
as many sections as you like, in any order:

| Section | Use it for |
|---|---|
| Image gallery | A set of photographs, in 1, 2 or 3 columns |
| Single image | One photograph, full width, with an optional caption |
| Paragraph | A block of writing |
| Heading | A sub-heading partway down the page |
| Pull quote | A large centred quotation, optionally attributed |
| Text beside image | Two columns: writing on the left, a photo on the right |
| Specification table | Label and value pairs — area, materials, duration |
| Spacer | Extra breathing room |

Use the ↑ ↓ buttons to reorder and × to delete. Each section saves on its own.

### Services, Process, Testimonials, Journal, Footer links
Lists you can add to, reorder and hide. Every item has a **Visible on the
website** switch so you can take something down without deleting it.

---

## Images

Any image field accepts either an upload or a pasted URL. Uploads go to the
project's `media` bucket and are served from Supabase.

- Keep photographs under 10 MB. JPEG, PNG, WebP, AVIF and SVG are accepted.
- Always fill in the description field next to an image. It is read aloud by
  screen readers and read by Google.
- Resize large photos before uploading — a 6 MB camera file makes the page
  slow for everyone.

---

## How saving works

Nothing saves as you type. Each panel has a **Save** button that turns dark
when there is something to save, and reads "Saved" when there isn't. Project
page sections save individually, so a long page is safe to edit a piece at a
time.

Changes are live the moment they save. Visitors already on the page may see
the previous version for up to a minute, because the site caches content
briefly.

---

## If something goes wrong

**"Not connected" on the admin page** — `VITE_SUPABASE_URL` or
`VITE_SUPABASE_ANON_KEY` is missing from the site's environment variables.

**Signed in, but Save does nothing / shows an error** — your email is not on
the allowlist. Run the insert in step 2.

**The site shows old content after a change** — hard-reload (Ctrl/Cmd +
Shift + R). If it persists, the site fell back to its built-in content, which
means it could not reach Supabase.

**The website is safe if the CMS breaks.** If Supabase is unreachable the site
falls back to the content it was built with, so visitors always see a complete
page rather than an empty one.
