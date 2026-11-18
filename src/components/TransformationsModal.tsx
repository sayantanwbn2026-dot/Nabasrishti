import { motion } from "framer-motion";
import { useId } from "react";
import { Modal } from "./Modal";
import { ImageComparison } from "./ImageComparison";
import { EASE_OUT } from "@/lib/motion";
import type { SiteSettings, Transformation } from "@/lib/content";

type TransformationsModalProps = {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
  items: Transformation[];
  onEnquire: (context: string) => void;
};

/**
 * The full set of before/after pairings, opened from the home page's
 * "From Concept to Creation" band.
 *
 * Built on the same fullscreen shell as a project page, so the two read as
 * the same kind of place rather than as a page and a pop-up.
 */
export function TransformationsModal({
  open,
  onClose,
  settings,
  items,
  onEnquire,
}: TransformationsModalProps) {
  const headingId = useId();
  const visible = items.filter(
    (item) => item.is_published && (item.before_url || item.after_url),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={headingId}
      panelClassName="modal__panel-dark project-detail transformations-detail"
      fullscreen
      closeLabel="Close transformations"
    >
      <article className="project-detail__inner">
        <header className="project-detail__head">
          <p className="section-label">{settings.transformations_label}</p>
          <h2 id={headingId}>{settings.transformations_heading}</h2>
          {settings.transformations_intro ? (
            <p className="transformations-detail__intro">
              {settings.transformations_intro}
            </p>
          ) : null}
        </header>

        {visible.length > 0 ? (
          <div className="transformations-detail__list">
            {visible.map((item, index) => (
              <motion.figure
                className="transformations-detail__item"
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <ImageComparison
                  beforeUrl={item.before_url}
                  afterUrl={item.after_url}
                  beforeAlt={item.before_alt}
                  afterAlt={item.after_alt || item.title || "Finished interior"}
                  beforeLabel="Concept"
                  afterLabel="Built"
                  /* The first pair is on screen the moment the page opens;
                     the rest can wait until they are scrolled to. */
                  eager={index === 0}
                />
                {item.title || item.caption ? (
                  <figcaption className="transformations-detail__caption">
                    {item.title ? <h3>{item.title}</h3> : null}
                    {item.caption ? <p>{item.caption}</p> : null}
                  </figcaption>
                ) : null}
              </motion.figure>
            ))}
          </div>
        ) : (
          <p className="transformations-detail__empty">
            More pairings are on their way. In the meantime, every project in
            the gallery carries the drawings it grew from.
          </p>
        )}

        <footer className="project-detail__foot">
          <p className="project-detail__cta-copy">
            Have a room you would like to see change?
          </p>
          <button
            type="button"
            className="button button-light"
            onClick={() => onEnquire("Transformations gallery")}
          >
            {settings.cta_primary_label}
          </button>
        </footer>
      </article>
    </Modal>
  );
}
