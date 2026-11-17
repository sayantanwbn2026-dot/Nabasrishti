# Lead capture → Google Sheets

Implements item 8 of the Google Ads website audit: *"Integrate the website
enquiry form with Google Sheets so that every new lead is automatically
recorded."*

Until `VITE_ENQUIRY_ENDPOINT` is set, **leads are not recorded anywhere**. The
form will still submit and redirect, and in development the console warns that
the lead was dropped. Do not launch ads before finishing this.

## 1. Create the sheet

Create a Google Sheet named `Nabasrishti — Website Leads` with these headers in
row 1, in this order:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Submitted At | Name | Mobile | Service | Comments | Source | Page |

## 2. Add the Apps Script

In the sheet: **Extensions → Apps Script**, replace the contents with:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || '',
    "'" + (data.mobile || ''),   // leading quote keeps the leading digit
    data.service || '',
    data.comments || '',
    data.source || '',
    data.page || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3. Deploy it

**Deploy → New deployment → Web app**

- Execute as: **Me**
- Who has access: **Anyone**

Copy the Web app URL (it ends in `/exec`).

> "Anyone" means anyone with the URL can append rows. That is what makes the
> public form work. It cannot read the sheet.

## 4. Point the site at it

Create `.env.local` in the project root:

```
VITE_ENQUIRY_ENDPOINT=https://script.google.com/macros/s/XXXXXXXX/exec
```

Set the same variable in the production host's environment, then rebuild —
Vite inlines `VITE_*` values at build time, so a rebuild is required.

## 5. Verify

Submit a test enquiry. A row should appear within a second or two, and the
browser should land on `/thank-you`.

## Notes

- The request is sent as `text/plain` on purpose. Apps Script handles the CORS
  preflight for `application/json` badly; `text/plain` is a "simple" request
  that skips the preflight, and `doPost` still receives the JSON body.
- `Source` records which CTA produced the lead (hero, a section button, a
  project, or the timed pop-up), which is what lets you compare campaigns.
- Share the sheet with the marketing team, as the audit requires.
