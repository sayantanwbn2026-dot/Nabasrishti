import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Expo-out: quick to start, long settle. Keeps the page feeling weighted. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  // Honour the OS setting: native scrolling, no interpolation, no hijack.
  if (reduceMotion) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        easing: easeOutExpo,
        /* Off: its anchor handling moved to the target in a single frame,
           so in-page links read as a hard cut. useSmoothAnchors does the
           travel instead, and still leans on scroll-padding-top for the
           header offset. */
        anchors: false,
        // Trackpads and mice are interpolated; touch keeps the native feel,
        // which is what users actually expect on a phone.
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.6,
        wheelMultiplier: 1,
        overscroll: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
