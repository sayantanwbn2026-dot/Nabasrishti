import { Reveal } from "./motion";
import type { SiteSettings, SocialLink } from "@/lib/content";

type ContactSectionProps = {
  settings: SiteSettings;
  socials: SocialLink[];
  onEnquire: (context: string) => void;
};

const ICONS = {
  phone:
    "M5.2 2.5 6.6 5 5.3 6.4a8 8 0 0 0 4.3 4.3L11 9.4l2.5 1.4v2.4c0 .4-.3.8-.8.8A10.6 10.6 0 0 1 2.4 3.3c0-.5.4-.8.8-.8h2z",
  mail: "M2.5 4h11c.3 0 .5.2.5.5v7c0 .3-.2.5-.5.5h-11a.5.5 0 0 1-.5-.5v-7c0-.3.2-.5.5-.5Zm.9 1L8 8.4 12.6 5H3.4Z",
  pin: "M8 1.5a4.3 4.3 0 0 0-4.3 4.3c0 3.2 4.3 8.7 4.3 8.7s4.3-5.5 4.3-8.7A4.3 4.3 0 0 0 8 1.5Zm0 5.9a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z",
  clock:
    "M8 1.6a6.4 6.4 0 1 0 0 12.8A6.4 6.4 0 0 0 8 1.6Zm.6 6.6-.2.2-2.6 1.5-.6-1 2.2-1.3V4.3h1.2v3.9Z",
  social:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.3.07 1.69.07 4.9s0 3.6-.07 4.9c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.3.06-1.69.07-4.9.07s-3.6 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2Zm0 5.1a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.75a3.05 3.05 0 1 1 0-6.1 3.05 3.05 0 0 1 0 6.1Zm5.99-7.94a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z",
} as const;

function Glyph({ path, box = 16 }: { path: string; box?: number }) {
  return (
    <span className="contact-row__icon" aria-hidden="true">
      <svg viewBox={`0 0 ${box} ${box}`} focusable="false">
        <path d={path} />
      </svg>
    </span>
  );
}

export function ContactSection({ settings, socials, onEnquire }: ContactSectionProps) {
  const visibleSocials = socials.filter((link) => link.is_published && link.url);
  const telHref = settings.phone_digits ? `tel:+${settings.phone_digits}` : undefined;

  return (
    <section className="contact-section light-section" id="contact">
      <div className="page-shell">
        <Reveal className="contact-section__label">
          <span className="rule" aria-hidden="true" />
          <p className="section-label">{settings.contact_label}</p>
          <span className="rule" aria-hidden="true" />
        </Reveal>

        <div className="contact-layout">
          <Reveal className="contact-details">
            <h2 className="contact-details__heading">{settings.contact_heading}</h2>

            <dl className="contact-rows">
              {settings.phone ? (
                <div className="contact-row">
                  <Glyph path={ICONS.phone} />
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      <a href={telHref}>{settings.phone}</a>
                    </dd>
                  </div>
                </div>
              ) : null}

              {settings.email ? (
                <div className="contact-row">
                  <Glyph path={ICONS.mail} />
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </dd>
                  </div>
                </div>
              ) : null}

              {settings.contact_address ? (
                <div className="contact-row">
                  <Glyph path={ICONS.pin} />
                  <div>
                    <dt>Studio</dt>
                    <dd>{settings.contact_address}</dd>
                  </div>
                </div>
              ) : null}

              {settings.contact_hours ? (
                <div className="contact-row">
                  <Glyph path={ICONS.clock} />
                  <div>
                    <dt>Hours</dt>
                    <dd>{settings.contact_hours}</dd>
                  </div>
                </div>
              ) : null}

              {visibleSocials.length > 0 ? (
                <div className="contact-row">
                  <Glyph path={ICONS.social} box={24} />
                  <div>
                    <dt>Social</dt>
                    <dd className="contact-row__socials">
                      {visibleSocials.map((link) => (
                        <a
                          href={link.url}
                          key={link.id}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label || link.platform}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ))}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>

            <button
              type="button"
              className="button button-dark contact-details__cta"
              onClick={() => onEnquire("Contact section")}
            >
              {settings.cta_primary_label}
            </button>
          </Reveal>

          <Reveal className="contact-map" preset="image" delay={0.08}>
            {settings.map_embed_url ? (
              <>
                {/* Sits behind the map. If the embed is slow, blocked by a
                    privacy extension, or refused by the network, the panel
                    still reads as the studio's location rather than as a
                    grey hole. */}
                <div className="contact-map__fallback" aria-hidden="true">
                  <svg viewBox="0 0 16 16" focusable="false">
                    <path d="M8 1.5a4.3 4.3 0 0 0-4.3 4.3c0 3.2 4.3 8.7 4.3 8.7s4.3-5.5 4.3-8.7A4.3 4.3 0 0 0 8 1.5Zm0 5.9a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z" />
                  </svg>
                  <span>{settings.contact_address || settings.location}</span>
                </div>
                <iframe
                  src={settings.map_embed_url}
                  title={`Map showing ${settings.name} in ${settings.contact_address || settings.location}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
                {settings.map_link_url ? (
                  <a
                    className="contact-map__link"
                    href={settings.map_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : null}
              </>
            ) : (
              <p className="contact-map__empty">
                Add a map link in the content manager.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
