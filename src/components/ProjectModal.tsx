import { motion } from "framer-motion";
import { useId } from "react";
import { Modal } from "./Modal";
import { EASE_OUT } from "@/lib/motion";
import type { CmsProject, ProjectBlock } from "@/lib/content";

type ProjectModalProps = {
  project: CmsProject | null;
  onClose: () => void;
  /** Hands the visitor to the enquiry form, carrying the project name. */
  onEnquire: (project: CmsProject) => void;
};

type BlockImage = { url?: string; alt?: string; caption?: string };

/** Payload readers that tolerate whatever the CMS has stored. */
const str = (payload: Record<string, unknown>, key: string, fallback = "") =>
  typeof payload[key] === "string" ? (payload[key] as string) : fallback;

const images = (payload: Record<string, unknown>): BlockImage[] =>
  Array.isArray(payload.images) ? (payload.images as BlockImage[]) : [];

function Frame({ image, index }: { image: BlockImage; index: number }) {
  if (!image?.url) return null;
  return (
    <motion.figure
      className="project-detail__frame"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <img
        src={image.url}
        alt={image.alt ?? ""}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
      />
      {image.caption ? (
        <figcaption className="project-detail__caption">{image.caption}</figcaption>
      ) : null}
    </motion.figure>
  );
}

/** Renders one CMS block. Unknown types are skipped rather than crashing. */
function Block({ block }: { block: ProjectBlock }) {
  const payload = block.payload ?? {};

  switch (block.type) {
    case "heading":
      return <h3 className="project-detail__block-heading">{str(payload, "text")}</h3>;

    case "text":
      return <p className="project-detail__block-text">{str(payload, "text")}</p>;

    case "quote":
      return (
        <blockquote className="project-detail__quote">
          <p>{str(payload, "text")}</p>
          {str(payload, "attribution") ? (
            <cite>{str(payload, "attribution")}</cite>
          ) : null}
        </blockquote>
      );

    case "image":
      return (
        <div className="project-detail__gallery">
          <Frame
            image={{
              url: str(payload, "url"),
              alt: str(payload, "alt"),
              caption: str(payload, "caption"),
            }}
            index={0}
          />
        </div>
      );

    case "gallery": {
      const list = images(payload);
      const columns = Number(payload.columns) || 1;
      return (
        <div
          className="project-detail__gallery"
          style={columns > 1 ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}
        >
          {list.map((image, index) => (
            <Frame image={image} index={index} key={(image.url ?? "") + index} />
          ))}
        </div>
      );
    }

    case "split": {
      const list = images(payload);
      return (
        <div className="project-detail__split">
          <div className="project-detail__split-copy">
            {str(payload, "heading") ? <h3>{str(payload, "heading")}</h3> : null}
            <p>{str(payload, "text")}</p>
          </div>
          <Frame image={list[0] ?? {}} index={0} />
        </div>
      );
    }

    case "specs": {
      const rows = Array.isArray(payload.rows)
        ? (payload.rows as { label?: string; value?: string }[])
        : [];
      return (
        <dl className="project-detail__specs">
          {rows.map((row, index) => (
            <div key={(row.label ?? "") + index}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      );
    }

    case "spacer":
      return (
        <div
          className="project-detail__spacer"
          style={{ height: `${Number(payload.height) || 48}px` }}
          aria-hidden="true"
        />
      );

    default:
      return null;
  }
}

export function ProjectModal({ project, onClose, onEnquire }: ProjectModalProps) {
  const headingId = useId();
  const blocks = (project?.blocks ?? []).filter((block) => block.is_published);

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

          {/* Everything below the intro is composed in the CMS. */}
          <div className="project-detail__blocks">
            {blocks.map((block) => (
              <Block block={block} key={block.id} />
            ))}
          </div>

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
