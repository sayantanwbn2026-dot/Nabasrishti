import { useEffect } from "react";

type Meta = {
  title?: string;
  description?: string;
  image?: string;
};

function setTag(selector: string, attribute: string, value: string) {
  const tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) return undefined;
  const previous = tag.getAttribute(attribute) ?? "";
  tag.setAttribute(attribute, value);
  return () => tag.setAttribute(attribute, previous);
}

/**
 * Applies a page's own title and description while it is open.
 *
 * Project and journal pages are dialogs rather than separate documents,
 * so without this they would all share the home page's title — and the
 * per-page wording the CMS collects would never reach anything. Each
 * value is restored when the page closes, so the home page is never left
 * wearing a project's title.
 *
 * This does not help a crawler that never runs the page's code; it is for
 * the browser tab, the bookmark, and anything reading the live document.
 */
export function usePageMeta(meta: Meta | null) {
  const { title, description, image } = meta ?? {};

  useEffect(() => {
    if (!title && !description && !image) return;

    const restores: (undefined | (() => void))[] = [];

    if (title) {
      const previousTitle = document.title;
      document.title = title;
      restores.push(() => {
        document.title = previousTitle;
      });
      restores.push(setTag('meta[property="og:title"]', "content", title));
      restores.push(setTag('meta[name="twitter:title"]', "content", title));
    }

    if (description) {
      restores.push(setTag('meta[name="description"]', "content", description));
      restores.push(
        setTag('meta[property="og:description"]', "content", description),
      );
      restores.push(
        setTag('meta[name="twitter:description"]', "content", description),
      );
    }

    if (image) {
      restores.push(setTag('meta[property="og:image"]', "content", image));
      restores.push(setTag('meta[name="twitter:image"]', "content", image));
    }

    return () => {
      for (const restore of restores) restore?.();
    };
  }, [title, description, image]);
}
