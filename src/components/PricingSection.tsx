import { Reveal, RevealItem, Stagger } from "./motion";
import type { PricingPackage, SiteSettings } from "@/lib/content";

type Props = {
  settings: SiteSettings;
  packages: PricingPackage[];
  onEnquire: (context: string) => void;
};

/**
 * What a project costs, on the page rather than behind an enquiry.
 *
 * Most of the traffic here arrives from an advert having already decided
 * to spend something; the question they came with is how much. Burying
 * that behind a form costs the studio the enquiries it wants and fills
 * the inbox with the ones it does not.
 *
 * Each package's button carries its own name into the enquiry, so the
 * Enquiries list shows which package produced the lead rather than
 * recording every one of them as "Pricing".
 */
export function PricingSection({ settings, packages, onEnquire }: Props) {
  const visible = packages.filter((item) => item.is_published);
  if (visible.length === 0) return null;

  return (
    <section className="pricing-section light-section" id="pricing">
      <div className="page-shell">
        <Reveal className="section-heading pricing-heading">
          <div>
            <p className="section-label">{settings.pricing_label}</p>
            <h2>{settings.pricing_heading}</h2>
          </div>
          {settings.pricing_aside ? (
            <p className="section-aside">{settings.pricing_aside}</p>
          ) : null}
        </Reveal>

        {settings.pricing_offer ? (
          <Reveal className="pricing-offer" delay={0.04}>
            <span className="pricing-offer__flag">Offer</span>
            <p>{settings.pricing_offer}</p>
          </Reveal>
        ) : null}

        <Stagger className="pricing-grid" stagger={0.08}>
          {visible.map((item) => (
            <RevealItem
              as="article"
              className={`pricing-card${item.badge ? " pricing-card--featured" : ""}`}
              key={item.id}
            >
              {item.badge ? (
                <p className="pricing-card__badge">{item.badge}</p>
              ) : null}

              <h3 className="pricing-card__name">{item.name}</h3>

              <p className="pricing-card__price">
                {item.price_prefix ? (
                  <span className="pricing-card__prefix">{item.price_prefix}</span>
                ) : null}
                <span className="pricing-card__figure">{item.price}</span>
                {item.price_unit ? (
                  <span className="pricing-card__unit">{item.price_unit}</span>
                ) : null}
              </p>

              {item.summary ? (
                <p className="pricing-card__summary">{item.summary}</p>
              ) : null}

              {item.inclusions.length > 0 ? (
                <ul className="pricing-card__list">
                  {item.inclusions.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                className={`button ${item.badge ? "button-dark" : "button-outline-dark"} pricing-card__cta`}
                onClick={() => onEnquire(`Pricing — ${item.name}`)}
              >
                {item.cta_label || settings.cta_pricing_label}
              </button>
            </RevealItem>
          ))}
        </Stagger>

        {settings.pricing_note ? (
          <Reveal as="p" className="pricing-note" delay={0.1}>
            {settings.pricing_note}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
