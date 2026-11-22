import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Enquiry } from "@/lib/content";

const STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;

/** RFC 4180 quoting: wrap in quotes, double any quote inside. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: Enquiry[]): string {
  const headers = [
    "Received",
    "Name",
    "Mobile",
    "City",
    "Service",
    "Comments",
    "Came from",
    "Page",
    "Status",
    "Notes",
  ];
  const lines = rows.map((row) =>
    [
      new Date(row.created_at).toLocaleString(),
      row.name,
      // Excel strips the leading digits off a long number; a leading
      // apostrophe keeps the mobile intact when the file is opened.
      `'${row.mobile}`,
      row.city,
      row.service,
      row.comments,
      row.source,
      row.page,
      row.status,
      row.notes,
    ]
      .map(csvCell)
      .join(","),
  );
  // The BOM makes Excel read it as UTF-8 rather than mangling accents.
  return "﻿" + [headers.map(csvCell).join(","), ...lines].join("\r\n");
}

export function EnquiriesPanel() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async (): Promise<Enquiry[]> => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data: rows, error: queryError } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return (rows ?? []) as Enquiry[];
    },
  });

  const update = useMutation({
    mutationFn: async (row: Partial<Enquiry> & { id: string }) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error: saveError } = await supabase
        .from("enquiries")
        .update(row)
        .eq("id", row.id);
      if (saveError) throw saveError;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { error: deleteError } = await supabase
        .from("enquiries")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });

  const visible = useMemo(
    () => (filter === "all" ? data : data.filter((row) => row.status === filter)),
    [data, filter],
  );

  const download = () => {
    const blob = new Blob([toCsv(visible)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `nabasrishti-enquiries-${filter}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;

  const counts = STATUSES.reduce<Record<string, number>>((acc, status) => {
    acc[status] = data.filter((row) => row.status === status).length;
    return acc;
  }, {});

  return (
    <div className="apanel apanel--wide">
      <header className="apanel__head">
        <div>
          <h1>Enquiries</h1>
          <p className="amuted">
            Every form submission, newest first. {data.length} in total.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          onClick={download}
          disabled={visible.length === 0}
        >
          Download CSV
        </button>
      </header>

      <nav className="atabs">
        <button
          type="button"
          className={`atab ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({data.length})
        </button>
        {STATUSES.map((status) => (
          <button
            type="button"
            key={status}
            className={`atab ${filter === status ? "is-active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status} ({counts[status] ?? 0})
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="amuted">
          {data.length === 0
            ? "No enquiries yet. They appear here the moment someone submits the form."
            : "Nothing with that status."}
        </p>
      ) : null}

      <div className="alist">
        {visible.map((row) => {
          const isOpen = openId === row.id;
          return (
            <div className={`arow ${isOpen ? "is-open" : ""}`} key={row.id}>
              <div className="arow__head">
                <button
                  type="button"
                  className="arow__title"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                >
                  <span className={`astatus astatus--${row.status}`}>{row.status}</span>
                  <span>
                    <strong>{row.name || "No name"}</strong>
                    <span className="amuted">
                      {[row.mobile, row.city, row.service]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </button>
                <span className="amuted adate">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>

              {isOpen ? (
                <div className="arow__body">
                  <dl className="adetails">
                    <div>
                      <dt>Received</dt>
                      <dd>{new Date(row.created_at).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt>Mobile</dt>
                      <dd>
                        <a href={`tel:${row.mobile}`}>{row.mobile}</a>
                        {" · "}
                        <a
                          href={`https://wa.me/91${row.mobile}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>City or area</dt>
                      <dd>{row.city || "—"}</dd>
                    </div>
                    <div>
                      <dt>Service</dt>
                      <dd>{row.service || "—"}</dd>
                    </div>
                    <div>
                      <dt>Came from</dt>
                      <dd>{row.source || "—"}</dd>
                    </div>
                  </dl>

                  {row.comments ? (
                    <p className="aquote">{row.comments}</p>
                  ) : null}

                  <div className="aform">
                    <label className="af">
                      <span className="af__label">Status</span>
                      <select
                        className="af__input af__select"
                        value={row.status}
                        onChange={(event) =>
                          update.mutate({ id: row.id, status: event.target.value })
                        }
                      >
                        {STATUSES.map((status) => (
                          <option value={status} key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="af">
                      <span className="af__label">Private notes</span>
                      <textarea
                        className="af__input af__input--area"
                        rows={3}
                        defaultValue={row.notes}
                        onBlur={(event) =>
                          event.target.value !== row.notes &&
                          update.mutate({ id: row.id, notes: event.target.value })
                        }
                      />
                      <span className="af__hint">Saved when you click away.</span>
                    </label>
                  </div>

                  <div className="arow__foot">
                    <button
                      type="button"
                      className="abtn abtn--quiet"
                      onClick={() => {
                        if (window.confirm(`Delete the enquiry from ${row.name}?`)) {
                          remove.mutate(row.id);
                        }
                      }}
                    >
                      Delete enquiry
                    </button>
                    {update.isError ? (
                      <span className="aerror">{(update.error as Error).message}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
