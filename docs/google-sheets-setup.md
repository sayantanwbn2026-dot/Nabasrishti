# Lead capture → Google Sheets

Every enquiry is written twice: to the CMS, which is the studio's own
record, and to a Google Sheet, which is the marketing team's. The team do
not need CMS logins, and the sheet is where campaign reporting happens.

The sheet copy also carries **where the lead came from** — the Google Ads
campaign, the keyword, the click id — which the CMS copy does not. That is
what makes it possible to say which advert paid for which enquiry.

> **Leads are not lost if this is not set up.** Every enquiry goes to the
> CMS first and is visible under **Enquiries** there. Without the sheet you
> lose the marketing team's copy and the campaign reporting, not the lead.
> The form only refuses a submission when *neither* destination will take
> it.

---

## 1. Make the sheet

Create a Google Sheet called **Nabasrishti — Website Leads**.

You do not need to add headers. The script writes them the first time a
lead arrives, and freezes the top row.

> **Already running an older copy of this script?** A City column was
> added to the form. Replace the script below and the new column appears
> on the next lead; rows written before that keep their old shape, so add
> a City heading to the sheet by hand if you want the columns to line up
> across the whole history.

## 2. Add the script

In the sheet: **Extensions → Apps Script**. Delete whatever is there and
paste this in.

```javascript
const SHEET_NAME = 'Leads';

const HEADERS = [
  'Submitted at', 'Name', 'Mobile', 'City', 'Service', 'Comments',
  'Form location', 'Page',
  'Campaign', 'Ad source', 'Medium', 'Keyword', 'Ad variant',
  'Click ID', 'Referrer', 'Landing page'
];

function doPost(e) {
  // Two people submitting at the same second must not overwrite each other.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    const d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      d.submittedAt || new Date().toISOString(),
      d.name || '',
      // The leading quote stops Sheets eating the first digit of a number.
      "'" + (d.mobile || ''),
      d.city || '',
      d.service || '',
      d.comments || '',
      d.source || '',
      d.page || '',
      d.utm_campaign || '',
      d.utm_source || '',
      d.utm_medium || '',
      d.utm_term || '',
      d.utm_content || '',
      d.gclid || '',
      d.referrer || '',
      d.landing_page || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

### If "Sorry, unable to open the file at this time" appears

Apps Script opens under whichever Google account the browser treats as
first, which is not always the one the sheet belongs to. When those two
differ, the editor cannot find the sheet and says this.

Look at the address bar. A `/u/1/` or `/u/2/` in the URL means a second
or third account is in play. Any one of these fixes it:

- Open the sheet in a private window and sign in with only the account
  that owns it.
- Sign out of the other Google accounts, then reopen the sheet.
- In the sheet, use the avatar in the top right to switch to the owning
  account first, then try **Extensions → Apps Script** again.

If it still refuses — some Workspace accounts have Apps Script turned off
by an administrator — the script does not have to live inside the sheet.
See *Running the script outside the sheet* below.

## 3. Deploy it

**Deploy → New deployment → Web app**

- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web app URL. It ends in `/exec`.

> "Anyone" means anyone holding that URL can add a row. That is what lets
> a public form write to the sheet. It does **not** let them read the
> sheet, or see anything already in it.

Google asks you to authorise the script the first time, and warns that it
is unverified. It is your own script in your own sheet; continue through
the warning.

## 4. Point the website at it

Set `VITE_ENQUIRY_ENDPOINT` to that `/exec` URL — in Vercel under
**Settings → Environment Variables**, for Production, Preview and
Development.

**Then redeploy.** `VITE_*` values are baked in at build time, so changing
the variable alone does nothing to the live site.

For local work, put the same line in `.env.local`.

## 5. Share it with the marketing team

**Share** in the top right of the sheet. Add the team's email addresses as
**Viewer**, or **Editor** if they need to add their own columns and notes.

Give them the sheet, not the Apps Script URL — the URL is a write endpoint
and does not need to be passed around.

## 6. Check it works

Submit a test enquiry on the live site. Within a second or two:

1. A row appears in the sheet.
2. The same enquiry appears under **Enquiries** in the CMS.
3. The browser lands on `/thank-you`.

Delete the test row from both afterwards.

To check the campaign columns, visit the site with parameters on the URL
first, then submit:

```
https://www.nabasrishti.in/?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=TEST123
```

The row should carry `test` under Campaign and `TEST123` under Click ID.

---

## What each column means

| Column | What it tells you |
|---|---|
| City | The city or area the visitor typed. Suggestions are offered, but the box accepts anything |
| Form location | Which button opened the form — a pricing package, a project, the hero, or the timed pop-up |
| Page | The page they were on when they submitted |
| Campaign / Ad source / Medium | Straight from `utm_campaign`, `utm_source`, `utm_medium` |
| Keyword / Ad variant | `utm_term` and `utm_content` |
| Click ID | `gclid`, which ties the row to a click in Google Ads |
| Referrer / Landing page | Where they came from, and the first page of the visit |

Campaign columns are blank for anyone who did not arrive from a tagged
link — direct visitors, or an untagged social post. Tag your ad URLs with
UTM parameters and Google Ads auto-tagging, or these stay empty.

The campaign is read **once, when the visitor first arrives**, and kept for
the rest of their visit. It has to be: the parameters are in the URL on
arrival and gone the moment they click anything. A visitor who lands from
an advert, browses for ten minutes and then enquires is still credited to
that advert.

---

## Running the script outside the sheet

A script normally lives inside the sheet and reaches it through
`getActiveSpreadsheet()`. When the built-in editor will not open, the
same script can live on its own and be pointed at the sheet by its id.

Open [script.google.com](https://script.google.com), choose **New
project**, and paste the same code with one line changed.

Find the sheet's id in its address bar — the long string between `/d/`
and `/edit`:

```
https://docs.google.com/spreadsheets/d/THIS_LONG_PART_IS_THE_ID/edit
```

Then replace this line:

```javascript
const book = SpreadsheetApp.getActiveSpreadsheet();
```

with this one, pasting the id between the quotes:

```javascript
const book = SpreadsheetApp.openById('THIS_LONG_PART_IS_THE_ID');
```

Deploy it exactly as in step 3. Everything else is the same.

The only practical difference: a standalone script is not attached to the
sheet, so copying or duplicating the sheet later leaves the script behind
pointing at the original.

---

## Notes

- The request is sent as `text/plain` on purpose. Apps Script handles the
  CORS preflight for `application/json` badly; `text/plain` is a "simple"
  request that skips the preflight, and `doPost` still receives the JSON.
- Apps Script always answers `200`, even when the script itself throws, so
  the website cannot tell a script error from a success. This is why the
  CMS is written first and treated as the record of truth. If rows stop
  appearing, check **Executions** in the Apps Script editor.
- If the sheet is unreachable or slow, the request is abandoned after
  eight seconds and the visitor still reaches the thank-you page. The lead
  is already in the CMS by then; failures are logged to the browser
  console, not shown to the visitor.
- Changing the script does **not** need a redeploy of the website. Changing
  `VITE_ENQUIRY_ENDPOINT` does.
