import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/server-data";
import { STANDALONE_SECTIONS } from "@/data/categories";
import { ProductView } from "@/components/ProductView";

/**
 * Hybrid strategy: known slugs are prerendered, new admin-created slugs
 * render on demand (dynamicParams), and /api/revalidate refreshes pages
 * right after a dashboard write. The hourly revalidate is a safety net.
 */
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.taglineFr,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { products, sections } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const section = sections.find((s) => s.slug === product.section);
  const related = products
    .filter((p) => p.section === product.section && p.slug !== product.slug)
    .slice(0, 3);

  return (
    <ProductView
      product={product}
      related={related}
      sectionLabel={section?.name ?? product.section}
      sectionHref={
        STANDALONE_SECTIONS.includes(product.section)
          ? `/${product.section}`
          : `/catalogue?section=${product.section}`
      }
      subcategoryName={
        section?.subcategories.find((t) => t.slug === product.subcategory)?.name ??
        product.subcategory
      }
    />
  );
}
