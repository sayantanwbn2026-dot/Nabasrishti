import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import {
  baseTransition,
  fadeIn,
  fadeRise,
  imageSettle,
  staggerParent,
  viewportOnce,
} from "@/lib/motion";

type Preset = "rise" | "fade" | "image";

const presets: Record<Preset, Variants> = {
  rise: fadeRise,
  fade: fadeIn,
  image: imageSettle,
};

/**
 * motion.create() builds a brand-new component type on each call, which would
 * remount the subtree on every render — so results are cached per element.
 */
const componentCache = new Map<ElementType, typeof motion.div>();

function motionComponent(as?: ElementType): typeof motion.div {
  if (!as) return motion.div;
  const cached = componentCache.get(as);
  if (cached) return cached;
  const created = motion.create(as as "div") as typeof motion.div;
  componentCache.set(as, created);
  return created;
}

type RevealProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  /** Which motion feel to use. Defaults to a short fade + rise. */
  preset?: Preset;
  /** Seconds to hold before starting, for hand-tuned section rhythm. */
  delay?: number;
  /** Render as a different element (section, figure, li…). */
  as?: ElementType;
  children?: ReactNode;
};

/**
 * Reveals its children once, the first time they scroll into view.
 * Reduced-motion users get the final state immediately — see <MotionConfig
 * reducedMotion="user"> in main.tsx.
 */
export function Reveal({
  preset = "rise",
  delay = 0,
  as,
  children,
  ...rest
}: RevealProps) {
  const Component = motionComponent(as);

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={presets[preset]}
      transition={{ ...baseTransition, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

type StaggerProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  /** Gap between each child's start, in seconds. */
  stagger?: number;
  delay?: number;
  as?: ElementType;
  children?: ReactNode;
};

/**
 * Parent for a row or grid: children wrapped in <RevealItem> arrive one after
 * another instead of all at once.
 */
export function Stagger({
  stagger = 0.08,
  delay = 0,
  as,
  children,
  ...rest
}: StaggerProps) {
  const Component = motionComponent(as);

  return (
    <Component
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={staggerParent(stagger, delay)}
      {...rest}
    >
      {children}
    </Component>
  );
}

type RevealItemProps = Omit<HTMLMotionProps<"div">, "variants"> & {
  preset?: Preset;
  as?: ElementType;
  children?: ReactNode;
};

/** A single child of <Stagger>. Inherits the parent's timing. */
export function RevealItem({
  preset = "rise",
  as,
  children,
  ...rest
}: RevealItemProps) {
  const Component = motionComponent(as);

  return (
    <Component variants={presets[preset]} {...rest}>
      {children}
    </Component>
  );
}
