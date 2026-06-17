"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { STANDALONE_SECTIONS, sectionName, type Section } from "@/data/categories";
import { isPartnerBrand, type Brand } from "@/data/brands";
import { matchesProduct } from "@/lib/search";
import { ProductCard } from "./ProductCard";
import { PageHeader } from "./PageHeader";

interface Props {
  products: Product[];
  brands: Brand[];
  sections: Section[];
}

export function CatalogueClient({ products, brands, sections }: Props) {
  const params = useSearchParams();
  const [section, setSection] = useState<string>("all");
  const [sub, setSub] = useState<string>("all");
  const [brand, setBrand] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    setSection(params.get("section") ?? "all");
    setSub(params.get("sub") ?? "all");
    setQuery(params.get("q") ?? "");
  }, [params]);

  // The Ophtalmologie catalogue only — Optique/Occasion live on their own pages.
  const catalogueSections = sections.filter((s) => !STANDALONE_SECTIONS.includes(s.slug));
  const activeSection = section !== "all" ? sections.find((s) => s.slug === section) : undefined;

  const filtered = useMemo(() => {
    const q = query.trim();
    return products.filter((p) => {
      // An active search covers the WHOLE catalog (Optique/Occasion included);
      // otherwise the standalone families stay on their dedicated pages.
      if (q && !matchesProduct(p, q)) return false;
      if (!q && STANDALONE_SECTIONS.includes(p.section)) return false;
      if (section !== "all" && p.section !== section) return false;
      if (sub !== "all" && p.subcategory !== sub) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      return true;
    });
  }, [products, section, sub, brand, query]);

  const reset = () => {
    setSection("all");
    setSub("all");
    setBrand("all");
    setQuery("");
  };

  const selectClass =
    "w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <>
      <PageHeader
        eyebrow="Équipements ophtalmiques de précision"
        title="Notre Catalogue"
      />

      <div className="container-max grid grid-cols-1 gap-8 py-12 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="h-fit rounded-lg border border-outline-variant bg-surface-gray p-6 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary-container">Filtres</h2>
            <button onClick={reset} className="text-sm text-primary-container hover:text-primary">
              Réinitialiser
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <Filter label="Recherche">
              <input
                type="search"
                className={selectClass}
                placeholder="Nom, marque…"
                aria-label="Rechercher un produit"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Filter>

            <Filter label="Section">
              <select
                className={selectClass}
                aria-label="Section"
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  setSub("all");
                }}
              >
                <option value="all">Toutes les sections</option>
                {catalogueSections.map((s) => (
                  <option key={s.slug} value={s.slug}>{sectionName(s)}</option>
                ))}
              </select>
            </Filter>

            <Filter label="Catégorie">
              <select className={selectClass} aria-label="Catégorie" value={sub} onChange={(e) => setSub(e.target.value)} disabled={!activeSection}>
                <option value="all">Toutes les catégories</option>
                {activeSection?.subcategories.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </Filter>

            <Filter label="Marque">
              <select className={selectClass} aria-label="Marque" value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="all">Toutes les marques</option>
                {brands.filter(isPartnerBrand).map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </Filter>
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-6 font-mono text-label-caps uppercase text-on-surface-variant">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant bg-surface-gray p-12 text-center text-on-surface-variant">
              Aucun produit ne correspond à ces filtres.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-label-caps uppercase text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}
