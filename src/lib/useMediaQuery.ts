import { useEffect, useState } from "react";

/**
 * The width at which the site switches to its phone layout.
 *
 * The stylesheet holds the same number in its media queries. It is here as
 * well because one thing cannot be decided in CSS: which of two photographs
 * a `<picture>` ended up showing, and therefore which alt text describes
 * what is on screen. Changing the layout breakpoint means changing both.
 */
export const PHONE_QUERY = "(max-width: 760px)";

/**
 * Whether a media query currently matches, kept in step with the viewport.
 *
 * Starts from the real answer rather than `false`, so the first paint is
 * already correct and nothing flickers from one state to the other.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    // The query itself can change between renders, so re-read on mount.
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}
