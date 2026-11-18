import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

/** Every table the public site reads. */
const CONTENT_TABLES = [
  "site_settings",
  "projects",
  "project_blocks",
  "services",
  "process_steps",
  "testimonials",
  "articles",
  "article_blocks",
  "footer_links",
  "social_links",
  "nav_links",
  "transformations",
  "home_sections",
] as const;

/** A block change has to refresh the parent the site actually queries. */
const ALSO_REFRESH: Record<string, string[]> = {
  project_blocks: ["projects"],
  article_blocks: ["articles"],
};

/**
 * Keeps an open page in step with the CMS.
 *
 * Without this a visitor — or the editor with the site open in a second
 * tab — would hold cached content until the query went stale and something
 * happened to trigger a refetch. Supabase streams the change instead, and
 * the affected query is invalidated the moment a row is written.
 *
 * If the socket cannot connect, the queries' own staleness rules still
 * apply, so the page is never worse off than before.
 */
export function useLiveContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) return;
    // Narrow once; the cleanup below closes over this.
    const client = supabase;

    const channel = client.channel("public-content");

    for (const table of CONTENT_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryClient.invalidateQueries({ queryKey: [table] });
          for (const extra of ALSO_REFRESH[table] ?? []) {
            queryClient.invalidateQueries({ queryKey: [extra] });
          }
        },
      );
    }

    channel.subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [queryClient]);
}
