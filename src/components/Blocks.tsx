import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { ImageComparison } from "./ImageComparison";
import type { ProjectBlock } from "@/lib/content";

/**
 * Renders the CMS content blocks shared by project pages and journal posts,
 * so both page types stay identical in behaviour and styling.
 */

type BlockImage = { url?: string; alt?: string; caption?: string };

const str = (payload: Record<string, unknown>, key: string, fallback = "") =>
  typeof payload[key] === "string" ? (payload[key] as string) : fallback;

const imageList = (payload: Record<string, unknown>): BlockImage[] =>
  Array.isArray(payload.images) ? (payload.images as BlockImage[]) : [];

export function Frame({ image, index }: { image: BlockImage; index: number }) {
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

export function Block({ block }: { block: ProjectBlock }) {
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
      const list = imageList(payload);
      const columns = Number(payload.columns) || 1;
      return (
        <div
          className="project-detail__gallery"
          style={
            columns > 1
              ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
              : undefined
          }
        >
          {list.map((image, index) => (
            <Frame image={image} index={index} key={(image.url ?? "") + index} />
          ))}
        </div>
      );
    }

    case "split": {
      const list = imageList(payload);
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

    case "compare": {
      /* A before/after wipe inside the page. The caption sits under the
         frame so the labels on the image itself can stay short. */
      const caption = str(payload, "caption");
      return (
        <figure className="project-detail__compare">
          <ImageComparison
            beforeUrl={str(payload, "before_url")}
            afterUrl={str(payload, "after_url")}
            beforeAlt={str(payload, "before_alt")}
            afterAlt={str(payload, "after_alt", "Finished interior")}
            beforeLabel={str(payload, "before_label", "Concept")}
            afterLabel={str(payload, "after_label", "Built")}
          />
          {caption ? (
            <figcaption className="project-detail__caption">{caption}</figcaption>
          ) : null}
        </figure>
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

export function Blocks({ blocks }: { blocks: ProjectBlock[] }) {
  const visible = blocks.filter((block) => block.is_published);
  if (visible.length === 0) return null;
  return (
    <div className="project-detail__blocks">
      {visible.map((block) => (
        <Block block={block} key={block.id} />
      ))}
    </div>
  );
}
