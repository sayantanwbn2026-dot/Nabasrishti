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
  TextArea,
  TextField,
  Toggle,
} from "./Fields";
import { BlockList } from "./BlockEditing";
import type { Article } from "@/lib/content";

function ArticleEditor({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  const save = useSaveRow("articles");
  const [draft, setDraft] = useState<Article>(article);

  useEffect(() => setDraft(article), [article]);

  const set = <K extends keyof Article>(key: K, value: Article[K]) =>
    setDraft({ ...draft, [key]: value });

  const dirty =
    JSON.stringify({ ...draft, blocks: null }) !==
    JSON.stringify({ ...article, blocks: null });

  return (
    <div className="apanel">
      <header className="apanel__head">
        <div>
          <button type="button" className="abtn abtn--quiet" onClick={onBack}>
            ← All posts
          </button>
          <h1>{draft.title}</h1>
          <p className="amuted">
            Journal posts open as their own page, exactly like projects do.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          disabled={!dirty || save.isPending}
          onClick={() => {
            const { blocks: _ignored, ...row } = draft;
            save.mutate(row as unknown as Record<string, unknown>);
          }}
        >
          {save.isPending ? "Saving…" : dirty ? "Save post" : "Saved"}
        </button>
      </header>

      {save.isError ? <p className="aerror">{(save.error as Error).message}</p> : null}

      <section className="asection">
        <h2 className="asection__title">Details</h2>
        <div className="aform">
          <TextField label="Title" value={draft.title} onChange={(v) => set("title", v)} />
          <TextField
            label="Web address"
            hint="Lowercase, words joined by hyphens."
            value={draft.slug ?? ""}
            onChange={(v) => set("slug", v)}
            mono
          />
          <TextArea
            label="Summary"
            hint="The opening paragraph on the post's page."
            rows={3}
            value={draft.excerpt}
            onChange={(v) => set("excerpt", v)}
          />
          <TextField
            label="Date shown"
            hint="For example March 2026"
            value={draft.date_label}
            onChange={(v) => set("date_label", v)}
          />
          <TextField label="Author" value={draft.author} onChange={(v) => set("author", v)} />
          <NumberField
            label="Reading time in minutes"
            hint="0 hides it."
            value={draft.read_minutes}
            onChange={(v) => set("read_minutes", v)}
          />
        </div>
      </section>

      <section className="asection">
        <h2 className="asection__title">Card in the journal grid</h2>
        <div className="aform">
          <ImageField label="Image" value={draft.image_url} onChange={(v) => set("image_url", v)} />
          <TextField
            label="Image description"
            value={draft.image_alt}
            onChange={(v) => set("image_alt", v)}
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
              { value: "two-column", label: "Summary beside the margin" },
              { value: "stacked", label: "Summary full width" },
            ]}
            onChange={(v) => set("detail_layout", v as Article["detail_layout"])}
          />
          <Toggle label="Show enquiry button" value={draft.show_cta} onChange={(v) => set("show_cta", v)} />
          <TextField label="Button label" value={draft.cta_label} onChange={(v) => set("cta_label", v)} />
          <Toggle
            label="Visible on the website"
            value={draft.is_published}
            onChange={(v) => set("is_published", v)}
          />
        </div>
      </section>

      <section className="asection">
        <div className="asection__head">
          <h2 className="asection__title">Page content</h2>
          <p className="amuted">
            The body of the post, built from the same sections as a project page.
          </p>
        </div>
        <BlockList table="article_blocks" parentKey="article_id" parentId={article.id} />
      </section>
    </div>
  );
}

export function ArticlesPanel() {
  const { data = [], isLoading, error } = useRows<Article>("articles");
  const create = useCreateRow("articles");
  const remove = useDeleteRow("articles");
  const reorder = useReorder("articles");
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;

  const active = data.find((article) => article.id === openId);
  if (active) return <ArticleEditor article={active} onBack={() => setOpenId(null)} />;

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
          <h1>Journal</h1>
          <p className="amuted">
            Posts in “Notes From The Studio”. Each one opens as its own page.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          onClick={() =>
            create.mutate(
              {
                title: "New post",
                slug: `post-${Date.now()}`,
                position: (data.length + 1) * 10,
                is_published: false,
              },
              { onSuccess: (row) => setOpenId((row as Article).id) },
            )
          }
        >
          Add post
        </button>
      </header>

      <div className="alist">
        {data.map((article, index) => (
          <div className="arow" key={article.id}>
            <div className="arow__head">
              <button
                type="button"
                className="arow__title"
                onClick={() => setOpenId(article.id)}
              >
                <span className="arow__thumb">
                  {article.image_url ? <img src={article.image_url} alt="" /> : null}
                </span>
                <span>
                  <strong>{article.title}</strong>
                  <span className="amuted">{article.date_label}</span>
                </span>
                {!article.is_published ? <span className="atag">Hidden</span> : null}
              </button>
              <div className="arow__actions">
                <button type="button" className="aicon" onClick={() => move(index, -1)} aria-label="Move up">↑</button>
                <button type="button" className="aicon" onClick={() => move(index, 1)} aria-label="Move down">↓</button>
                <button
                  type="button"
                  className="aicon aicon--danger"
                  aria-label="Delete post"
                  onClick={() => {
                    if (window.confirm(`Delete “${article.title}” and its page?`)) {
                      remove.mutate(article.id);
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
