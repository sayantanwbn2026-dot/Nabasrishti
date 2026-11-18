import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_OUT, EASE_SOFT } from "@/lib/motion";
import type { SiteSettings, SocialLink } from "@/lib/content";

/* ---------------------------------------------------------------------
   Floating WhatsApp button
   ------------------------------------------------------------------ */

export function WhatsAppFab({ settings }: { settings: SiteSettings }) {
  const [visible, setVisible] = useState(false);

  // Appears once the visitor has committed to the page, so it does not
  // land on top of the hero the moment it loads.
  useEffect(() => {
    const show = () => setVisible(window.scrollY > 320);
    show();
    window.addEventListener("scroll", show, { passive: true });
    return () => window.removeEventListener("scroll", show);
  }, []);

  if (!settings.whatsapp_enabled_fab || !settings.phone_digits) return null;

  const href = `https://wa.me/${settings.phone_digits}?text=${encodeURIComponent(
    settings.whatsapp_message || "",
  )}`;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          className="wa-fab"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          initial={{ opacity: 0, scale: 0.86, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.86, y: 10 }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
          </svg>
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------
   Logo preloader
   ------------------------------------------------------------------ */

export function Preloader({
  settings,
  /* True while the query is still serving its built-in placeholder. The
     placeholder carries no logo, so the mark would render as the plain
     wordmark and then swap to the real lockup a moment later — two
     different curtains in a row. The curtain itself goes up instantly
     either way; only the mark inside it waits. */
  pending = false,
}: {
  settings: SiteSettings;
  pending?: boolean;
}) {
  const [done, setDone] = useState(false);

  const hold = Math.max(0, settings.preloader_duration_ms || 0);

  useEffect(() => {
    /* The set duration is the duration. Waiting on `load` as well made the
       curtain outlast it by however long the images took — measured at
       nearly nine seconds for a six second setting. */
    const timer = window.setTimeout(() => setDone(true), hold);
    return () => window.clearTimeout(timer);
  }, [hold]);

  // The page behind must not scroll while the curtain is up.
  useEffect(() => {
    if (done) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [done]);

  if (!settings.preloader_enabled) return null;

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          aria-hidden="true"
        >
          <motion.div
            className="preloader__mark"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: pending ? 0 : 1, y: pending ? 8 : 0 }}
            transition={{ duration: 0.7, ease: EASE_SOFT }}
          >
            {settings.logo_dark_url || settings.logo_url ? (
              <img
                /* The curtain is the paper tone, so this wants the full
                   lockup with its dark wordmark, not the nav's mark. */
                src={settings.logo_dark_url || settings.logo_url}
                alt=""
                className="preloader__logo"
              />
            ) : (
              <span className="preloader__wordmark">{settings.name}</span>
            )}
            <span className="preloader__bar">
              <span style={{ animationDuration: `${hold}ms` }} />
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------
   Footer social links
   ------------------------------------------------------------------ */

const ICONS: Record<string, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.3.07 1.69.07 4.9s0 3.6-.07 4.9c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.3.06-1.69.07-4.9.07s-3.6 0-4.9-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.4 2.21 8.8 2.2 12 2.2Zm0 5.1a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.75a3.05 3.05 0 1 1 0-6.1 3.05 3.05 0 0 1 0 6.1Zm5.99-7.94a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z",
  facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.54-1.5h1.65V3.63A22 22 0 0 0 14.28 3.5c-2.38 0-4.01 1.45-4.01 4.12v2.28H7.6V13h2.67v8h3.23Z",
  linkedin:
    "M6.94 8.4H3.86V21h3.08V8.4ZM5.4 3a1.79 1.79 0 1 0 0 3.57A1.79 1.79 0 0 0 5.4 3ZM21 13.8c0-3.3-1.76-4.84-4.11-4.84-1.9 0-2.74 1.04-3.21 1.78V8.4H10.6c.04.87 0 12.6 0 12.6h3.08v-7.04c0-.33.02-.66.12-.9.26-.66.87-1.35 1.88-1.35 1.33 0 1.86 1.01 1.86 2.49V21H21v-7.2Z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z",
  x: "M17.53 3H20l-5.4 6.17L21 21h-5.06l-3.96-5.2L7.44 21H5l5.78-6.6L4.5 3h5.19l3.58 4.74L17.53 3Zm-.87 16.5h1.37L8.4 4.4H6.93l9.73 15.1Z",
  pinterest:
    "M12 2.2a9.8 9.8 0 0 0-3.57 18.93c-.08-.76-.16-1.94.03-2.78.18-.78 1.16-4.93 1.16-4.93s-.3-.6-.3-1.48c0-1.39.8-2.42 1.8-2.42.86 0 1.27.64 1.27 1.41 0 .86-.55 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.87 3.14-4.57 0-2.39-1.72-4.06-4.17-4.06a4.32 4.32 0 0 0-4.5 4.33c0 .86.33 1.78.74 2.28.08.1.09.19.07.29l-.28 1.13c-.04.18-.14.22-.33.13-1.25-.58-2.03-2.4-2.03-3.87 0-3.15 2.29-6.04 6.6-6.04 3.46 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.37c-.22.86-.83 1.94-1.24 2.6A9.8 9.8 0 1 0 12 2.2Z",
};

export function SocialLinks({ links }: { links: SocialLink[] }) {
  const visible = links.filter((link) => link.is_published && link.url);
  if (visible.length === 0) return null;

  return (
    <ul className="social-links" aria-label="Social media">
      {visible.map((link) => {
        const path = ICONS[link.platform.toLowerCase()];
        return (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label || link.platform}
              title={link.label || link.platform}
            >
              {path ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d={path} />
                </svg>
              ) : (
                <span>{link.label || link.platform}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
