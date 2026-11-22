import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { uploadImage, useRows } from "./api";

type MediaRow = {
  id: string;
  url: string;
  label: string;
  alt: string;
  created_at: string;
};

/**
 * Everything uploaded so far, so a photograph used in one place can be
 * reused in another without hunting for the original file.
 */
function MediaLibrary({
  onPick,
  onClose,
}: {
  onPick: (url: string) => void;
  onClose: () => void;
}) {
  const { data = [], isLoading, error } = useRows<MediaRow>("media");
  const [term, setTerm] = useState("");

  const needle = term.trim().toLowerCase();
  const shown = needle
    ? data.filter((row) =>
        `${row.label ?? ""} ${row.alt ?? ""}`.toLowerCase().includes(needle),
      )
    : data;

  return (
    <div className="alibrary">
      <div className="alibrary__head">
        <input
          className="af__input"
          value={term}
          placeholder="Search by file name"
          onChange={(event) => setTerm(event.target.value)}
        />
        <button type="button" className="abtn abtn--quiet" onClick={onClose}>
          Close
        </button>
      </div>

      {isLoading ? <p className="amuted">Loading…</p> : null}
      {error ? <p className="aerror">{(error as Error).message}</p> : null}
      {!isLoading && shown.length === 0 ? (
        <p className="amuted">
          {data.length === 0
            ? "Nothing uploaded yet. Images you upload will collect here."
            : "No image matches that."}
        </p>
      ) : null}

      <ul className="alibrary__grid">
        {shown.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className="alibrary__item"
              onClick={() => onPick(row.url)}
              title={row.label || row.url}
            >
              <img src={row.url} alt="" loading="lazy" decoding="async" />
              <span>{row.label || "Untitled"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type BaseProps = {
  label: string;
  hint?: string;
  children?: ReactNode;
};

export function Field({ label, hint, children }: BaseProps) {
  return (
    <label className="af">
      <span className="af__label">{label}</span>
      {hint ? <span className="af__hint">{hint}</span> : null}
      {children}
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={`af__input ${mono ? "af__input--mono" : ""}`}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className="af__input af__input--area"
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className="af__input"
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <select
        className="af__input af__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="af af--row">
      <div>
        <span className="af__label">{label}</span>
        {hint ? <span className="af__hint">{hint}</span> : null}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={value}
        className={`af__switch ${value ? "is-on" : ""}`}
        onClick={() => onChange(!value)}
      >
        <span />
      </button>
    </div>
  );
}

/**
 * Image control: upload a file or paste a URL. Uploading puts the file in
 * the Supabase `media` bucket and stores its public URL.
 */
export function ImageField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="af">
      <span className="af__label">{label}</span>
      {hint ? <span className="af__hint">{hint}</span> : null}
      <div className="af__image">
        <div className="af__thumb">
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="af__thumb-empty">No image</span>
          )}
        </div>
        <div className="af__image-controls">
          <input
            className="af__input af__input--mono"
            value={value ?? ""}
            placeholder="Paste an image URL, or upload"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="af__image-actions">
            <button
              type="button"
              className="abtn abtn--ghost"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Uploading…" : "Upload image"}
            </button>
            <button
              type="button"
              className="abtn abtn--ghost"
              onClick={() => setBrowsing((open) => !open)}
            >
              {browsing ? "Hide library" : "Choose existing"}
            </button>
            {value ? (
              <button
                type="button"
                className="abtn abtn--quiet"
                onClick={() => onChange("")}
              >
                Clear
              </button>
            ) : null}
          </div>
          {error ? <p className="af__error">{error}</p> : null}
        </div>
      </div>
      {browsing ? (
        <MediaLibrary
          onPick={(url) => {
            onChange(url);
            setBrowsing(false);
          }}
          onClose={() => setBrowsing(false)}
        />
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => pick(event.target.files?.[0])}
      />
    </div>
  );
}

/** Editable list of plain strings (service highlights, scope, …). */
export function StringList({
  label,
  hint,
  value,
  onChange,
  addLabel = "Add item",
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
  addLabel?: string;
}) {
  const items = Array.isArray(value) ? value : [];

  const update = (index: number, next: string) =>
    onChange(items.map((item, i) => (i === index ? next : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="af">
      <span className="af__label">{label}</span>
      {hint ? <span className="af__hint">{hint}</span> : null}
      <div className="af__list">
        {items.map((item, index) => (
          <div className="af__list-row" key={index}>
            <input
              className="af__input"
              value={item}
              onChange={(event) => update(index, event.target.value)}
            />
            <div className="af__list-actions">
              <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
              <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
              <button
                type="button"
                className="aicon aicon--danger"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="abtn abtn--ghost"
        onClick={() => onChange([...items, ""])}
      >
        {addLabel}
      </button>
    </div>
  );
}

/** Editable list of {label, value} or {value, suffix, label} records. */
export function RecordList<T extends Record<string, string | number>>({
  label,
  hint,
  value,
  onChange,
  fields,
  blank,
  addLabel = "Add row",
}: {
  label: string;
  hint?: string;
  value: T[];
  onChange: (value: T[]) => void;
  fields: { key: keyof T & string; label: string; type?: "text" | "number" }[];
  blank: T;
  addLabel?: string;
}) {
  const items = Array.isArray(value) ? value : [];

  const update = (index: number, key: string, next: string | number) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: next } : item)),
    );

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="af">
      <span className="af__label">{label}</span>
      {hint ? <span className="af__hint">{hint}</span> : null}
      <div className="af__list">
        {items.map((item, index) => (
          <div className="af__record" key={index}>
            {fields.map((field) => (
              <label className="af__record-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  className="af__input"
                  type={field.type === "number" ? "number" : "text"}
                  value={(item[field.key] ?? "") as string | number}
                  onChange={(event) =>
                    update(
                      index,
                      field.key,
                      field.type === "number"
                        ? Number(event.target.value)
                        : event.target.value,
                    )
                  }
                />
              </label>
            ))}
            <div className="af__list-actions">
              <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
              <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
              <button
                type="button"
                className="aicon aicon--danger"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="abtn abtn--ghost"
        onClick={() => onChange([...items, { ...blank }])}
      >
        {addLabel}
      </button>
    </div>
  );
}

/**
 * Picks the point of a photograph that a crop must keep.
 *
 * A phone shows an upright slice roughly a quarter of a wide photograph's
 * width, so the crop is not a detail — it decides what the picture is of.
 * Two number boxes would technically do it, but nobody can tell from "78"
 * whether the sofa survives. This shows the photograph with the phone's
 * frame drawn over it, moving as you click or drag, so the choice is made
 * against the thing being decided.
 */
export function FocalPointField({
  label,
  hint,
  url,
  x,
  y,
  onChange,
  /** Aspect ratio of the frame drawn over the image, width / height. */
  ratio = 375 / 812,
}: {
  label: string;
  hint?: string;
  url: string;
  x: number;
  y: number;
  onChange: (next: { x: number; y: number }) => void;
  ratio?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  /* The shape of the picture as drawn, which decides which way round the
     crop is limited — a tall crop of a wide photograph is as tall as the
     photograph, a wide crop of a tall one is as wide. */
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setBox({ w: r.width, h: r.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

  const setFromPointer = (clientX: number, clientY: number) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return;
    onChange({
      x: clamp(((clientX - box.left) / box.width) * 100),
      y: clamp(((clientY - box.top) / box.height) * 100),
    });
  };

  /* Which axis the crop fills. Everything else follows from the ratio,
     so a 16:9 crop of a 4:3 photograph is handled by the same code as a
     phone-shaped crop of a wide one. */
  const drawn = box.w > 0 && box.h > 0 ? box.w / box.h : ratio;
  const keepSize =
    ratio < drawn
      ? { height: "100%", width: `${(ratio / drawn) * 100}%` }
      : { width: "100%", height: `${(drawn / ratio) * 100}%` };

  /* The pin marks the centre of what is kept, so on an axis that is not
     cropped it belongs in the middle rather than wherever it was last
     dragged to — there is nothing to choose on that axis. */
  const pinX = ratio < drawn ? x : 50;
  const pinY = ratio < drawn ? 50 : y;

  if (!url) {
    return (
      <div className="af">
        <span className="af__label">{label}</span>
        <span className="af__hint">
          Add the photograph above first, then choose its focus here.
        </span>
      </div>
    );
  }

  return (
    <div className="af">
      <span className="af__label">{label}</span>
      {hint ? <span className="af__hint">{hint}</span> : null}

      <div className="afocal">
        {/* The photograph, with the crop drawn over it. Pointer events are
            captured so a drag that leaves the picture still tracks. */}
        <div
          className="afocal__frame"
          ref={frameRef}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            setFromPointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (!dragging) return;
            setFromPointer(event.clientX, event.clientY);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <img src={url} alt="" draggable={false} />
          {/* What a phone will actually keep. Everything outside it is
              dimmed, so the preview answers the only question being
              asked: what stays in frame.

              Offset and translated by the same percentage, which is how
              object-position itself behaves: 0 sits flush to one edge,
              100 to the other, and the frame never leaves the picture.
              Offsetting alone would let it hang half outside at the
              extremes and promise a crop the browser will not give. */}
          <div
            className="afocal__keep"
            style={{
              ...keepSize,
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-${x}%, -${y}%)`,
            }}
          />
          <span
            className="afocal__pin"
            style={{ left: `${pinX}%`, top: `${pinY}%` }}
          />
        </div>

        {/* Arrow keys for anyone not using a pointer, and the numbers
            themselves for anyone who wants to type an exact value. */}
        <div className="afocal__controls">
          <label className="afocal__num">
            <span>Across</span>
            <input
              type="number"
              min={0}
              max={100}
              value={x}
              onChange={(event) =>
                onChange({ x: clamp(Number(event.target.value)), y })
              }
            />
            <span className="afocal__unit">%</span>
          </label>
          <label className="afocal__num">
            <span>Down</span>
            <input
              type="number"
              min={0}
              max={100}
              value={y}
              onChange={(event) =>
                onChange({ x, y: clamp(Number(event.target.value)) })
              }
            />
            <span className="afocal__unit">%</span>
          </label>
          <button
            type="button"
            className="abtn abtn--ghost"
            onClick={() => onChange({ x: 50, y: 50 })}
          >
            Centre
          </button>
        </div>
      </div>
    </div>
  );
}
