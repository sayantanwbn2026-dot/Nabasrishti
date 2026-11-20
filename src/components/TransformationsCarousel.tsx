import { AnimatePresence, motion } from "framer-motion";
import { useId, useState } from "react";
import { ImageComparison } from "./ImageComparison";
import { EASE_OUT } from "@/lib/motion";
import type { SiteSettings, Transformation } from "@/lib/content";

type Props = {
  settings: SiteSettings;
  items: Transformation[];
};

/**
 * The before/after pairs, one at a time, stepped through in place.
 *
 * These used to live behind a button that opened a full page of sliders.
 * Asking someone to leave the home page to see the second example was a
 * lot to charge for it, so the section steps through them instead.
 */
export function TransformationsCarousel({ settings, items }: Props) {
  const headingId = useId();
  const [index, setIndex] = useState(0);
  /* Which way the last step went, so the outgoing pair leaves the side the
     new one came from rather than always the same side. */
  const [direction, setDirection] = useState(1);

  const pairs = items.filter(
    (item) => item.is_published && (item.before_url || item.after_url),
  );

  /* With nothing in the collection the section still has something to
     show: the single pair that lives in the site settings. */
  const slides: Transformation[] =
    pairs.length > 0
      ? pairs
      : [
          {
            id: "settings",
            title: "",
            caption: "",
            before_url: settings.comparison_before_url,
            before_alt: "",
            after_url: settings.comparison_after_url,
            after_alt: "",
            position: 0,
            is_published: true,
          },
        ];

  const total = slides.length;
  const current = slides[Math.min(index, total - 1)];
  const many = total > 1;

  const step = (delta: number) => {
    setDirection(delta);
    // Wraps, so neither button is ever a dead end.
    setIndex((at) => (at + delta + total) % total);
  };

  return (
    <div className="carousel" role="group" aria-roledescription="carousel" aria-labelledby={headingId}>
      <span className="visually-hidden" id={headingId}>
        {settings.comparison_heading}
      </span>

      {/* Arrows flank the picture rather than sitting under it. Keeping
          them outside the frame also keeps them off the comparison
          slider's handle, which travels the full width of the image. */}
      <div className={`carousel__viewport${many ? " carousel__viewport--stepped" : ""}`}>
        {many ? (
          <button
            type="button"
            className="carousel__arrow carousel__arrow--prev"
            onClick={() => step(-1)}
            aria-label="Previous transformation"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M12 4 6 10l6 6" />
            </svg>
          </button>
        ) : null}

        <div className="carousel__stage">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              className="carousel__slide"
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.42, ease: EASE_OUT }}
            >
              <ImageComparison
                beforeUrl={current.before_url}
                afterUrl={current.after_url}
                beforeAlt={current.before_alt}
                afterAlt={current.after_alt || current.title || "Finished interior"}
                beforeLabel={settings.comparison_before_label}
                afterLabel={settings.comparison_after_label}
                eager={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {many ? (
          <button
            type="button"
            className="carousel__arrow carousel__arrow--next"
            onClick={() => step(1)}
            aria-label="Next transformation"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="m8 4 6 6-6 6" />
            </svg>
          </button>
        ) : null}
      </div>

      {many ? (
        /* Announced on change so the position is not sighted-only. */
        <p className="carousel__count" aria-live="polite" aria-atomic="true">
          <span className="carousel__count-now">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="carousel__count-sep" aria-hidden="true">
            /
          </span>
          <span className="carousel__count-all">
            {String(total).padStart(2, "0")}
          </span>
          <span className="visually-hidden">
            {current.title ? ` — ${current.title}` : ""}
          </span>
        </p>
      ) : null}

      {current.title || current.caption ? (
        <div className="carousel__caption">
          {current.title ? <h3>{current.title}</h3> : null}
          {current.caption ? <p>{current.caption}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
