import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/** Every table the CMS can edit, and the order rows are listed in. */
export const TABLES = {
  site_settings: { order: null },
  projects: { order: "position" },
  project_blocks: { order: "position" },
  services: { order: "position" },
  process_steps: { order: "position" },
  testimonials: { order: "position" },
  articles: { order: "position" },
  footer_links: { order: "position" },
  media: { order: "created_at" },
} as const;

export type TableName = keyof typeof TABLES;

function client() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

/** Admin reads bypass the published filter — editors see drafts too. */
export function useRows<T>(table: TableName) {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async (): Promise<T[]> => {
      const order = TABLES[table].order;
      let query = client().from(table).select("*");
      if (order) query = query.order(order, { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useSettingsRow<T>() {
  return useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async (): Promise<T> => {
      const { data, error } = await client()
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data as T;
    },
  });
}

/** Invalidates both the admin cache and the public site's cache. */
function useRefresh(table: TableName) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin", table] });
    queryClient.invalidateQueries({ queryKey: [table] });
    // Projects carry their blocks, so a block change refreshes projects too.
    if (table === "project_blocks") {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  };
}

export function useSaveRow(table: TableName) {
  const refresh = useRefresh(table);
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await client().from(table).update(row).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

export function useCreateRow(table: TableName) {
  const refresh = useRefresh(table);
  return useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { data, error } = await client().from(table).insert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: refresh,
  });
}

export function useDeleteRow(table: TableName) {
  const refresh = useRefresh(table);
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client().from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
}

/** Writes a whole list's positions in one round trip. */
export function useReorder(table: TableName) {
  const refresh = useRefresh(table);
  return useMutation({
    mutationFn: async (rows: { id: string; position: number }[]) => {
      await Promise.all(
        rows.map((row) =>
          client().from(table).update({ position: row.position }).eq("id", row.id),
        ),
      );
    },
    onSuccess: refresh,
  });
}

/** Uploads to the `media` bucket and records it in the media table. */
export async function uploadImage(file: File): Promise<string> {
  const db = client();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await db.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw uploadError;

  const url = db.storage.from("media").getPublicUrl(path).data.publicUrl;
  // Best-effort library entry; a failure here must not lose the upload.
  await db.from("media").insert({ path, url, label: file.name });
  return url;
}
