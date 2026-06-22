import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/server-data";
import { SITE_URL } from "@/lib/site-url";

/**
 * SEO sitemap — static pages + every product from Supabase.
 * Refreshed hourly (same ISR window as the pages themselves).
 */
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/catalogue", priority: 0.9 },
  { path: "/optique", priority: 0.8 },
  { path: "/occasion", priority: 0.8 },
  { path: "/a-propos", priority: 0.6 },
  { path: "/support", priority: 0.6 },
  { path: "/sav", priority: 0.6 },
  { path: "/faq", priority: 0.5 },
  { path: "/confidentialite", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();

  return [
    ...STATIC_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      changeFrequency: "weekly" as const,
      priority: p.priority,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produits/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
