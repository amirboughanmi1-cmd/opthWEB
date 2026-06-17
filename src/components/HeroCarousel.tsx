"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Product, productTagline } from "@/data/products";
import { ProductImage } from "./ProductImage";
import { ArrowRight } from "./Icons";
import { t } from "@/i18n/ui";

export function HeroCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  // Hidden slides are opacity-0 but in-viewport, so their images would all
  // download at page load and compete with the LCP image. Only the slides
  // already shown get a real <img>.
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    setVisited((v) => (v.has(index) ? v : new Set(v).add(index)));
  }, [index]);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % products.length), 5000);
    return () => clearInterval(id);
  }, [products.length]);

  return (
    <header className="relative w-full overflow-hidden border-b border-outline-variant bg-clinical-white">
      {/* Grid stack: all slides share one cell, so the hero grows to fit its content
          (no clipping/overlap on mobile) while the fade transition still works. */}
      <div className="grid">
        {products.map((p, i) => (
          <div
            key={p.slug}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="container-max flex flex-col items-center gap-6 pt-10 pb-20 md:min-h-[70vh] md:flex-row md:gap-8 md:py-12">
              {/* Image — always LEFT (fixed-height box reserves space → no layout shift) */}
              <div className="flex w-full items-center justify-center md:w-1/2">
                <div className="relative h-[32vh] w-full sm:h-[40vh] md:h-[52vh]">
                  {visited.has(i) && (
                    <ProductImage
                      src={p.heroImage || p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 80vw, 45vw"
                      priority={i === 0}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Text + button — always RIGHT */}
              <div className="flex w-full flex-col items-center text-center md:w-1/2 md:items-start md:pl-12 md:text-left">
                <p className="mb-3 font-mono text-label-caps uppercase tracking-widest text-on-surface-variant">
                  {t("featuredProduct")}
                </p>
                <h1 className="mb-4 font-display text-[36px] font-bold leading-tight text-primary-container sm:text-[44px] md:mb-6 md:text-display-lg">
                  {p.name}
                </h1>
                <p className="mb-6 max-w-md text-on-surface-variant md:mb-8">{productTagline(p)}</p>
                <Link href={`/produits/${p.slug}`} className="btn-outline text-lg">
                  {t("knowMore")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {products.map((p, i) => (
          <button
            key={p.slug}
            onClick={() => setIndex(i)}
            aria-label={`Voir ${p.name}`}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={`block h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary-container" : "w-2.5 bg-outline-variant"
              }`}
            />
          </button>
        ))}
      </div>
    </header>
  );
}
