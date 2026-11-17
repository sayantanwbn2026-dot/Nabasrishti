import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode, type RefObject } from "react";

/** Spring settings shared by every parallax layer, so they drift in step. */
const SPRING = { stiffness: 120, damping: 30, restDelta: 0.001 } as const;

/**
 * Progress of `ref` crossing the viewport (0 = entering, 1 = leaving),
 * smoothed so the drift does not track the wheel 1:1 — the jitter that makes
 * cheap parallax feel cheap.
 */
function useFrameProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useSpring(scrollYProgress, SPRING);
}

type ParallaxImageProps = HTMLMotionProps<"img"> & {
  /** Drift distance as a share of the frame, e.g. 0.07 = ±7%. Keep it small. */
  strength?: number;
  /** Extra scale applied while the pointer is over the image's link. */
  hoverScale?: number;
};

/**
 * Drifts a cover image against the page as its frame crosses the viewport.
 * The image is over-scaled so the drift never exposes an edge.
 */
export function ParallaxImage({
  strength = 0.07,
  hoverScale,
  style,
  ...imgProps
}: ParallaxImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const reduceMotion = useReducedMotion();
  const progress = useFrameProgress(ref);

  const offset = strength * 100;
  const y = useTransform(progress, [0, 1], [`${-offset}%`, `${offset}%`]);
  /* The image travels +/- `strength` of its own height, so it must be
     oversized by more than twice that or an edge shows. At 2.2x the margin
     was under a pixel at the extremes and a fast scroll exposed the panel
     behind. 3x leaves half the travel again as headroom, and the small
     constant keeps a few pixels in hand on short frames and fractional
     device pixel ratios. */
  const baseScale = 1 + strength * 3 + 0.015;

  // No drift at all when the OS asks for reduced motion.
  if (reduceMotion) {
    return <motion.img ref={ref} style={style} {...imgProps} />;
  }

  return (
    <motion.img
      ref={ref}
      style={{ y, scale: baseScale, ...style }}
      whileHover={hoverScale ? { scale: baseScale * hoverScale } : undefined}
      transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 1] }}
      {...imgProps}
    />
  );
}

type ParallaxProps = Omit<HTMLMotionProps<"div">, "style"> & {
  /** Pixels of travel across the full crossing, split either side of centre. */
  distance?: number;
  /** Positive drifts with the scroll (slower); negative drifts against it. */
  direction?: 1 | -1;
  className?: string;
  children?: ReactNode;
};

/**
 * Parallax for anything that is not a cover image — a caption, a card, an
 * oversized wordmark. Moves in pixels rather than percentages so small
 * elements drift by the same visible amount as large ones.
 */
export function Parallax({
  distance = 40,
  direction = 1,
  className,
  children,
  ...rest
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const progress = useFrameProgress(ref);

  const travel = (distance / 2) * direction;
  const y = useTransform(progress, [0, 1], [travel, -travel]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }} {...rest}>
      {children}
    </motion.div>
  );
}
