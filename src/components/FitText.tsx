import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Sets a single line of text to exactly the width of its container.
 *
 * The footer wordmark is the studio name from the CMS, so its length is not
 * known in advance — a fixed font size would leave an uneven gap on the
 * right for any name but the one it was tuned to. This measures the
 * rendered text and solves for the size that fills the line.
 */
export function FitText({
  text,
  className,
  /** Never grow past this, so a short name stays sane. */
  maxFontSize = 460,
  minFontSize = 24,
}: {
  text: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const available = parent.clientWidth;
    if (!available) return;

    // Measure the text itself, not the block it sits in.
    const measure = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width;
    };

    // Solve from a known size, then correct once: letter-spacing is
    // proportional to the size, so a single correction converges.
    const probe = 100;
    el.style.fontSize = `${probe}px`;
    const probeWidth = measure();
    if (!probeWidth) return;

    let size = probe * (available / probeWidth);
    el.style.fontSize = `${size}px`;

    const actual = measure();
    if (actual) size *= available / actual;

    el.style.fontSize = `${Math.min(Math.max(size, minFontSize), maxFontSize)}px`;
  }, [maxFontSize, minFontSize]);

  useLayoutEffect(fit, [fit, text]);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(fit);
    observer.observe(parent);

    // Web fonts land after first paint and change the metrics.
    document.fonts?.ready.then(fit).catch(() => {});

    return () => observer.disconnect();
  }, [fit]);

  return (
    <span className={className} ref={ref}>
      {text}
    </span>
  );
}
