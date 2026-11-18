import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { media } from "@/data/media";

/**
 * A draggable before/after wipe.
 *
 * Lives here rather than in the page that first needed it, because the same
 * control now appears in three places: the home page's "From Concept to
 * Creation" band, the gallery of every pairing, and any project or journal
 * page that carries a comparison block.
 */
export function ImageComparison({
  beforeUrl,
  afterUrl,
  beforeAlt = "",
  afterAlt = "Finished interior",
  beforeLabel,
  afterLabel,
  /** Where the divider starts, as a percentage from the left. */
  start = 53,
  eager = false,
}: {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  start?: number;
  eager?: boolean;
}) {
  const [position, setPosition] = useState(start);
  const isDragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    const next = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    isDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (isDragging.current) setFromClientX(event.clientX);
  };

  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 5 : 1;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => Math.max(0, current - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => Math.min(100, current + step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  const loading = eager ? "eager" : "lazy";

  return (
    <div className="comparison-frame" ref={frameRef}>
      <img
        className="comparison-frame__image"
        src={afterUrl || media.hero}
        alt={afterAlt}
        width="2150"
        height="1229"
        loading={loading}
        decoding="async"
      />
      <img
        className="comparison-frame__image comparison-frame__sketch"
        src={beforeUrl || media.comparisonSketch}
        alt={beforeAlt}
        aria-hidden={beforeAlt ? undefined : true}
        width="1600"
        height="914"
        loading={loading}
        decoding="async"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />

      {/* The labels fade out as the divider reaches them, so neither one
          ever sits on top of the image it does not belong to. */}
      {beforeLabel ? (
        <span
          className="comparison-frame__tag comparison-frame__tag--before"
          style={{ opacity: position > 16 ? 1 : 0 }}
          aria-hidden="true"
        >
          {beforeLabel}
        </span>
      ) : null}
      {afterLabel ? (
        <span
          className="comparison-frame__tag comparison-frame__tag--after"
          style={{ opacity: position < 84 ? 1 : 0 }}
          aria-hidden="true"
        >
          {afterLabel}
        </span>
      ) : null}

      <div
        className="comparison-frame__divider"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      />
      <button
        className="comparison-frame__handle"
        type="button"
        role="slider"
        aria-label="Adjust sketch and finished interior comparison"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)} percent sketch visible`}
        style={{ left: `${position}%` }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={handleKeyDown}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <path d="m8 5-5 5 5 5M12 5l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}
