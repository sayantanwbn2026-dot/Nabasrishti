import { useReorder, useRows, useSaveRow } from "./api";
import { Toggle } from "./Fields";
import type { HomeSection } from "@/lib/content";

/**
 * The order of the bands down the home page.
 *
 * Deliberately not a CollectionPanel: nothing here is created or deleted,
 * because each row stands for a band the page knows how to draw. The
 * editor only moves them and switches them on or off.
 */
export function SectionsPanel() {
  const { data = [], isLoading, error } = useRows<HomeSection>("home_sections");
  const reorder = useReorder("home_sections");
  const save = useSaveRow("home_sections");

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;

  /* A locked band is an anchor, not a row in the queue: the hero stays at
     the top and the closing banner at the bottom. Only the stretch
     between them can be rearranged, so a move is worked out against that
     stretch and the anchors are written back around it. */
  const movable = data.filter((row) => !row.is_locked);
  const first = data.filter((row) => row.is_locked && row.position <= 0);
  const last = data.filter((row) => row.is_locked && row.position > 0);

  const commit = (nextMovable: HomeSection[]) => {
    const ordered = [...first, ...nextMovable, ...last];
    reorder.mutate(
      ordered.map((row, index) => ({ id: row.id, position: index * 10 })),
    );
  };

  const move = (row: HomeSection, delta: number) => {
    const index = movable.findIndex((item) => item.id === row.id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= movable.length) return;
    const next = [...movable];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  return (
    <section className="apanel">
      <header className="apanel__head">
        <div>
          <h2>Page sections</h2>
          <p className="amuted">
            The order of the bands down the home page. Use ↑ and ↓ to
            rearrange them, and the switch to take one off the site without
            losing anything inside it.
          </p>
        </div>
      </header>

      <ul className="asections">
        {data.map((row) => {
          const index = movable.findIndex((item) => item.id === row.id);
          return (
            <li
              className={`asection ${row.is_locked ? "asection--locked" : ""}`}
              key={row.id}
            >
              <div className="asection__move">
                <button
                  type="button"
                  onClick={() => move(row, -1)}
                  disabled={row.is_locked || index <= 0}
                  aria-label={`Move ${row.label} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(row, 1)}
                  disabled={row.is_locked || index < 0 || index >= movable.length - 1}
                  aria-label={`Move ${row.label} down`}
                >
                  ↓
                </button>
              </div>

              <div className="asection__body">
                <p className="asection__label">{row.label}</p>
                {row.note ? <p className="amuted">{row.note}</p> : null}
              </div>

              {row.is_locked ? (
                <span className="asection__fixed">Fixed</span>
              ) : (
                <Toggle
                  label="On the site"
                  value={row.is_published}
                  onChange={(is_published) =>
                    save.mutate({ id: row.id, is_published })
                  }
                />
              )}
            </li>
          );
        })}
      </ul>

      {reorder.isError || save.isError ? (
        <p className="aerror">
          {((reorder.error ?? save.error) as Error)?.message}
        </p>
      ) : null}
    </section>
  );
}
