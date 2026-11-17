import { site, telHref, whatsappHref } from "@/data/site";

/**
 * Dedicated Thank You page (Ads audit item 7).
 *
 * Form submission redirects here with a real navigation, so Google Ads can
 * use the URL as a destination conversion. Keep the path stable: the Ads
 * conversion is configured against /thank-you.
 */
export function ThankYouPage() {
  return (
    <main className="thank-you dark-section">
      <div className="page-shell thank-you__inner">
        <a className="site-brand thank-you__brand" href="/">
          {site.name}
        </a>

        <div className="thank-you__body">
          <p className="section-label">Enquiry received</p>
          <h1>Thank you — your enquiry is with our team.</h1>
          <p className="thank-you__lede">
            A designer from the studio will call you within one working day to
            understand your space and talk through next steps.
          </p>

          <dl className="thank-you__next">
            <dt className="section-label">What happens next</dt>
            <dd>We call you to understand the brief and your timeline.</dd>
            <dd>We share indicative costs and a site-visit slot.</dd>
            <dd>You meet the design team — no obligation.</dd>
          </dl>

          <div className="thank-you__actions">
            <a className="button button-light" href={telHref}>
              Call {site.phone}
            </a>
            <a
              className="button button-outline"
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message on WhatsApp
            </a>
          </div>

          <a className="thank-you__back" href="/">
            Back to the studio
          </a>
        </div>
      </div>
    </main>
  );
}
