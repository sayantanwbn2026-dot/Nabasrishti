import { useEffect, useState } from "react";
import {
  useCreateRow,
  useDeleteRow,
  useReorder,
  useRows,
  useSaveRow,
} from "./api";
import {
  ImageField,
  NumberField,
  SelectField,
  StringList,
  TextArea,
  TextField,
  Toggle,
} from "./Fields";
import type { BlockType, CmsProject, ProjectBlock } from "@/lib/content";

const CARD_LAYOUTS = [
  { value: "full", label: "Full width" },
  { value: "half", label: "Half width" },
  { value: "narrow-left", label: "Narrow, aligned left" },
  { value: "offset-right", label: "Narrow, aligned right" },
  { value: "wide-right", label: "Wide, aligned right" },
];

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

function ProjectEditor({
  project,
  onBack,
}: {
  project: CmsProject;
  onBack: () => void;
}) {
  const saveProject = useSaveRow("projects");
  const saveBlock = useSaveRow("project_blocks");
  const createBlock = useCreateRow("project_blocks");
  const deleteBlock = useDeleteRow("project_blocks");
  const reorderBlocks = useReorder("project_blocks");

  const { data: allBlocks = [] } = useRows<ProjectBlock>("project_blocks");
  const blocks = allBlocks
    .filter((block) => block.project_id === project.id)
    .sort((a, b) => a.position - b.position);

  const [draft, setDraft] = useState<CmsProject>(project);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [blockDrafts, setBlockDrafts] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => setDraft(project), [project]);

  const set = <K extends keyof CmsProject>(key: K, value: CmsProject[K]) =>
    setDraft({ ...draft, [key]: value });

  const dirty = JSON.stringify({ ...draft, blocks: null }) !== JSON.stringify({ ...project, blocks: null });

  const moveBlock = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    reorderBlocks.mutate(next.map((b, i) => ({ id: b.id, position: (i + 1) * 10 })));
  };

  return (
    <div className="apanel">
      <header className="apanel__head">
        <div>
          <button type="button" className="abtn abtn--quiet" onClick={onBack}>
            ← All projects
          </button>
          <h1>{draft.title}</h1>
          <p className="amuted">
            Everything on this project’s page, including how it is laid out.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          disabled={!dirty || saveProject.isPending}
          onClick={() => {
            const { blocks: _ignored, ...row } = draft;
            saveProject.mutate(row as unknown as Record<string, unknown>);
          }}
        >
          {saveProject.isPending ? "Saving…" : dirty ? "Save project" : "Saved"}
        </button>
      </header>

      {saveProject.isError ? (
        <p className="aerror">{(saveProject.error as Error).message}</p>
      ) : null}

      <section className="asection">
        <h2 className="asection__title">Details</h2>
        <div className="aform">
          <TextField label="Project name" value={draft.title} onChange={(v) => set("title", v)} />
          <TextField
            label="Web address"
            hint="Lowercase, words joined by hyphens."
            value={draft.slug}
            onChange={(v) => set("slug", v)}
            mono
          />
          <TextField label="Type" hint="For example 3 BHK" value={draft.typology} onChange={(v) => set("typology", v)} />
          <TextField label="Location" value={draft.location} onChange={(v) => set("location", v)} />
          <TextField label="Year" value={draft.year} onChange={(v) => set("year", v)} />
          <TextArea
            label="Story"
            hint="The opening paragraph on the project page."
            rows={6}
            value={draft.narrative}
            onChange={(v) => set("narrative", v)}
          />
          <StringList
            label="Scope of work"
            value={draft.scope}
            onChange={(v) => set("scope", v)}
            addLabel="Add scope item"
          />
        </div>
      </section>

      <section className="asection">
        <h2 className="asection__title">Card on the home page</h2>
        <div className="aform">
          <ImageField label="Card image" value={draft.card_image_url} onChange={(v) => set("card_image_url", v)} />
          <TextField label="Image description" value={draft.card_image_alt} onChange={(v) => set("card_image_alt", v)} />
          <SelectField
            label="Card width and position"
            hint="How this project sits in the home-page gallery."
            value={draft.card_layout}
            options={CARD_LAYOUTS}
            onChange={(v) => set("card_layout", v as CmsProject["card_layout"])}
          />
          <NumberField
            label="Image shape"
            hint="Width divided by height. 1 is square, 1.78 is widescreen."
            step={0.01}
            value={draft.card_ratio}
            onChange={(v) => set("card_ratio", v)}
          />
          <TextField
            label="Caption on the right"
            hint="Leave blank to show the project type."
            value={draft.accent_label}
            onChange={(v) => set("accent_label", v)}
          />
        </div>
      </section>

      <section className="asection">
        <h2 className="asection__title">Page options</h2>
        <div className="aform">
          <SelectField
            label="Intro layout"
            value={draft.detail_layout}
            options={[
              { value: "two-column", label: "Story beside scope" },
              { value: "stacked", label: "Story above scope" },
            ]}
            onChange={(v) => set("detail_layout", v as CmsProject["detail_layout"])}
          />
          <Toggle label="Show scope list" value={draft.show_scope} onChange={(v) => set("show_scope", v)} />
          <Toggle label="Show enquiry button" value={draft.show_cta} onChange={(v) => set("show_cta", v)} />
          <TextField label="Button label" value={draft.cta_label} onChange={(v) => set("cta_label", v)} />
          <Toggle
            label="Visible on the website"
            hint="Turn off to work on it privately."
            value={draft.is_published}
            onChange={(v) => set("is_published", v)}
          />
        </div>
      </section>

      <section className="asection">
        <div className="asection__head">
          <h2 className="asection__title">Page content</h2>
          <p className="amuted">
            Add, reorder and remove sections. They appear in this order below the story.
          </p>
        </div>

        <div className="ablocks">
          {blocks.map((block, index) => {
            const isOpen = openBlock === block.id;
            const kind = BLOCK_TYPES.find((type) => type.value === block.type);
            const payload = blockDrafts[block.id] ?? block.payload;
            const blockDirty =
              JSON.stringify(payload) !== JSON.stringify(block.payload);

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
                    <button type="button" className="aicon" onClick={() => moveBlock(index, -1)} aria-label="Move up">↑</button>
                    <button type="button" className="aicon" onClick={() => moveBlock(index, 1)} aria-label="Move down">↓</button>
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
                        onChange={(next) =>
                          setBlockDrafts({ ...blockDrafts, [block.id]: next })
                        }
                      />
                    </div>
                    <div className="arow__foot">
                      <button
                        type="button"
                        className="abtn"
                        disabled={!blockDirty || saveBlock.isPending}
                        onClick={() => saveBlock.mutate({ id: block.id, payload })}
                      >
                        {saveBlock.isPending ? "Saving…" : blockDirty ? "Save section" : "Saved"}
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
                      project_id: project.id,
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
      </section>
    </div>
  );
}

export function ProjectsPanel() {
  const { data = [], isLoading, error } = useRows<CmsProject>("projects");
  const create = useCreateRow("projects");
  const remove = useDeleteRow("projects");
  const reorder = useReorder("projects");
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;

  const active = data.find((project) => project.id === openId);
  if (active) return <ProjectEditor project={active} onBack={() => setOpenId(null)} />;

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= data.length) return;
    const next = [...data];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((row, i) => ({ id: row.id, position: (i + 1) * 10 })));
  };

  return (
    <div className="apanel">
      <header className="apanel__head">
        <div>
          <h1>Projects</h1>
          <p className="amuted">
            The gallery on the home page, and a fully composable page for each project.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          onClick={() =>
            create.mutate(
              {
                slug: `project-${Date.now()}`,
                title: "New project",
                position: (data.length + 1) * 10,
                is_published: false,
              },
              { onSuccess: (row) => setOpenId((row as CmsProject).id) },
            )
          }
        >
          Add project
        </button>
      </header>

      <div className="alist">
        {data.map((project, index) => (
          <div className="arow" key={project.id}>
            <div className="arow__head">
              <button
                type="button"
                className="arow__title"
                onClick={() => setOpenId(project.id)}
              >
                <span className="arow__thumb">
                  {project.card_image_url ? (
                    <img src={project.card_image_url} alt="" />
                  ) : null}
                </span>
                <span>
                  <strong>{project.title}</strong>
                  <span className="amuted">
                    {[project.typology, project.location].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {!project.is_published ? <span className="atag">Hidden</span> : null}
              </button>
              <div className="arow__actions">
                <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                <button
                  type="button"
                  className="aicon aicon--danger"
                  aria-label="Delete project"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete “${project.title}” and everything on its page? This cannot be undone.`,
                      )
                    ) {
                      remove.mutate(project.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
