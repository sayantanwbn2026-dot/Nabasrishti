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

/**
 * Keeps the page's structured data in step with the CMS.
 *
 * The block in `index.html` is the crawler-safe baseline; this rewrites it
 * from the live settings so a phone number or address changed in the CMS
 * does not leave Google reading last year's details. Google renders the
 * page before reading structured data, so the rewritten block is what it
 * sees; a crawler that does not run scripts still gets the baseline.
 */
export function useStructuredData(business: {
  name: string;
  url: string;
  logo: string;
  image: string;
  description: string;
  phoneDigits: string;
  email: string;
  address: string;
  areaServed: string;
  sameAs: string[];
}) {
  const key = JSON.stringify(business);

  useEffect(() => {
    const tag = document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );
    if (!tag) return;

    const previous = tag.textContent;
    const data: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "InteriorDesignBusiness",
      name: business.name,
      url: business.url,
      logo: business.logo,
      image: business.image,
      description: business.description,
      areaServed: business.areaServed,
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: "Kolkata",
        addressRegion: "West Bengal",
        addressCountry: "IN",
      },
    };
    // Only state what we actually hold: an empty field is worse than none.
    if (business.phoneDigits) data.telephone = `+${business.phoneDigits}`;
    if (business.email) data.email = business.email;
    /* A social link that is only a domain is the network's front page, not
       this studio's profile. Telling Google that instagram.com *is* the
       business is worse than saying nothing, so those are left out. */
    const profiles = business.sameAs.filter((url) => {
      try {
        return new URL(url).pathname.replace(/\/+$/, "").length > 0;
      } catch {
        return false;
      }
    });
    if (profiles.length > 0) data.sameAs = profiles;

    tag.textContent = JSON.stringify(data, null, 2);

    return () => {
      tag.textContent = previous;
    };
    // `key` is the serialised form of `business`, so it is the dependency.
  }, [key]);
}

/**
 * Keeps a page out of the index while it is open.
 *
 * The SPA rewrite answers every unknown path with the app and a 200, so
 * without this a mistyped URL is a soft 404 that Google is free to index.
 * The thank-you page is listed in robots.txt as well; this covers the
 * crawler that fetched the URL before reading it.
 */
export function useNoIndex() {
  useEffect(() => {
    const tag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!tag) return;
    const previous = tag.getAttribute("content") ?? "index, follow";
    tag.setAttribute("content", "noindex, follow");
    return () => tag.setAttribute("content", previous);
  }, []);
}
