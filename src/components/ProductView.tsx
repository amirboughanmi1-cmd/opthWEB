import Link from "next/link";
import { type Product, productDescription } from "@/data/products";
import { getBrand } from "@/data/brands";
import { ProductActions } from "./ProductActions";
import { ProductCard } from "./ProductCard";
import { ProductGallery } from "./ProductGallery";
import { ChevronRight } from "./Icons";
import { t } from "@/i18n/ui";

interface Props {
  product: Product;
  /** Up to 3 products from the same section ("Produits similaires"). */
  related: Product[];
  /** Display name of the section (breadcrumb + eyebrow). */
  sectionLabel: string;
  /** Breadcrumb target: /catalogue?section=… or /optique | /occasion. */
  sectionHref: string;
  /** Display name of the type; empty for Optique/Occasion products. */
  subcategoryName: string;
}

export function ProductView({ product, related, sectionLabel, sectionHref, subcategoryName }: Props) {
  // DB products carry brandName from the join; static seeds resolve locally.
  const brandName = product.brandName ?? getBrand(product.brand)?.name;

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-outline-variant bg-surface-gray">
        <nav className="container-max flex flex-wrap items-center gap-2 py-4 font-mono text-label-caps uppercase text-on-surface-variant">
          <Link href="/catalogue" className="hover:text-primary">Catalogue</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={sectionHref} className="hover:text-primary">
            {sectionLabel}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary-container">{product.name}</span>
        </nav>
      </div>

      <article className="container-max py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Image gallery — one image renders plainly; several become a carousel */}
          <ProductGallery
            images={[product.image, ...(product.images ?? [])].filter(Boolean)}
            alt={product.name}
          />

          {/* Info */}
          <div className="flex flex-col">
            <p className="mb-2 font-mono text-label-caps uppercase tracking-wide text-on-surface-variant">
              {sectionLabel}
              {subcategoryName ? ` / ${subcategoryName}` : ""}
            </p>
            <h1 className="mb-3 font-display text-display-md text-primary-container">{product.name}</h1>
            {brandName && (
              <p className="mb-4 text-on-surface-variant">
                {t("brand")} :{" "}
                <Link href={`/catalogue?brand=${product.brand}`} className="font-medium text-primary-container hover:text-primary">
                  {brandName}
                </Link>
              </p>
            )}

            <span className="mb-6 w-fit rounded-full bg-primary/10 px-3 py-1 font-mono text-label-caps uppercase text-primary">
              {t("madeToOrder")}
            </span>

            <p className="mb-8 whitespace-pre-line leading-relaxed text-on-surface">{productDescription(product)}</p>

            <ProductActions
              productName={product.name}
              productSlug={product.slug}
              brandName={brandName ?? ""}
              brochure={product.brochure}
            />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 font-display text-headline-lg text-primary-container">
              Produits similaires
            </h2>
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
