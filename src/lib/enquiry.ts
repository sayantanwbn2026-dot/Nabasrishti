import { supabase } from "./supabase";
import { getAttribution } from "./attribution";

export const SERVICE_OPTIONS = [
  "1 BHK Interior",
  "2 BHK Interior",
  "3 BHK Interior",
  "4 BHK Interior",
  "Commercial Interior",
  "Renovation",
] as const;

export type Enquiry = {
  name: string;
  mobile: string;
  service: string;
  comments: string;
  /** Which project the visitor was looking at, when they came from one. */
  context?: string;
};

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

/** Indian mobile numbers: 10 digits, first digit 6–9. */
const MOBILE = /^[6-9]\d{9}$/;

export function validateEnquiry(values: Enquiry): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < 2) errors.name = "That name looks too short.";

  const mobile = values.mobile.replace(/\s|-/g, "");
  if (!mobile) errors.mobile = "Please enter your mobile number.";
  else if (!MOBILE.test(mobile))
    errors.mobile = "Enter a 10-digit mobile number starting with 6–9.";

  if (!values.service) errors.service = "Please choose a service.";

  if (values.comments.length > 600)
    errors.comments = "Please keep this under 600 characters.";

  return errors;
}

/**
 * Records the enquiry: the CMS first, then the Google Sheet.
 *
 * The CMS is the studio's own copy and is written whether or not the sheet
 * is configured. The sheet is the marketing team's copy — they do not have
 * CMS logins, and it is where campaign reporting happens — so it also
 * carries the campaign the visitor arrived on.
 *
 * Point VITE_ENQUIRY_ENDPOINT at the Apps Script Web App URL from
 * docs/google-sheets-setup.md. A lead is only ever rejected when neither
 * destination can take it; losing the sheet alone is logged, not surfaced.
 */
export async function submitEnquiry(values: Enquiry): Promise<void> {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;

  const payload = {
    name: values.name.trim(),
    mobile: values.mobile,
    service: values.service,
    comments: values.comments.trim(),
    // Which CTA produced the lead.
    source: values.context ?? "Timed pop-up",
    page: typeof window === "undefined" ? "" : window.location.pathname,
    submittedAt: new Date().toISOString(),
    /* Which advert paid for it. Read when the visitor first landed, since
       the query string is gone by the time they reach the form. */
    ...getAttribution(),
  };

  /* Every lead is written to the CMS first: that is the studio's own
     record, and it works whether or not the Sheets webhook is configured. */
  let storedInCms = false;
  if (supabase) {
    const { error } = await supabase.from("enquiries").insert({
      name: payload.name,
      mobile: payload.mobile,
      service: payload.service,
      comments: payload.comments,
      source: payload.source,
      page: payload.page,
    });
    if (error) {
      console.error("[enquiry] could not record in the CMS:", error.message);
    } else {
      storedInCms = true;
    }
  }

  if (!endpoint) {
    if (!storedInCms) {
      // Nowhere to put it: fail loudly rather than show a false thank-you.
      throw new Error("Enquiry could not be recorded.");
    }
    return;
  }

  /* Apps Script Web Apps answer the CORS preflight poorly, so this posts as
     text/plain (a "simple" request). doPost still receives the JSON body. */
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      /* Apps Script can be slow to wake. The visitor should not sit on a
         spinner waiting for a copy of a lead the studio already holds. */
      signal: AbortSignal.timeout(8000),
    });
  } catch (networkError) {
    if (!storedInCms) {
      throw new Error("Enquiry could not be recorded.");
    }
    console.error("[enquiry] sheets webhook unreachable:", networkError);
    return;
  }

  if (!response.ok && !storedInCms) {
    throw new Error(`Enquiry failed with status ${response.status}`);
  }

  if (!response.ok) {
    // The studio still has the lead in the CMS; don't fail the visitor.
    console.error("[enquiry] sheets webhook failed:", response.status);
  }
}
