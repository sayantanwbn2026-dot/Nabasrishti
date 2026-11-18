import { useEffect } from "react";

/**
 * Stops half-finished edits disappearing without a word.
 *
 * Every editor here keeps a local draft and writes it only when Save is
 * pressed, so switching section, opening another project or closing the
 * tab used to throw the work away silently. Panels declare whether they
 * hold unsaved changes; the shell asks before it navigates away.
 */
let openEditors = 0;

function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  // Browsers show their own wording; a non-empty value is what triggers it.
  event.returnValue = "";
}

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    openEditors += 1;
    if (openEditors === 1) {
      window.addEventListener("beforeunload", onBeforeUnload);
    }

    return () => {
      openEditors -= 1;
      if (openEditors === 0) {
        window.removeEventListener("beforeunload", onBeforeUnload);
      }
    };
  }, [dirty]);
}

/**
 * True when it is safe to navigate. Asks the editor first if anything is
 * unsaved, so the answer is theirs rather than the app's.
 */
export function confirmDiscard(): boolean {
  if (openEditors === 0) return true;
  return window.confirm(
    "You have changes that have not been saved. Leave them behind?",
  );
}

/**
 * Ctrl/Cmd+S saves, rather than offering to save the page as a file.
 * Only bound while there is something to save.
 */
export function useSaveShortcut(enabled: boolean, save: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, save]);
}
