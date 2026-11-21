/**
 * Remembers where a visitor came from, for the lead sheet.
 *
 * An enquiry on its own says nothing about which advert paid for it. The
 * campaign is in the URL when the visitor first lands and gone the moment
 * they click anything, so it is read once on arrival and kept for the rest
 * of the visit.
 *
 * Held in sessionStorage rather than localStorage on purpose: it should
 * describe *this* visit. A lead arriving today should not be credited to
 * a campaign the same person clicked three weeks ago.
 */
const KEY = "nabasrishti:attribution";

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  /** Google Ads click id, the one that ties a lead to a click. */
  gclid: string;
  /** Where they were before, when the browser tells us. */
  referrer: string;
  /** The page the visit started on, which the enquiry page may not be. */
  landing_page: string;
};

const EMPTY: Attribution = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_term: "",
  utm_content: "",
  gclid: "",
  referrer: "",
  landing_page: "",
};

/** Long values are almost always junk or an attack; keep them sane. */
const clip = (value: string | null) => (value ?? "").slice(0, 200);

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Attribution>) };
  } catch {
    // Private browsing, or someone has put nonsense in the key.
    return null;
  }
}

/** Whether a record actually names a campaign, rather than just a page. */
const hasCampaign = (a: Attribution) =>
  Boolean(a.gclid || a.utm_source || a.utm_campaign || a.utm_medium);

/**
 * Call once per page load, as early as possible.
 *
 * The first campaign wins: a visitor who arrives from an advert and then
 * wanders the site still belongs to that advert, and the query string is
 * long gone by the time they open the form.
 *
 * The first *landing* is not the same thing. Someone can open the site
 * directly, then click an advert for it an hour later in the same tab —
 * so a stored record naming no campaign never blocks a real one, or that
 * click would go uncredited.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const existing = read();
  if (existing && hasCampaign(existing)) return;

  const params = new URLSearchParams(window.location.search);
  const captured: Attribution = {
    utm_source: clip(params.get("utm_source")),
    utm_medium: clip(params.get("utm_medium")),
    utm_campaign: clip(params.get("utm_campaign")),
    utm_term: clip(params.get("utm_term")),
    utm_content: clip(params.get("utm_content")),
    gclid: clip(params.get("gclid")),
    referrer: clip(document.referrer),
    landing_page: clip(window.location.pathname + window.location.search),
  };

  /* Nothing new to learn: keep the first landing's page and referrer
     rather than overwriting them with the current page. */
  if (existing && !hasCampaign(captured)) return;

  try {
    sessionStorage.setItem(KEY, JSON.stringify(captured));
  } catch {
    // Storage blocked. The enquiry still sends, just without the campaign.
  }
}

/** What was captured on arrival, or blanks if there was nothing to catch. */
export function getAttribution(): Attribution {
  return read() ?? { ...EMPTY };
}
