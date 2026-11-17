import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Animates in-page anchor jumps.
 *
 * Lenis's own `anchors` option was landing on the right element but moving
 * there in a single frame, so the navigation read as a hard cut. Handling
 * the click here gives the travel an explicit duration and keeps every
 * in-page link — navigation, mobile sheet, footer, the hero's scroll cue —
 * behaving the same way.
 *
 * Offsets are left to the CSS `scroll-padding-top`, which Lenis honours and
 * which already tracks the header height at each breakpoint.
 */
export function useSmoothAnchors() {
  const lenis = useLenis();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Let the browser handle modified clicks (new tab, download, …).
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || !href.startsWith("#") || href === "#") return;

      let target: Element | null = null;
      try {
        target = document.querySelector(href);
      } catch {
        return; // Not a valid selector; leave it to the browser.
      }
      if (!target) return;

      event.preventDefault();

      if (!lenis) {
        // Reduced motion, or Lenis unavailable: jump, as the OS asked.
        target.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        const node = target as HTMLElement;
        const travel = () =>
          lenis.scrollTo(node, {
            duration: 1.15,
            // Matches the page's own easing: quick to start, long settle.
            easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
          });

        /* The mobile sheet pauses Lenis while it is open and restarts it on
           close — and Lenis's start() resets the instance, which cancels any
           animation already in flight. Tapping a link in the sheet closes it
           on this same click, so starting the travel now would simply be
           thrown away. Wait for the instance to be running again. */
        if (lenis.isStopped) {
          let frames = 0;
          const whenRunning = () => {
            if (!lenis.isStopped) {
              travel();
            } else if (frames++ < 30) {
              window.requestAnimationFrame(whenRunning);
            }
            // Still paused after half a second: something else is holding the
            // page (a dialog). Scrolling underneath it would be wrong.
          };
          window.requestAnimationFrame(whenRunning);
        } else {
          travel();
        }
      }

      // Keep the address bar in step without triggering a second jump.
      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);
}
