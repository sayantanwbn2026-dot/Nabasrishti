/**
 * Single source for contact details and the marketing copy the Google Ads
 * audit specified. Replace the PLACEHOLDER values before going live — the
 * phone number is used by the above-the-fold Call CTA, so a wrong number
 * costs real leads.
 */
export const site = {
  name: "Nabasrishti",

  /** PLACEHOLDER — replace with the studio's real number. */
  phone: "+91 82404 76980",
  /** PLACEHOLDER — digits only, used for tel: and wa.me links. */
  phoneDigits: "918240476980",

  email: "hello@nabasrishti.in",
  location: "South Kolkata",

  /* --- Audit-specified banner copy ---------------------------------- */

  /** Audit: headline must carry the primary service + location keywords. */
  headline: "Best Interior Design Studio in South Kolkata",
  /** Audit: supporting tagline. */
  tagline: "We don't just design spaces. We design your dreams.",

  /** Audit: key service benefits, surfaced in the banner. */
  serviceHighlights: [
    "Residential Interiors",
    "Commercial Interiors",
    "Space Planning",
    "Turnkey Execution",
  ],

  /**
   * Audit: "If available, highlight the starting price, ongoing offers,
   * discounts, or key USPs."
   *
   * No pricing or offer was supplied, so this carries verifiable USPs only.
   * Add a starting price or current offer here when there is one — e.g.
   * { label: "Interiors from", value: "₹X,XX,XXX" }.
   */
  usps: [
    { label: "Experience", value: "8+ years" },
    { label: "Homes delivered", value: "120+" },
    { label: "Client retention", value: "100%" },
  ],
} as const;

export const telHref = `tel:+${site.phoneDigits}`;
export const whatsappHref = `https://wa.me/${site.phoneDigits}`;
