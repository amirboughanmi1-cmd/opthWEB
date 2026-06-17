import Link from "next/link";
import type { Product } from "@/data/products";
import { getBrand } from "@/data/brands";
import { ProductImage } from "./ProductImage";
import { ArrowRight } from "./Icons";
import { t } from "@/i18n/ui";

export function ProductCard({ product }: { product: Product }) {
  // DB products carry brandName from the join; static seeds resolve locally.
  const brandLabel = product.brandName ?? getBrand(product.brand)?.name ?? "";
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-clinical-white transition-shadow hover:shadow-md">
      <Link href={`/produits/${product.slug}`} className="relative block">
        <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-outline-variant bg-clinical-white">
          <ProductImage
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-primary/10 px-3 py-1 font-mono text-label-caps uppercase text-primary">
          {t("madeToOrder")}
        </span>
      </Link>
      <div className="flex flex-grow flex-col p-5">
        {brandLabel && (
          <p className="mb-1 font-mono text-label-caps uppercase tracking-wide text-on-surface-variant">
            {brandLabel}
          </p>
        )}
        <h3 className="mb-4 flex-grow font-display text-lg font-semibold text-on-surface">{product.name}</h3>
        <Link
          href={`/produits/${product.slug}`}
          className="inline-flex items-center gap-1 font-medium text-primary-container transition-colors hover:text-primary"
        >
          {t("seeProduct")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
