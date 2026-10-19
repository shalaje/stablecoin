export const SITE = {
  name: "Arcway",
  url: "https://arcway.vercel.app",
  description:
    "Arcway moves business payments across borders in seconds over stablecoins, with local currency in and out at each end. A design concept by Nova Digital Studio.",
};

export function pageMeta(title: string, description = SITE.description, path = "/") {
  const url = `${SITE.url}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Arcway (concept)" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: `${SITE.url}/og.png` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: `${SITE.url}/og.png` },
  ];
}

export const NAV = [
  { label: "Product", hash: "journey" },
  { label: "Developers", to: "/developers" },
  { label: "Pricing", hash: "send" },
];
