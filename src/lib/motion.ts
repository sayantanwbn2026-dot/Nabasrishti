import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion tokens. The easing curves mirror the ones already used in
 * index.css so CSS transitions and JS animations feel like one system.
 */
export const EASE_OUT = [0.2, 0.65, 0.3, 1] as const;
export const EASE_SOFT = [0.2, 0.7, 0.2, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 0.95,
} as const;

/** How far an element travels on reveal. Deliberately small — this is a nudge. */
export const TRAVEL = 18;

export const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_OUT,
};

/** Default viewport trigger: fire once, slightly before the element is centred. */
export const viewportOnce = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -10% 0px",
} as const;

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: TRAVEL },
  show: { opacity: 1, y: 0, transition: baseTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.slow, ease: EASE_OUT } },
};

/** Images settle in with a whisper of scale rather than a slide. */
export const imageSettle: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});
