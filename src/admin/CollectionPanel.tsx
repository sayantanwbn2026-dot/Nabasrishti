import { useEffect, useState } from "react";
import {
  useCreateRow,
  useDeleteRow,
  useReorder,
  useRows,
  useSaveRow,
  type TableName,
} from "./api";
import { ImageField, TextArea, TextField, Toggle } from "./Fields";

type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  hint?: string;
  rows?: number;
};

export type CollectionSpec = {
  table: TableName;
  title: string;
  description: string;
  /** Shown in the row list. */
  titleKey: string;
  fields: FieldSpec[];
  blank: Record<string, unknown>;
  addLabel: string;
};

type Row = Record<string, unknown> & { id: string; position: number };

export function CollectionPanel({ spec }: { spec: CollectionSpec }) {
  const { data = [], isLoading, error } = useRows<Row>(spec.table);
  const save = useSaveRow(spec.table);
  const create = useCreateRow(spec.table);
  const remove = useDeleteRow(spec.table);
  const reorder = useReorder(spec.table);

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Row | null>(null);

  // Reset the draft whenever a different row is opened.
  useEffect(() => {
    const row = data.find((item) => item.id === openId) ?? null;
    setDraft(row ? { ...row } : null);
  }, [openId, data]);

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= data.length) return;
    const next = [...data];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((row, i) => ({ id: row.id, position: (i + 1) * 10 })));
  };

  const dirty =
    draft && JSON.stringify(draft) !== JSON.stringify(data.find((r) => r.id === draft.id));

  return (
    <div className="apanel">
      <header className="apanel__head">
        <div>
          <h1>{spec.title}</h1>
          <p className="amuted">{spec.description}</p>
        </div>
        <button
          type="button"
          className="abtn"
          onClick={() =>
            create.mutate(
              { ...spec.blank, position: (data.length + 1) * 10 },
              { onSuccess: (row) => setOpenId((row as Row).id) },
            )
          }
        >
          {spec.addLabel}
        </button>
      </header>

      <div className="alist">
        {data.map((row, index) => {
          const isOpen = openId === row.id;
          return (
            <div className={`arow ${isOpen ? "is-open" : ""}`} key={row.id}>
              <div className="arow__head">
                <button
                  type="button"
                  className="arow__title"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                >
                  <span className="arow__index">{index + 1}</span>
                  <span>{String(row[spec.titleKey] || "Untitled")}</span>
                  {row.is_published === false ? (
                    <span className="atag">Hidden</span>
                  ) : null}
                </button>
                <div className="arow__actions">
                  <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                  <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                  <button
                    type="button"
                    className="aicon aicon--danger"
                    aria-label="Delete"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete “${String(row[spec.titleKey])}”? This cannot be undone.`,
                        )
                      ) {
                        remove.mutate(row.id);
                        if (openId === row.id) setOpenId(null);
                      }
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {isOpen && draft ? (
                <div className="arow__body">
                  <div className="aform">
                    {spec.fields.map((field) => {
                      const value = String(draft[field.key] ?? "");
                      const set = (next: string) =>
                        setDraft({ ...draft, [field.key]: next });

                      if (field.type === "textarea") {
                        return (
                          <TextArea
                            key={field.key}
                            label={field.label}
                            hint={field.hint}
                            rows={field.rows ?? 4}
                            value={value}
                            onChange={set}
                          />
                        );
                      }
                      if (field.type === "image") {
                        return (
                          <ImageField
                            key={field.key}
                            label={field.label}
                            hint={field.hint}
                            value={value}
                            onChange={set}
                          />
                        );
                      }
                      return (
                        <TextField
                          key={field.key}
                          label={field.label}
                          hint={field.hint}
                          value={value}
                          onChange={set}
                        />
                      );
                    })}

                    {"is_published" in draft ? (
                      <Toggle
                        label="Visible on the website"
                        hint="Turn off to hide without deleting."
                        value={Boolean(draft.is_published)}
                        onChange={(next) => setDraft({ ...draft, is_published: next })}
                      />
                    ) : null}
                  </div>

                  <div className="arow__foot">
                    <button
                      type="button"
                      className="abtn"
                      disabled={!dirty || save.isPending}
                      onClick={() => save.mutate(draft)}
                    >
                      {save.isPending ? "Saving…" : dirty ? "Save" : "Saved"}
                    </button>
                    {save.isError ? (
                      <span className="aerror">{(save.error as Error).message}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {data.length === 0 ? (
          <p className="amuted">Nothing here yet. Use “{spec.addLabel}”.</p>
        ) : null}
      </div>
    </div>
  );
}

export const COLLECTIONS: Record<string, CollectionSpec> = {
  services: {
    table: "services",
    title: "Services",
    description: "The expanding list in the “How We Can Help” section.",
    titleKey: "title",
    addLabel: "Add service",
    blank: { title: "New service", body: "", image_url: "", image_alt: "" },
    fields: [
      { key: "title", label: "Service name", type: "text" },
      { key: "body", label: "Description", type: "textarea", rows: 4 },
      { key: "image_url", label: "Image", type: "image" },
      { key: "image_alt", label: "Image description", type: "text" },
    ],
  },
  process_steps: {
    table: "process_steps",
    title: "Process",
    description: "The numbered steps explaining how you work.",
    titleKey: "title",
    addLabel: "Add step",
    blank: { number: "", title: "New step", description: "" },
    fields: [
      { key: "number", label: "Step number", type: "text", hint: "For example 01" },
      { key: "title", label: "Step name", type: "text" },
      { key: "description", label: "Description", type: "textarea", rows: 3 },
    ],
  },
  testimonials: {
    table: "testimonials",
    title: "Testimonials",
    description: "Client quotes and the photograph shown beside them.",
    titleKey: "name",
    addLabel: "Add testimonial",
    blank: { name: "New client", quote: "", portrait_url: "", image_url: "", image_alt: "" },
    fields: [
      { key: "name", label: "Client name", type: "text" },
      { key: "quote", label: "Quote", type: "textarea", rows: 5 },
      { key: "portrait_url", label: "Client portrait", type: "image" },
      { key: "image_url", label: "Project photograph", type: "image" },
      { key: "image_alt", label: "Photograph description", type: "text" },
    ],
  },
  articles: {
    table: "articles",
    title: "Journal",
    description: "Posts in the “Notes From The Studio” section.",
    titleKey: "title",
    addLabel: "Add post",
    blank: { title: "New post", date_label: "", image_url: "", image_alt: "", link_url: "" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "date_label", label: "Date shown", type: "text", hint: "For example March 2026" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "image_alt", label: "Image description", type: "text" },
      { key: "link_url", label: "Link", type: "text", hint: "Optional. Leave blank if the post does not link anywhere." },
    ],
  },
  footer_links: {
    table: "footer_links",
    title: "Footer links",
    description: "Grouped by column heading — rows sharing a heading appear together.",
    titleKey: "label",
    addLabel: "Add link",
    blank: { column_label: "Studio", label: "New link", href: "#", is_external: false },
    fields: [
      { key: "column_label", label: "Column heading", type: "text" },
      { key: "label", label: "Link text", type: "text" },
      { key: "href", label: "Link target", type: "text", hint: "For example #projects or https://instagram.com/…" },
    ],
  },
};
