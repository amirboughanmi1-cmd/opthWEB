/**
 * Shared DB → frontend catalog mapping.
 *
 * Used by BOTH the client store (src/lib/store.ts, admin + live sections)
 * and the server data layer (src/lib/server-data.ts, public pages) so the
 * two sides always agree on select strings and shapes.
 *
 * DB ↔ frontend mapping (3-level catalog):
 *  - frontend "section"     = DB subcategory (Ophtalmologie) OR family (Optique/Occasion)
 *  - frontend "subcategory" = DB type
 *  - all FKs are resolved by slug, UUIDs never leave the data layer
 */
import type { Brand } from "@/data/brands";
import type { Section, SubCategory, SectionSlug } from "@/data/categories";
import type { Product } from "@/data/products";
import type { Article } from "@/data/blog";

export const SELECT_FAMILIES = "slug,name,description,sort_order";
export const SELECT_SUBCATEGORIES = "id,slug,name,description,sort_order";
export const SELECT_TYPES = "subcategory_id,slug,name,sort_order";
export const SELECT_BRANDS = "slug,name,logo_url,sort_order,is_partner";
export const SELECT_PRODUCTS =
  "slug,name,image_url,images,hero_image,brochure_url,tagline,description,featured,created_at," +
  "family:families(slug),subcategory:subcategories(slug),type:types(slug),brand:brands(slug,name)";
export const SELECT_ARTICLES = "slug,title,description,category,image_url,pdf_url,published,created_at";

/** "Section A/B/C" labels from the cahier des charges (not stored in DB). */
const SECTION_LABELS: Record<string, string> = {
  consultation: "Section A",
  exploration: "Section B",
  "sante-oculaire": "Section C",
  accessoire: "Section D",
};

/* eslint-disable @typescript-eslint/no-explicit-any -- raw Supabase rows */

export function mapBrands(rows: any[]): Brand[] {
  return rows.map((b) => ({
    slug: b.slug,
    name: b.name,
    logo: b.logo_url ?? null,
    isPartner: b.is_partner ?? true,
  }));
}

/** Sections = Ophtalmologie subcategories + standalone families (Optique/Occasion). */
export function mapSections(subs: any[], typs: any[], fams: any[]): Section[] {
  const sections: Section[] = subs.map((sc) => ({
    slug: sc.slug as SectionSlug,
    label: SECTION_LABELS[sc.slug] ?? sc.name,
    name: sc.name,
    description: sc.description ?? "",
    subcategories: typs
      .filter((t) => t.subcategory_id === sc.id)
      .map((t): SubCategory => ({ slug: t.slug, name: t.name })),
  }));
  for (const f of fams) {
    if (f.slug === "ophtalmologie") continue;
    sections.push({
      slug: f.slug as SectionSlug,
      label: f.name,
      name: f.name,
      description: f.description ?? "",
      subcategories: [],
    });
  }
  return sections;
}

/** Card excerpt = first sentence-ish chunk of the description (word boundary). */
function excerptOf(text: string): string {
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function mapArticles(rows: any[]): Article[] {
  return rows.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: excerptOf(a.description ?? ""),
    body: a.description ?? "",
    category: a.category ?? "Actualités",
    date: a.created_at,
    cover: a.image_url ?? "",
    pdf: a.pdf_url ?? undefined,
    published: !!a.published,
  }));
}

export function mapProducts(rows: any[]): Product[] {
  return rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand?.slug ?? "",
    brandName: p.brand?.name ?? undefined,
    section: (p.subcategory?.slug ?? p.family?.slug ?? "optique") as SectionSlug,
    subcategory: p.type?.slug ?? "",
    image: p.image_url ?? "",
    images: Array.isArray(p.images) ? p.images : [],
    heroImage: p.hero_image ?? undefined,
    featured: !!p.featured,
    brochure: p.brochure_url ?? undefined,
    taglineFr: p.tagline ?? "",
    descriptionFr: p.description ?? "",
  }));
}
