import { motion } from "framer-motion";
import { useId } from "react";
import { Modal } from "./Modal";
import { EASE_OUT } from "@/lib/motion";
import type { Project } from "@/data/projects";

type ProjectModalProps = {
  project: Project | null;
  onClose: () => void;
  /** Hands the visitor to the enquiry form, carrying the project name. */
  onEnquire: (project: Project) => void;
};

export function ProjectModal({ project, onClose, onEnquire }: ProjectModalProps) {
  const headingId = useId();

  return (
    <Modal
      open={Boolean(project)}
      onClose={onClose}
      labelledBy={headingId}
      panelClassName="modal__panel-dark project-detail"
      fullscreen
      closeLabel="Close project"
    >
      {project ? (
        <article className="project-detail__inner">
          <header className="project-detail__head">
            <p className="section-label">
              {project.typology} · {project.location} · {project.year}
            </p>
            <h2 id={headingId}>{project.title}</h2>
          </header>

          <div className="project-detail__body">
            <p className="project-detail__narrative">{project.narrative}</p>

            <dl className="project-detail__scope">
              <dt className="section-label">Scope</dt>
              {project.scope.map((item) => (
                <dd key={item}>{item}</dd>
              ))}
            </dl>
          </div>

          {/* One column of consistent frames: the photographs vary in crop,
              and a masonry grid would make that look accidental. */}
          <div className="project-detail__gallery">
            {project.gallery.map((image, index) => (
              <motion.figure
                className="project-detail__frame"
                key={image.src + index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </motion.figure>
            ))}
          </div>

          <footer className="project-detail__foot">
            <p className="project-detail__cta-copy">Planning something similar?</p>
            <button
              type="button"
              className="button button-light"
              onClick={() => onEnquire(project)}
            >
              Start your project
            </button>
          </footer>
        </article>
      ) : null}
    </Modal>
  );
}
