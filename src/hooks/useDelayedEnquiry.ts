import { useEffect, useRef, useState } from "react";

/**
 * Opens the enquiry prompt once a visitor has had a moment to look around.
 *
 * Once per page load, not once per visitor: it used to remember in
 * localStorage that it had ever been shown, so after a single visit it
 * never appeared again — including for the studio checking their own live
 * site. A reload is a fresh landing and gets the prompt again.
 *
 * The count starts when the loading screen clears rather than at mount,
 * so the "ten seconds" a visitor actually experiences is ten seconds of
 * looking at the website, not of watching a logo. It holds off while
 * another dialog is open and waits briefly for a lull so it never lands
 * mid-scroll.
 */
export function useDelayedEnquiry(
  delayMs: number,
  blocked: boolean,
  /** False until the loading screen has gone. */
  ready = true,
) {
  const [open, setOpen] = useState(false);

  /* A ref, not state: this must survive re-renders and effect re-runs.
     Without it the scroll listener stays live after the first fire and
     re-opens the dialog every time scrolling pauses. */
  const firedRef = useRef(false);

  useEffect(() => {
    if (!ready || blocked || firedRef.current) return;

    let startTimer: number | undefined;
    let idleTimer: number | undefined;
    let capTimer: number | undefined;

    // Function declarations: these reference each other, so hoisting keeps
    // them out of the temporal dead zone.
    function teardown() {
      window.clearTimeout(startTimer);
      window.clearTimeout(idleTimer);
      window.clearTimeout(capTimer);
      window.removeEventListener("scroll", arm);
    }

    function fire() {
      if (firedRef.current) return;
      firedRef.current = true;
      // Detach everything first: nothing can re-arm after this point.
      teardown();
      setOpen(true);
    }

    function arm() {
      if (firedRef.current) return;
      window.clearTimeout(idleTimer);
      // A short wait for stillness so the prompt never lands mid-scroll.
      idleTimer = window.setTimeout(fire, 400);
    }

    startTimer = window.setTimeout(() => {
      window.addEventListener("scroll", arm, { passive: true });
      /* Someone scrolling steadily would otherwise push the prompt back
         indefinitely, one lull at a time. Wait for a gap, but not forever. */
      capTimer = window.setTimeout(fire, 2500);
      arm();
    }, delayMs);

    return teardown;
  }, [delayMs, blocked, ready]);

  return [open, setOpen] as const;
}
