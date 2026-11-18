import { useEffect, useState } from "react";
import {
  useCreateRow,
  useDuplicatePage,
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
import { BlockList } from "./BlockEditing";
import type { CmsProject } from "@/lib/content";

const CARD_LAYOUTS = [
  { value: "full", label: "Full width" },
  { value: "half", label: "Half width" },
  { value: "narrow-left", label: "Narrow, aligned left" },
  { value: "offset-right", label: "Narrow, aligned right" },
  { value: "wide-right", label: "Wide, aligned right" },
];

function ProjectEditor({
  project,
  onBack,
}: {
  project: CmsProject;
  onBack: () => void;
}) {
  const saveProject = useSaveRow("projects");
  const [draft, setDraft] = useState<CmsProject>(project);

  useEffect(() => setDraft(project), [project]);

  const set = <K extends keyof CmsProject>(key: K, value: CmsProject[K]) =>
    setDraft({ ...draft, [key]: value });

  const dirty = JSON.stringify({ ...draft, blocks: null }) !== JSON.stringify({ ...project, blocks: null });

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
        <h2 className="asection__title">Search and sharing</h2>
        <p className="amuted">
          How this page appears in Google results and when the link is
          shared. Leave any of them blank to use the page's own name and story.
        </p>
        <div className="aform">
          <TextField
            label="Search title"
            hint="Around 60 characters. Put the most useful words first."
            value={draft.seo_title}
            onChange={(v) => set("seo_title", v)}
          />
          <TextArea
            label="Search description"
            hint="Around 155 characters. This is the grey text under the link."
            rows={3}
            value={draft.seo_description}
            onChange={(v) => set("seo_description", v)}
          />
          <ImageField
            label="Sharing image"
            hint="Shown on WhatsApp, Facebook and LinkedIn. Wide works best."
            value={draft.share_image_url}
            onChange={(v) => set("share_image_url", v)}
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

        <BlockList table="project_blocks" parentKey="project_id" parentId={project.id} />
      </section>
    </div>
  );
}

export function ProjectsPanel() {
  const { data = [], isLoading, error } = useRows<CmsProject>("projects");
  const create = useCreateRow("projects");
  const duplicate = useDuplicatePage("projects", "project_blocks", "project_id");
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

      {duplicate.isError ? (
        <p className="aerror">{(duplicate.error as Error).message}</p>
      ) : null}

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
                  className="aicon"
                  aria-label={`Duplicate ${project.title}`}
                  title="Duplicate"
                  disabled={duplicate.isPending}
                  onClick={() =>
                    duplicate.mutate(project.id, {
                      onSuccess: (row) => setOpenId((row as CmsProject).id),
                    })
                  }
                >
                  ⧉
                </button>
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
