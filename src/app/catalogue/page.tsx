import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogueClient } from "@/components/CatalogueClient";
import { getCatalog } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Parcourez le catalogue complet des équipements ophtalmiques OphtaHealth : consultation, exploration et santé oculaire. Filtrez par section, catégorie, marque et disponibilité.",
};

/** ISR safety net — the admin dashboard revalidates on-demand after writes. */
export const revalidate = 3600;

export default async function CataloguePage() {
  const { products, brands, sections } = await getCatalog();
  return (
    <Suspense fallback={<div className="container-max py-12 text-on-surface-variant">…</div>}>
      <CatalogueClient products={products} brands={brands} sections={sections} />
    </Suspense>
  );
}
