import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The browser client, or null when the project is not configured.
 *
 * The public site falls back to its built-in content when this is null, so
 * a missing env var degrades to the seeded design rather than a blank page.
 * The CMS, which cannot work without it, says so explicitly.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // The CMS lives at /admin; no OAuth redirects to parse.
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSupabaseConfigured = supabase !== null;

/** Public URL for a file in the `media` bucket. */
export function mediaUrl(path: string): string {
  if (!supabase) return path;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
