import { useEffect, useRef, useState } from "react";

/* Persistent storage on purpose: the prompt shows once per visitor, not
   once per visit. Clear this key to see it again while testing. */
const SEEN_KEY = "nabasrishti:enquiry-prompted";

function alreadyPrompted() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private browsing can throw on access; treat it as "not yet prompted".
    return false;
  }
}

function rememberPrompted() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage blocked: the prompt may appear again on a later visit.
  }
}

/**
 * Opens the enquiry prompt once a visitor has had a moment to look around.
 *
 * Strictly one-shot. It fires once per visitor (remembered in
 * localStorage) and, within a page, once for the lifetime of the page —
 * closing it does not arm it again. It holds off while another dialog is
 * open and waits for a lull so it never lands mid-scroll.
 */
export function useDelayedEnquiry(delayMs: number, blocked: boolean) {
  const [open, setOpen] = useState(false);

  /* A ref, not state: this must survive re-renders and effect re-runs.
     Without it the scroll listener stays live after the first fire and
     re-opens the dialog every time scrolling pauses. */
  const firedRef = useRef(false);

  useEffect(() => {
    if (blocked || firedRef.current || alreadyPrompted()) return;

    let startTimer: number | undefined;
    let idleTimer: number | undefined;

    // Function declarations: these reference each other, so hoisting keeps
    // them out of the temporal dead zone.
    function teardown() {
      window.clearTimeout(startTimer);
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", arm);
    }

    function fire() {
      if (firedRef.current) return;
      firedRef.current = true;
      // Detach everything first: nothing can re-arm after this point.
      teardown();
      rememberPrompted();
      setOpen(true);
    }

    function arm() {
      if (firedRef.current) return;
      window.clearTimeout(idleTimer);
      // A short wait for stillness so the prompt never lands mid-scroll,
      // kept brief so the audit's 2-3 second window still holds.
      idleTimer = window.setTimeout(fire, 400);
    }

    startTimer = window.setTimeout(() => {
      window.addEventListener("scroll", arm, { passive: true });
      arm();
    }, delayMs);

    return teardown;
  }, [delayMs, blocked]);

  return [open, setOpen] as const;
}
