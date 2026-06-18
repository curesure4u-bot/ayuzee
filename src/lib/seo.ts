type JsonLd = Record<string, unknown> | Record<string, unknown>[];

interface SEOOptions {
  ogType?: "website" | "article" | "product" | "profile";
  ogImage?: string;
  jsonLd?: JsonLd;
}

const JSONLD_ID = "route-jsonld";

export const setSEO = (
  title: string,
  description: string,
  canonicalPath?: string,
  options: SEOOptions = {},
) => {
  document.title = title;

  const upsertMeta = (selector: string, attr: string, attrValue: string, content: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  upsertMeta('meta[name="description"]', "name", "description", description);
  upsertMeta('meta[property="og:title"]', "property", "og:title", title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", description);
  upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

  if (options.ogType) {
    upsertMeta('meta[property="og:type"]', "property", "og:type", options.ogType);
  } else {
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
  }

  if (options.ogImage) {
    upsertMeta('meta[property="og:image"]', "property", "og:image", options.ogImage);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", options.ogImage);
  }

  // Self-referencing canonical + og:url for the current route
  const href = canonicalPath
    ? `https://ayuzee.com${canonicalPath.startsWith("/") ? "" : "/"}${canonicalPath}`
    : (typeof window !== "undefined"
        ? `https://ayuzee.com${window.location.pathname}`
        : "https://ayuzee.com/");

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", href);

  upsertMeta('meta[property="og:url"]', "property", "og:url", href);

  // Manage per-route JSON-LD (kept separate from the sitewide Organization schema in index.html)
  const existing = document.getElementById(JSONLD_ID);
  if (existing) existing.remove();
  if (options.jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = JSONLD_ID;
    script.text = JSON.stringify(options.jsonLd);
    document.head.appendChild(script);
  }
};
