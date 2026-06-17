/**
 * Site-wide search engine (client-side, runs on the store data).
 *
 * Every word of the query must match somewhere; results are scored by WHERE
 * they match (name/title ≫ brand/category ≫ tagline/excerpt ≫ description)
 * so exact product names rank above incidental description matches.
 */
import type { Product } from "@/data/products";
import type { Brand } from "@/data/brands";
import type { Section } from "@/data/categories";
import type { Article } from "@/data/blog";
import { STANDALONE_SECTIONS } from "@/data/categories";

/** Accent- and case-insensitive comparison key ("Unité" → "unite"). */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** True when the product matches the query (name, brand or tagline). */
export function matchesProduct(p: Product, query: string): boolean {
  const nq = normalize(query.trim());
  if (!nq) return true;
  return normalize(`${p.name} ${p.brandName ?? ""} ${p.taglineFr}`).includes(nq);
}

export type SearchHitType = "Produit" | "Catégorie" | "Marque" | "Article" | "Page";

export interface SearchHit {
  type: SearchHitType;
  title: string;
  /** Context under the title — shows WHY the result matched. */
  subtitle?: string;
  href: string;
  image?: string;
  score: number;
}

/** Static pages indexed by the site search (title + hidden keywords). */
const PAGES: { title: string; href: string; text: string }[] = [
  { title: "À Propos", href: "/a-propos", text: "a propos qui sommes nous mission valeurs marques partenaires distributeur equipements medicaux" },
  { title: "Contact & Support", href: "/support", text: "contact support whatsapp telephone email adresse devis demande localisation" },
  { title: "FAQ", href: "/faq", text: "faq questions frequentes reponses aide garantie installation maintenance formation" },
  { title: "Catalogue", href: "/catalogue", text: "catalogue produits equipements ophtalmologie consultation exploration chirurgie" },
  { title: "Optique", href: "/optique", text: "optique montures verres meuleuse atelier monteur" },
  { title: "Occasion", href: "/occasion", text: "occasion seconde main reconditionne materiel usage" },
  { title: "Blog", href: "/blog", text: "blog actualites articles innovation conseils cliniques" },
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Score = sum over query words of the best-matching field weight.
 * A word that matches nothing disqualifies the whole item (AND semantics);
 * matches at a word boundary get a small boost over mid-word matches.
 */
function score(tokens: string[], fields: { text: string; weight: number }[]): number {
  let total = 0;
  for (const tok of tokens) {
    let best = 0;
    for (const f of fields) {
      if (!f.text) continue;
      const t = normalize(f.text);
      if (!t.includes(tok)) continue;
      const atWordStart = new RegExp(`(^|[^a-z0-9])${escapeRegExp(tok)}`).test(t);
      best = Math.max(best, f.weight * (atWordStart ? 1.2 : 1));
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

export interface SearchableData {
  products: Product[];
  sections: Section[];
  brands: Brand[];
  articles: Article[];
}

export function searchAll(data: SearchableData, query: string): SearchHit[] {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const hits: SearchHit[] = [];

  for (const p of data.products) {
    const s = score(tokens, [
      { text: p.name, weight: 100 },
      { text: p.brandName ?? "", weight: 60 },
      { text: p.taglineFr, weight: 40 },
      { text: p.descriptionFr, weight: 20 },
    ]);
    if (s) {
      hits.push({
        type: "Produit",
        title: p.name,
        subtitle: p.taglineFr || p.brandName,
        href: `/produits/${p.slug}`,
        image: p.image || undefined,
        score: s,
      });
    }
  }

  for (const sct of data.sections) {
    const s = score(tokens, [
      { text: sct.name, weight: 90 },
      { text: sct.description, weight: 30 },
    ]);
    if (s) {
      hits.push({
        type: "Catégorie",
        title: sct.name,
        subtitle: sct.description,
        href: STANDALONE_SECTIONS.includes(sct.slug) ? `/${sct.slug}` : `/catalogue?section=${sct.slug}`,
        score: s,
      });
    }
    for (const sub of sct.subcategories) {
      const s2 = score(tokens, [{ text: sub.name, weight: 80 }]);
      if (s2) {
        hits.push({
          type: "Catégorie",
          title: sub.name,
          subtitle: sct.name,
          href: `/catalogue?section=${sct.slug}&sub=${sub.slug}`,
          score: s2,
        });
      }
    }
  }

  for (const b of data.brands) {
    // Non-partner brands (e.g. Huvitz) are excluded from brand search.
    if (b.isPartner === false) continue;
    const s = score(tokens, [{ text: b.name, weight: 90 }]);
    if (s) {
      hits.push({
        type: "Marque",
        title: b.name,
        subtitle: "Voir les produits de la marque",
        href: `/catalogue?brand=${b.slug}`,
        image: b.logo ?? undefined,
        score: s,
      });
    }
  }

  for (const a of data.articles) {
    const s = score(tokens, [
      { text: a.title, weight: 90 },
      { text: a.category, weight: 50 },
      { text: a.body || a.excerpt, weight: 20 },
    ]);
    if (s) {
      hits.push({
        type: "Article",
        title: a.title,
        subtitle: a.excerpt,
        href: `/blog/${a.slug}`,
        image: a.cover || undefined,
        score: s,
      });
    }
  }

  for (const pg of PAGES) {
    const s = score(tokens, [
      { text: pg.title, weight: 70 },
      { text: pg.text, weight: 30 },
    ]);
    if (s) hits.push({ type: "Page", title: pg.title, href: pg.href, score: s });
  }

  return hits.sort((x, y) => y.score - x.score);
}
