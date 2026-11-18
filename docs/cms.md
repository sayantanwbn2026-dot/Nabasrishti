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

### Page sections
The order of the bands down the home page. Use ↑ and ↓ to rearrange them,
and the switch to take one off the site without losing anything inside it.
The hero and the closing banner are marked **Fixed**: they stay first and
last.

> If you hide a section that a navigation link points to, that link will
> have nothing to scroll to. Hide the matching link under **Navigation**
> at the same time.

### Projects
The list controls the home-page gallery. Click a project to open its
editor, or use **⧉** to duplicate one — the copy arrives hidden, with
every section of its page, ready to rename.

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
| Before and after | A slider between two images |
| Single image | One photograph, full width, with an optional caption |
| Paragraph | A block of writing |
| Heading | A sub-heading partway down the page |
| Pull quote | A large centred quotation, optionally attributed |
| Text beside image | Two columns: writing on the left, a photo on the right |
| Specification table | Label and value pairs — area, materials, duration |
| Spacer | Extra breathing room |

Use the ↑ ↓ buttons to reorder and × to delete. Each section saves on its own.

**Image shapes.** Every photograph in a gallery has a **Shape** setting:
16:9 and 4:3 are wide, 1:1 is square, and 4:5, 3:4 and 9:16 stand upright.
Two wide images in a row sit side by side; an upright one takes the row to
itself. Leave it on **As uploaded** to keep a gallery exactly as it is —
the shapes only take over once you set them.

**Search and sharing.** Each project and post has its own search title,
description and sharing image. Leave them blank and the page uses its own
name and story. These are what Google shows, and what appears when the
link is pasted into WhatsApp.

### Enquiries
Every form submission lands here, newest first, with the page and button it
came from. Set a status (new → contacted → quoted → won/lost), keep private
notes, and call or WhatsApp straight from the record.

**Download CSV** exports whatever the current filter shows. The file opens
cleanly in Excel and Google Sheets, and mobile numbers keep their leading
digits.

### Transformations
The before and after pairs behind "From Concept to Creation". Each one
becomes a slider on the page the button opens. Both images in a pair
should be the same shape, or the slider will crop one of them.

### Journal
Posts work exactly like projects: a card in the grid, and a full page built
from the same sections. Summary, author and reading time appear in the meta
line.

### Navigation, Social links
The links across the top of the site, and the icons in the footer. For social
icons the **Platform** field picks the icon — use `instagram`, `facebook`,
`linkedin`, `youtube`, `x` or `pinterest`.

### Contact & map
The section above the closing banner: label, heading, studio address,
optional opening hours, and the map. For the map, open Google Maps →
**Share → Embed a map**, and paste only the `src="..."` value into **Map
embed address**. Social links shown here come from the **Social links**
panel; a switch puts them back in the footer too if you want both.

### Logo & chrome
Under Site content: upload your logo (and a version for dark backgrounds, used
on the loading screen), switch the loading screen and the WhatsApp button on or
off, set the WhatsApp opening message, change the before/after slider images,
and edit the page-not-found text.

### Services, Process, Testimonials, Footer links
Lists you can add to, reorder and hide. Every item has a **Visible on the
website** switch so you can take something down without deleting it.

---

## Images

Any image field accepts either an upload or a pasted URL. Uploads go to the
project's `media` bucket and are served from Supabase.

**Choose existing** opens the library of everything uploaded so far, so a
photograph used in one place can be reused in another without finding the
original file again. Search it by file name.

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

Changes are live the moment they save. Pages that are already open update
themselves within a second — the site subscribes to the database and
refreshes the affected section without a reload.

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
