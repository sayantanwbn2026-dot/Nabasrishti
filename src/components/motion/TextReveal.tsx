import { Fragment } from "react";
import { motion } from "framer-motion";
import { EASE_SOFT, viewportOnce } from "@/lib/motion";

type TextRevealProps = {
  /** Plain text; it is split on whitespace and revealed word by word. */
  text: string;
  className?: string;
  /** Gap between words, in seconds. */
  stagger?: number;
  delay?: number;
};

/**
 * Lifts a block of copy into place one word at a time, each word rising out
 * of its own clipping mask. Used sparingly — one statement per page.
 */
export function TextReveal({
  text,
  className,
  stagger = 0.018,
  delay = 0,
}: TextRevealProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="word-mask">
            <motion.span
              className="word-mask__inner"
              variants={{
                hidden: { y: "105%" },
                show: { y: "0%", transition: { duration: 0.78, ease: EASE_SOFT } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.p>
  );
}
