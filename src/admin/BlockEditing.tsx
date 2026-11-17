import { useState } from "react";
import {
  useCreateRow,
  useDeleteRow,
  useReorder,
  useRows,
  useSaveRow,
  type TableName,
} from "./api";
import { ImageField, NumberField, TextArea, TextField } from "./Fields";
import type { BlockType, ProjectBlock } from "@/lib/content";

const BLOCK_TYPES: { value: BlockType; label: string; hint: string }[] = [
  { value: "gallery", label: "Image gallery", hint: "A set of photographs" },
  { value: "image", label: "Single image", hint: "One photograph, full width" },
  { value: "text", label: "Paragraph", hint: "A block of writing" },
  { value: "heading", label: "Heading", hint: "A sub-heading within the page" },
  { value: "quote", label: "Pull quote", hint: "A large centred quotation" },
  { value: "split", label: "Text beside image", hint: "Two columns" },
  { value: "specs", label: "Specification table", hint: "Label and value pairs" },
  { value: "spacer", label: "Spacer", hint: "Extra breathing room" },
];

const blankPayload = (type: BlockType): Record<string, unknown> => {
  switch (type) {
    case "gallery":
      return { images: [], columns: 1 };
    case "image":
      return { url: "", alt: "", caption: "" };
    case "text":
    case "heading":
      return { text: "" };
    case "quote":
      return { text: "", attribution: "" };
    case "split":
      return { heading: "", text: "", images: [{ url: "", alt: "" }] };
    case "specs":
      return { rows: [{ label: "", value: "" }] };
    case "spacer":
      return { height: 48 };
    default:
      return {};
  }
};

type Img = { url?: string; alt?: string; caption?: string };

/** Editor for the images inside gallery / split blocks. */
function ImageList({
  value,
  onChange,
}: {
  value: Img[];
  onChange: (next: Img[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const update = (index: number, patch: Partial<Img>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="af">
      <span className="af__label">Images</span>
      <div className="ablocks">
        {items.map((image, index) => (
          <div className="ablock ablock--nested" key={index}>
            <div className="ablock__head">
              <span className="ablock__kind">Image {index + 1}</span>
              <div className="arow__actions">
                <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                <button
                  type="button"
                  className="aicon aicon--danger"
                  aria-label="Remove image"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            </div>
            <ImageField
              label="Photograph"
              value={image.url ?? ""}
              onChange={(url) => update(index, { url })}
            />
            <TextField
              label="Description"
              value={image.alt ?? ""}
              onChange={(alt) => update(index, { alt })}
            />
            <TextField
              label="Caption"
              hint="Optional, shown under the image."
              value={image.caption ?? ""}
              onChange={(caption) => update(index, { caption })}
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="abtn abtn--ghost"
        onClick={() => onChange([...items, { url: "", alt: "" }])}
      >
        Add image
      </button>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: ProjectBlock;
  onChange: (payload: Record<string, unknown>) => void;
}) {
  const payload = block.payload ?? {};
  const set = (patch: Record<string, unknown>) => onChange({ ...payload, ...patch });
  const str = (key: string) => String(payload[key] ?? "");

  switch (block.type) {
    case "heading":
      return <TextField label="Heading" value={str("text")} onChange={(text) => set({ text })} />;

    case "text":
      return (
        <TextArea label="Paragraph" rows={5} value={str("text")} onChange={(text) => set({ text })} />
      );

    case "quote":
      return (
        <>
          <TextArea label="Quote" rows={3} value={str("text")} onChange={(text) => set({ text })} />
          <TextField
            label="Attribution"
            hint="Optional — who said it."
            value={str("attribution")}
            onChange={(attribution) => set({ attribution })}
          />
        </>
      );

    case "image":
      return (
        <>
          <ImageField label="Photograph" value={str("url")} onChange={(url) => set({ url })} />
          <TextField label="Description" value={str("alt")} onChange={(alt) => set({ alt })} />
          <TextField label="Caption" value={str("caption")} onChange={(caption) => set({ caption })} />
        </>
      );

    case "gallery":
      return (
        <>
          <NumberField
            label="Columns"
            hint="1 for full-width images, 2 or 3 for a grid."
            value={Number(payload.columns) || 1}
            onChange={(columns) => set({ columns })}
          />
          <ImageList
            value={(payload.images as Img[]) ?? []}
            onChange={(images) => set({ images })}
          />
        </>
      );

    case "split":
      return (
        <>
          <TextField label="Heading" value={str("heading")} onChange={(heading) => set({ heading })} />
          <TextArea label="Text" rows={4} value={str("text")} onChange={(text) => set({ text })} />
          <ImageList
            value={(payload.images as Img[]) ?? []}
            onChange={(images) => set({ images })}
          />
        </>
      );

    case "specs": {
      const rows = (payload.rows as { label?: string; value?: string }[]) ?? [];
      const update = (index: number, patch: Record<string, string>) =>
        set({ rows: rows.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
      return (
        <div className="af">
          <span className="af__label">Specifications</span>
          <div className="af__list">
            {rows.map((row, index) => (
              <div className="af__record" key={index}>
                <label className="af__record-field">
                  <span>Label</span>
                  <input
                    className="af__input"
                    value={row.label ?? ""}
                    onChange={(event) => update(index, { label: event.target.value })}
                  />
                </label>
                <label className="af__record-field">
                  <span>Value</span>
                  <input
                    className="af__input"
                    value={row.value ?? ""}
                    onChange={(event) => update(index, { value: event.target.value })}
                  />
                </label>
                <div className="af__list-actions">
                  <button
                    type="button"
                    className="aicon aicon--danger"
                    aria-label="Remove row"
                    onClick={() => set({ rows: rows.filter((_, i) => i !== index) })}
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
            onClick={() => set({ rows: [...rows, { label: "", value: "" }] })}
          >
            Add row
          </button>
        </div>
      );
    }

    case "spacer":
      return (
        <NumberField
          label="Height in pixels"
          value={Number(payload.height) || 48}
          step={8}
          onChange={(height) => set({ height })}
        />
      );

    default:
      return null;
  }
}


/**
 * The "Page content" editor, shared by project pages and journal posts.
 * Both compose their pages from the same block types.
 */
export function BlockList({
  table,
  parentKey,
  parentId,
}: {
  table: TableName;
  /** Foreign key column on the block table. */
  parentKey: "project_id" | "article_id";
  parentId: string;
}) {
  const { data: allBlocks = [] } = useRows<ProjectBlock & Record<string, string>>(table);
  const saveBlock = useSaveRow(table);
  const createBlock = useCreateRow(table);
  const deleteBlock = useDeleteRow(table);
  const reorderBlocks = useReorder(table);

  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({});

  const blocks = allBlocks
    .filter((block) => block[parentKey] === parentId)
    .sort((a, b) => a.position - b.position);

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    reorderBlocks.mutate(next.map((b, i) => ({ id: b.id, position: (i + 1) * 10 })));
  };

  return (
    <>
      <div className="ablocks">
        {blocks.map((block, index) => {
          const isOpen = openBlock === block.id;
          const kind = BLOCK_TYPES.find((type) => type.value === block.type);
          const payload = drafts[block.id] ?? block.payload;
          const dirty = JSON.stringify(payload) !== JSON.stringify(block.payload);

          return (
            <div className={`ablock ${isOpen ? "is-open" : ""}`} key={block.id}>
              <div className="ablock__head">
                <button
                  type="button"
                  className="ablock__title"
                  onClick={() => setOpenBlock(isOpen ? null : block.id)}
                >
                  <span className="arow__index">{index + 1}</span>
                  <span>{kind?.label ?? block.type}</span>
                </button>
                <div className="arow__actions">
                  <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                  <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                  <button
                    type="button"
                    className="aicon aicon--danger"
                    aria-label="Delete section"
                    onClick={() => {
                      if (window.confirm("Delete this section?")) deleteBlock.mutate(block.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="ablock__body">
                  <div className="aform">
                    <BlockEditor
                      block={{ ...block, payload }}
                      onChange={(next) => setDrafts({ ...drafts, [block.id]: next })}
                    />
                  </div>
                  <div className="arow__foot">
                    <button
                      type="button"
                      className="abtn"
                      disabled={!dirty || saveBlock.isPending}
                      onClick={() => saveBlock.mutate({ id: block.id, payload })}
                    >
                      {saveBlock.isPending ? "Saving…" : dirty ? "Save section" : "Saved"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="aadd">
        <span className="af__label">Add a section</span>
        <div className="aadd__grid">
          {BLOCK_TYPES.map((type) => (
            <button
              type="button"
              className="aadd__button"
              key={type.value}
              onClick={() =>
                createBlock.mutate(
                  {
                    [parentKey]: parentId,
                    type: type.value,
                    position: (blocks.length + 1) * 10,
                    payload: blankPayload(type.value),
                  },
                  { onSuccess: (row) => setOpenBlock((row as ProjectBlock).id) },
                )
              }
            >
              <strong>{type.label}</strong>
              <span>{type.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
