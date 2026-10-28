import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/learn";
import { MARKETS } from "@/data/markets";

export const SITE_URL = "https://gcc-tracker-india.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/learn",
    "/learn/glossary",
    "/learn/faq",
    ...ARTICLES.map((a) => `/learn/${a.slug}`),
    "/markets",
    "/markets/countries",
    ...MARKETS.map((m) => `/markets/${m.id}`),
    "/methodology",
    "/tools",
    "/location",
    "/financials",
    "/stress-test",
    "/benchmark",
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : p.startsWith("/learn") || p.startsWith("/markets") ? 0.8 : 0.6 }));
}
