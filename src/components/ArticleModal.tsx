import { useId } from "react";
import { Modal } from "./Modal";
import { Blocks } from "./Blocks";
import type { Article } from "@/lib/content";

type ArticleModalProps = {
  article: Article | null;
  onClose: () => void;
  onEnquire: (article: Article) => void;
};

/**
 * Journal posts open the same way projects do: a full-screen reading page
 * composed from CMS blocks, rather than a link to nowhere.
 */
export function ArticleModal({ article, onClose, onEnquire }: ArticleModalProps) {
  const headingId = useId();

  return (
    <Modal
      open={Boolean(article)}
      onClose={onClose}
      labelledBy={headingId}
      panelClassName="modal__panel-dark project-detail"
      fullscreen
      closeLabel="Close post"
    >
      {article ? (
        <article className="project-detail__inner">
          <header className="project-detail__head">
            <p className="section-label">
              {[article.date_label, article.author, article.read_minutes
                ? `${article.read_minutes} min read`
                : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h2 id={headingId}>{article.title}</h2>
          </header>

          <div
            className={`project-detail__body project-detail__body--${article.detail_layout}`}
          >
            {article.excerpt ? (
              <p className="project-detail__narrative">{article.excerpt}</p>
            ) : null}
          </div>

          <Blocks blocks={article.blocks ?? []} />

          {article.show_cta ? (
            <footer className="project-detail__foot">
              <p className="project-detail__cta-copy">
                Thinking about your own space?
              </p>
              <button
                type="button"
                className="button button-light"
                onClick={() => onEnquire(article)}
              >
                {article.cta_label || "Start your project"}
              </button>
            </footer>
          ) : null}
        </article>
      ) : null}
    </Modal>
  );
}
