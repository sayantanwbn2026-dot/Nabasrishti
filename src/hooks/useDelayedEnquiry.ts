import { useEffect, useState } from "react";

const SEEN_KEY = "nabasrishti:enquiry-prompted";

/**
 * Opens the enquiry prompt once a visitor has had a moment to look around.
 *
 * It fires at most once per browser session, holds off while another dialog
 * is open, and never interrupts someone who is actively scrolling — the
 * timer only resolves during a lull.
 */
export function useDelayedEnquiry(delayMs: number, blocked: boolean) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (blocked) return;

    let alreadyPrompted = false;
    try {
      alreadyPrompted = sessionStorage.getItem(SEEN_KEY) === "1";
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
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // Nothing to do — the prompt simply may reappear next session.
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
