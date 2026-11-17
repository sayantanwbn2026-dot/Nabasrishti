import { supabase } from "./supabase";

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
 * Sends the enquiry to the Google Sheet (Ads audit item 8).
 *
 * Point VITE_ENQUIRY_ENDPOINT at the Apps Script Web App URL from
 * docs/google-sheets-setup.md. With no endpoint configured the call resolves
 * locally so the form can be exercised end to end — but nothing is recorded,
 * so the site must not go live in that state.
 */
export async function submitEnquiry(values: Enquiry): Promise<void> {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;

  const payload = {
    name: values.name.trim(),
    mobile: values.mobile,
    service: values.service,
    comments: values.comments.trim(),
    // Which CTA produced the lead, for campaign analysis.
    source: values.context ?? "Timed pop-up",
    page: typeof window === "undefined" ? "" : window.location.pathname,
    submittedAt: new Date().toISOString(),
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
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (!response.ok && !storedInCms) {
    throw new Error(`Enquiry failed with status ${response.status}`);
  }

  if (!response.ok) {
    // The studio still has the lead in the CMS; don't fail the visitor.
    console.error("[enquiry] sheets webhook failed:", response.status);
  }
}
