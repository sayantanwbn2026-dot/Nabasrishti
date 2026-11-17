import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** id of the element labelling the dialog, for screen readers. */
  labelledBy: string;
  /** Extra class on the panel, for per-modal surface styling. */
  panelClassName?: string;
  /** Fills the viewport instead of floating as a centred card. */
  fullscreen?: boolean;
  closeLabel?: string;
  children: ReactNode;
};

/**
 * Dialog shell shared by the enquiry form and the project detail view.
 * Owns the things that are easy to get wrong once per modal: scroll lock
 * (including Lenis), focus capture and restore, Escape, and scrim clicks.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  panelClassName = "",
  fullscreen = false,
  closeLabel = "Close",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const lenis = useLenis();

  /* onClose is usually an inline arrow, so its identity changes on every
     render of the parent. Holding it in a ref keeps the effects below
     keyed on `open` alone — otherwise each keystroke in a form inside the
     dialog re-runs the focus effect and throws focus back to the top. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    if (open) restoreFocusTo.current = document.activeElement as HTMLElement;
  }, [open]);

  // Hold the page still behind the dialog.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    // Compensating for the scrollbar stops the page jumping sideways.
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    lenis?.stop();

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = "";
      lenis?.start();
    };
  }, [open, lenis]);

  // Move focus inside, then keep Tab within the dialog.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;

      const edge = event.shiftKey ? items[0] : items[items.length - 1];
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? items[items.length - 1] : items[0]).focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open]);

  const handleClose = useCallback(() => {
    onCloseRef.current();
    restoreFocusTo.current?.focus({ preventScroll: true });
  }, []);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`modal ${fullscreen ? "modal--fullscreen" : ""}`}
          /* The overlay is the scroll container for card dialogs, so it
             needs the opt-out too — Lenis matches on the event path. */
          data-lenis-prevent
          /* Closing on the backdrop is handled here rather than by a
             separate scrim element: a position:fixed child sits outside
             this container's scroll chain, so a wheel over it scrolled
             nothing at all. */
          onClick={(event) => {
            if (event.target === event.currentTarget) handleClose();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <motion.div
            className={`modal__panel ${panelClassName}`}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            /* Lenis checks for this attribute BEFORE its stopped-state
               branch, which otherwise calls preventDefault() on every wheel
               event and leaves the panel unscrollable. */
            data-lenis-prevent
            initial={{ opacity: 0, y: fullscreen ? 32 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: fullscreen ? 24 : 12 }}
            transition={{ duration: fullscreen ? 0.5 : 0.45, ease: EASE_OUT }}
          >
            <button
              type="button"
              className="modal__close"
              onClick={handleClose}
              aria-label={closeLabel}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
