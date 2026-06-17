/**
 * Server-side catalog fetch for the PUBLIC pages (hybrid strategy, step 6).
 *
 * Pages are statically rendered (ISR) from Supabase; the admin dashboard
 * calls /api/revalidate after every write so changes go live immediately.
 * If Supabase is unreachable (build without network, outage) we fall back
 * to the static seed catalog so the vitrine never renders empty.
 */
import "server-only";
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  SELECT_ARTICLES,
  SELECT_BRANDS,
  SELECT_FAMILIES,
  SELECT_PRODUCTS,
  SELECT_SUBCATEGORIES,
  SELECT_TYPES,
  mapArticles,
  mapBrands,
  mapProducts,
  mapSections,
} from "@/lib/catalog";
import type { Brand } from "@/data/brands";
import type { Section } from "@/data/categories";
import type { Product } from "@/data/products";
import type { Article } from "@/data/blog";
import { brands as staticBrands } from "@/data/brands";
import { sections as staticSections } from "@/data/categories";
import { products as staticProducts } from "@/data/products";
import { articles as staticArticles } from "@/data/blog";

export interface PublicCatalog {
  brands: Brand[];
  sections: Section[];
  products: Product[];
}

/** One Supabase round-trip per request/render, deduped via React cache(). */
export const getCatalog = cache(async (): Promise<PublicCatalog> => {
  try {
    const sb = getSupabaseServer();
    const [fams, subs, typs, brs, prods] = await Promise.all([
      sb.from("families").select(SELECT_FAMILIES).order("sort_order"),
      sb.from("subcategories").select(SELECT_SUBCATEGORIES).order("sort_order"),
      sb.from("types").select(SELECT_TYPES).order("sort_order"),
      sb.from("brands").select(SELECT_BRANDS).order("sort_order").order("name"),
      sb.from("products").select(SELECT_PRODUCTS).order("created_at", { ascending: true }),
    ]);

    const err = fams.error ?? subs.error ?? typs.error ?? brs.error ?? prods.error;
    if (err) throw new Error(err.message);

    return {
      brands: mapBrands(brs.data ?? []),
      sections: mapSections(subs.data ?? [], typs.data ?? [], fams.data ?? []),
      products: mapProducts(prods.data ?? []),
    };
  } catch (e) {
    console.error("[server-data] Supabase indisponible — fallback sur le catalogue statique :", e);
    return { brands: staticBrands, sections: staticSections, products: staticProducts };
  }
});


/**
 * Published articles, newest first (RLS already hides unpublished rows from
 * the anon client). Falls back to the static demo articles on fetch failure.
 */
export const getArticles = cache(async (): Promise<Article[]> => {
  try {
    const { data, error } = await getSupabaseServer()
      .from("articles")
      .select(SELECT_ARTICLES)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return mapArticles(data ?? []);
  } catch (e) {
    console.error("[server-data] Articles indisponibles — fallback sur le blog statique :", e);
    return staticArticles;
  }
});
