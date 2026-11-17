import { useEffect, useState } from "react";

/* Persistent storage on purpose: the prompt shows once per visitor, not
   once per visit. Clear this key to see it again while testing. */
const SEEN_KEY = "nabasrishti:enquiry-prompted";

/**
 * Opens the enquiry prompt once a visitor has had a moment to look around.
 *
 * It fires at most once ever per browser, holds off while another dialog
 * is open, and never interrupts someone who is actively scrolling — the
 * timer only resolves during a lull.
 */
export function useDelayedEnquiry(delayMs: number, blocked: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (blocked) return;

    let alreadyPrompted = false;
    try {
      alreadyPrompted = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private browsing can throw on access; treat it as "not yet prompted".
    }
    if (alreadyPrompted) return;

    let idleTimer: number | undefined;

    const arm = () => {
      window.clearTimeout(idleTimer);
      // A short wait for stillness so the prompt never lands mid-scroll,
      // kept brief so the audit's 2-3 second window still holds.
      idleTimer = window.setTimeout(() => {
        setOpen(true);
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {
          // Storage blocked (private mode): it may prompt again later.
        }
      }, 400);
    };

    const start = window.setTimeout(() => {
      window.addEventListener("scroll", arm, { passive: true });
      arm();
    }, delayMs);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", arm);
    };
  }, [delayMs, blocked]);

  return [open, setOpen] as const;
}
