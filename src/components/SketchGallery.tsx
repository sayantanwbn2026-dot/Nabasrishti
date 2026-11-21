import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Sketch } from "@/lib/content";

/** Pixels per second the strip drifts when left alone. */
const SPEED = 26;

/**
 * A strip of sketch views that drifts sideways on its own.
 *
 * Built on real overflow scrolling rather than a transform, so a phone
 * swipes it, a trackpad scrolls it and a keyboard reaches it — the drift
 * is only an animation laid over a strip you could already use. The list
 * is rendered twice and the scroll position wraps at the halfway mark, so
 * the loop has no seam and no end to arrive at.
 */
export function SketchGallery({
  items,
  label,
  heading,
}: {
  items: Sketch[];
  label: string;
  heading: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  /* Held in a ref as well: the animation loop reads it every frame and
     must not be restarted each time it changes. */
  const pausedRef = useRef(false);
  pausedRef.current = paused || Boolean(reduceMotion);

  const visible = items.filter((item) => item.is_published && item.image_url);
  /* Twice through, so there is always more strip arriving. One copy is
     hidden from assistive tech: it is the same gallery read again. */
  const loop = visible.length > 1;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !loop || reduceMotion) return;

    let frame = 0;
    let last = performance.now();
    /* The position is kept here as a float and written out whole each
       frame. Adding a fraction to scrollLeft directly does nothing: the
       browser hands back a rounded value, so a 0.4px step per frame reads
       as no step at all and the strip never moves. */
    let pos = track.scrollLeft;
    let applied = pos;

    const tick = (now: number) => {
      const elapsed = now - last;
      last = now;

      // A swipe or a trackpad moves it out from under us; follow along.
      if (Math.abs(track.scrollLeft - applied) > 2) pos = track.scrollLeft;

      if (!pausedRef.current) {
        const half = track.scrollWidth / 2;
        pos += (SPEED * elapsed) / 1000;
        // Wrap before painting, so the jump is never on screen.
        if (half > 0 && pos >= half) pos -= half;
        track.scrollLeft = pos;
        applied = track.scrollLeft;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [loop, reduceMotion]);

  if (visible.length === 0) return null;

  const strip = loop ? [...visible, ...visible] : visible;

  return (
    <div className="sketches">
      <div className="page-shell sketches__head">
        <p className="section-label">{label}</p>
        <h2>{heading}</h2>
      </div>

      <div
        className="sketches__viewport"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <ul className="sketches__track" ref={trackRef}>
          {strip.map((item, index) => {
            const repeat = index >= visible.length;
            return (
              <li
                className="sketches__item"
                key={`${item.id}-${index}`}
                aria-hidden={repeat ? true : undefined}
              >
                <figure>
                  <img
                    src={item.image_url}
                    alt={repeat ? "" : item.image_alt || item.title}
                    loading={index < 3 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                  {item.title || item.caption ? (
                    <figcaption>
                      {item.title ? <strong>{item.title}</strong> : null}
                      {item.caption ? <span>{item.caption}</span> : null}
                    </figcaption>
                  ) : null}
                </figure>
              </li>
            );
          })}
        </ul>
      </div>

      {loop && !reduceMotion ? (
        <div className="page-shell sketches__controls">
          {/* Moving content needs a way to stop it that does not depend on
              hovering, which a touch screen cannot do. */}
          <button
            type="button"
            className="sketches__toggle"
            onClick={() => setPaused((on) => !on)}
            aria-pressed={paused}
          >
            {paused ? "Play" : "Pause"}
            <span className="visually-hidden"> the sketch gallery</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
