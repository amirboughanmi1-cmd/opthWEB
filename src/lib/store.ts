"use client";

/**
 * Supabase-backed admin/data store (replaces the localStorage prototype).
 *
 * Keeps the same API surface (useAdminData + CRUD helpers) but every
 * operation now reads/writes Postgres through the anon client — gated by
 * RLS (public read, admin write, anonymous lead insert).
 *
 * DB ↔ frontend mapping (3-level catalog):
 *  - frontend "section"     = DB subcategory (Ophtalmologie) OR family (Optique/Occasion)
 *  - frontend "subcategory" = DB type
 *  - all FKs are resolved by slug, UUIDs never leave this module
 */
import { useSyncExternalStore } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
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
import { STANDALONE_SECTIONS, type Section, type SubCategory, type SectionSlug } from "@/data/categories";
import type { Product } from "@/data/products";
import type { Article } from "@/data/blog";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  productSlug: string;
  productName: string;
  date: string; // ISO
}

export interface AdminData {
  /** False until the first Supabase fetch resolves (avoid "empty" flashes). */
  ready: boolean;
  brands: Brand[];
  sections: Section[];
  products: Product[];
  /** Admin sees all articles (RLS); anonymous visitors only the published ones. */
  articles: Article[];
  leads: Lead[];
}

const EMPTY: AdminData = { ready: false, brands: [], sections: [], products: [], articles: [], leads: [] };

/* ───────────────── Fetch + cache ───────────────── */

let cache: AdminData = EMPTY;
let started = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

async function fetchAll(): Promise<AdminData> {
  const sb = getSupabaseBrowser();

  const [fams, subs, typs, brs, prods, arts] = await Promise.all([
    sb.from("families").select(SELECT_FAMILIES).order("sort_order"),
    sb.from("subcategories").select(SELECT_SUBCATEGORIES).order("sort_order"),
    sb.from("types").select(SELECT_TYPES).order("sort_order"),
    sb.from("brands").select(SELECT_BRANDS).order("sort_order").order("name"),
    sb.from("products").select(SELECT_PRODUCTS).order("created_at", { ascending: true }),
    sb.from("articles").select(SELECT_ARTICLES).order("created_at", { ascending: false }),
  ]);

  const err = fams.error ?? subs.error ?? typs.error ?? brs.error ?? prods.error;
  if (err) throw new Error(err.message);

  // Articles are soft-fail: a missing migration must not break the catalog.
  if (arts.error) console.error("[store] articles indisponibles :", arts.error.message);

  // Leads are admin-only (RLS) — a denied select just means "not logged in".
  const leadsRes = await sb
    .from("leads")
    .select("id,name,email,phone,organization,product_name,created_at,product:products(slug)")
    .order("created_at", { ascending: false });

  const brands = mapBrands(brs.data ?? []);
  const sections = mapSections(subs.data ?? [], typs.data ?? [], fams.data ?? []);
  const products = mapProducts(prods.data ?? []);
  const articles = arts.error ? [] : mapArticles(arts.data ?? []);

  const leads: Lead[] = leadsRes.error
    ? []
    : (leadsRes.data ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone ?? "",
        organization: l.organization ?? "",
        productSlug: l.product?.slug ?? "",
        productName: l.product_name ?? "",
        date: l.created_at,
      }));

  return { ready: true, brands, sections, products, articles, leads };
}

async function refresh() {
  try {
    cache = await fetchAll();
  } catch (e) {
    console.error("[store] Supabase fetch failed:", e);
    cache = { ...cache, ready: true };
  }
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!started) {
    started = true;
    void refresh();
  }
  return () => listeners.delete(cb);
}

/** Reactive read of the whole dataset (fetched from Supabase on first mount). */
export function useAdminData(): AdminData {
  return useSyncExternalStore(subscribe, () => cache, () => EMPTY);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ───────────────── Internal helpers ───────────────── */

/**
 * Fire-and-forget after every admin write: asks Next to regenerate the
 * public pages (hybrid ISR) so the change is visible immediately.
 * Failure is non-fatal — pages still refresh on the timed revalidate.
 */
async function revalidatePublic() {
  try {
    const { data } = await getSupabaseBrowser().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    });
  } catch (e) {
    console.warn("[store] revalidation ignorée :", e);
  }
}

async function idBySlug(table: string, slug: string): Promise<string> {
  const { data, error } = await getSupabaseBrowser()
    .from(table)
    .select("id")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`Référence introuvable dans "${table}" : ${slug}`);
  return data.id;
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ───────────────── Products ───────────────── */

export async function saveProduct(p: Product, originalSlug?: string) {
  const sb = getSupabaseBrowser();
  const standalone = STANDALONE_SECTIONS.includes(p.section);
  const family_id = await idBySlug("families", standalone ? p.section : "ophtalmologie");

  let subcategory_id: string | null = null;
  let type_id: string | null = null;
  if (!standalone) {
    subcategory_id = await idBySlug("subcategories", p.section);
    if (p.subcategory) {
      const { data } = await sb
        .from("types")
        .select("id")
        .eq("slug", p.subcategory)
        .eq("subcategory_id", subcategory_id)
        .maybeSingle();
      type_id = data?.id ?? null;
    }
  }
  const brand_id = p.brand ? await idBySlug("brands", p.brand) : null;

  const row = {
    slug: p.slug,
    name: p.name,
    family_id,
    subcategory_id,
    type_id,
    brand_id,
    image_url: p.image || null,
    images: p.images ?? [],
    hero_image: p.heroImage || null,
    brochure_url: p.brochure || null,
    tagline: p.taglineFr || null,
    description: p.descriptionFr || null,
    featured: !!p.featured,
  };

  const { error } = originalSlug
    ? await sb.from("products").update(row).eq("slug", originalSlug)
    : await sb.from("products").insert(row);
  fail(error);
  await refresh();
  void revalidatePublic();
}

export async function deleteProduct(slug: string) {
  const { error } = await getSupabaseBrowser().from("products").delete().eq("slug", slug);
  fail(error);
  await refresh();
  void revalidatePublic();
}

/* ───────────────── Brands ───────────────── */

export async function saveBrand(b: Brand, originalSlug?: string) {
  const sb = getSupabaseBrowser();
  const row = { slug: b.slug, name: b.name, logo_url: b.logo || null, is_partner: b.isPartner !== false };
  const { error } = originalSlug
    ? await sb.from("brands").update(row).eq("slug", originalSlug)
    : await sb.from("brands").insert(row);
  fail(error);
  await refresh();
  void revalidatePublic();
}

export async function deleteBrand(slug: string) {
  // products.brand_id is "on delete set null" → products survive without marque.
  const { error } = await getSupabaseBrowser().from("brands").delete().eq("slug", slug);
  fail(error);
  await refresh();
  void revalidatePublic();
}

/* ───────────────── Categories (sections) ───────────────── */

export async function saveCategory(section: Section, originalSlug?: string) {
  const sb = getSupabaseBrowser();
  const target = (originalSlug ?? section.slug) as SectionSlug;

  if (STANDALONE_SECTIONS.includes(target)) {
    // Optique / Occasion are families.
    const { error } = await sb
      .from("families")
      .update({ name: section.name, description: section.description || null })
      .eq("slug", target);
    fail(error);
  } else if (originalSlug) {
    const { error } = await sb
      .from("subcategories")
      .update({ name: section.name, description: section.description || null })
      .eq("slug", originalSlug);
    fail(error);
  } else {
    // New categories live under the Ophtalmologie family.
    const family_id = await idBySlug("families", "ophtalmologie");
    const { error } = await sb.from("subcategories").insert({
      family_id,
      slug: section.slug,
      name: section.name,
      description: section.description || null,
    });
    fail(error);
  }
  await refresh();
  void revalidatePublic();
}

export async function deleteCategory(slug: string) {
  if (STANDALONE_SECTIONS.includes(slug as SectionSlug)) {
    throw new Error("Les familles Optique et Occasion ne peuvent pas être supprimées.");
  }
  const { error } = await getSupabaseBrowser().from("subcategories").delete().eq("slug", slug);
  fail(error);
  await refresh();
  void revalidatePublic();
}

/* ───────────────── Types (sous-catégories) ───────────────── */

export async function addType(sectionSlug: string, sub: SubCategory) {
  if (STANDALONE_SECTIONS.includes(sectionSlug as SectionSlug)) {
    throw new Error("Les familles Optique et Occasion n'ont pas de types.");
  }
  const subcategory_id = await idBySlug("subcategories", sectionSlug);
  const { error } = await getSupabaseBrowser()
    .from("types")
    .insert({ subcategory_id, slug: sub.slug, name: sub.name });
  fail(error);
  await refresh();
  void revalidatePublic();
}

export async function deleteType(sectionSlug: string, subSlug: string) {
  const subcategory_id = await idBySlug("subcategories", sectionSlug);
  const { error } = await getSupabaseBrowser()
    .from("types")
    .delete()
    .eq("subcategory_id", subcategory_id)
    .eq("slug", subSlug);
  fail(error);
  await refresh();
  void revalidatePublic();
}

/* ───────────────── Articles (blog) ───────────────── */

export async function saveArticle(a: Article, originalSlug?: string) {
  const sb = getSupabaseBrowser();
  const row = {
    slug: a.slug,
    title: a.title,
    description: a.body || null,
    category: a.category || null,
    image_url: a.cover || null,
    pdf_url: a.pdf || null,
    published: a.published ?? true,
  };
  const { error } = originalSlug
    ? await sb.from("articles").update(row).eq("slug", originalSlug)
    : await sb.from("articles").insert(row);
  fail(error);
  await refresh();
  void revalidatePublic();
}

export async function deleteArticle(slug: string) {
  const { error } = await getSupabaseBrowser().from("articles").delete().eq("slug", slug);
  fail(error);
  await refresh();
  void revalidatePublic();
}

/* ───────────────── Leads ───────────────── */

export async function addLead(lead: Omit<Lead, "id" | "date">) {
  const sb = getSupabaseBrowser();
  // Anonymous insert allowed by RLS; product_id resolved by slug (public read).
  const { data: prod } = await sb
    .from("products")
    .select("id")
    .eq("slug", lead.productSlug)
    .maybeSingle();
  const { error } = await sb.from("leads").insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    organization: lead.organization || null,
    product_id: prod?.id ?? null,
    product_name: lead.productName,
  });
  fail(error);
}

export async function deleteLead(leadId: string) {
  const { error } = await getSupabaseBrowser().from("leads").delete().eq("id", leadId);
  fail(error);
  await refresh();
}

export type { Product, Brand, Section, SubCategory, Article };
