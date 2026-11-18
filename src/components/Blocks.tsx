import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { ImageComparison } from "./ImageComparison";
import type { ProjectBlock } from "@/lib/content";

/**
 * Renders the CMS content blocks shared by project pages and journal posts,
 * so both page types stay identical in behaviour and styling.
 */

type BlockImage = {
  url?: string;
  alt?: string;
  caption?: string;
  /** Chosen in the CMS. Blank means "whatever shape the file is". */
  ratio?: string;
};

/** The shapes the CMS offers, and whether each one lies on its side. */
export const RATIOS: Record<string, { css: string; landscape: boolean }> = {
  "16:9": { css: "16 / 9", landscape: true },
  "4:3": { css: "4 / 3", landscape: true },
  "1:1": { css: "1 / 1", landscape: false },
  "3:4": { css: "3 / 4", landscape: false },
  "4:5": { css: "4 / 5", landscape: false },
  "9:16": { css: "9 / 16", landscape: false },
};

const isLandscape = (image: BlockImage) =>
  Boolean(image.ratio && RATIOS[image.ratio]?.landscape);

const str = (payload: Record<string, unknown>, key: string, fallback = "") =>
  typeof payload[key] === "string" ? (payload[key] as string) : fallback;

const imageList = (payload: Record<string, unknown>): BlockImage[] =>
  Array.isArray(payload.images) ? (payload.images as BlockImage[]) : [];

export function Frame({ image, index }: { image: BlockImage; index: number }) {
  if (!image?.url) return null;
  const shape = image.ratio ? RATIOS[image.ratio] : undefined;
  const orientation = shape
    ? ` project-detail__frame--${shape.landscape ? "landscape" : "upright"}`
    : "";
  return (
    <motion.figure
      className={`project-detail__frame${orientation}`}
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
        style={shape ? { aspectRatio: shape.css } : undefined}
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
              ratio: str(payload, "ratio"),
            }}
            index={0}
          />
        </div>
      );

    case "gallery": {
      const list = imageList(payload);
      const columns = Number(payload.columns) || 1;

      /* Where the editor has given images a shape, the layout follows it
         rather than a fixed column count: two landscape images sit side by
         side, and an upright one takes the row to itself. Images with no
         shape set fall back to the chosen column count, so galleries built
         before this existed are untouched. */
      const shaped = list.some((image) => image.ratio);
      if (shaped) {
        const rows: BlockImage[][] = [];
        for (const image of list) {
          const open = rows[rows.length - 1];
          if (isLandscape(image) && open?.length === 1 && isLandscape(open[0])) {
            open.push(image);
          } else {
            rows.push([image]);
          }
        }
        return (
          <div className="project-detail__gallery project-detail__gallery--shaped">
            {rows.map((row, rowIndex) => (
              <div
                className={`project-detail__row project-detail__row--${row.length}`}
                key={rowIndex}
              >
                {row.map((image, index) => (
                  <Frame
                    image={image}
                    index={rowIndex + index}
                    key={(image.url ?? "") + index}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      }

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
