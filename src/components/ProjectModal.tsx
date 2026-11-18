import { useId } from "react";
import { Modal } from "./Modal";
import { Blocks } from "./Blocks";
import type { CmsProject } from "@/lib/content";

type ProjectModalProps = {
  project: CmsProject | null;
  onClose: () => void;
  /** Hands the visitor to the enquiry form, carrying the project name. */
  onEnquire: (project: CmsProject) => void;
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
              {[project.typology, project.location, project.year]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h2 id={headingId}>{project.title}</h2>
          </header>

          <div
            className={`project-detail__body project-detail__body--${project.detail_layout}`}
          >
            {project.narrative ? (
              <p className="project-detail__narrative">{project.narrative}</p>
            ) : null}

            {project.show_scope && project.scope.length > 0 ? (
              <dl className="project-detail__scope">
                <dt className="section-label">Scope</dt>
                {project.scope.map((item) => (
                  <dd key={item}>{item}</dd>
                ))}
              </dl>
            ) : null}
          </div>

          {/* Everything below the intro is composed in the CMS, through the
              same renderer the journal uses. */}
          <Blocks blocks={project.blocks ?? []} />

          {project.show_cta ? (
            <footer className="project-detail__foot">
              <p className="project-detail__cta-copy">Planning something similar?</p>
              <button
                type="button"
                className="button button-light"
                onClick={() => onEnquire(project)}
              >
                {project.cta_label || "Start your project"}
              </button>
            </footer>
          ) : null}
        </article>
      ) : null}
    </Modal>
  );
}
