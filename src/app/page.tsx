import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { BrandStrip } from "@/components/BrandStrip";
import { ProductCard } from "@/components/ProductCard";
import { getCatalog } from "@/lib/server-data";
import { isPartnerBrand } from "@/data/brands";
import { STANDALONE_SECTIONS } from "@/data/categories";
import { ArrowRight, SupportIcon } from "@/components/Icons";
import { t } from "@/i18n/ui";
import { site } from "@/lib/site";

/** ISR safety net — the admin dashboard revalidates on-demand after writes. */
export const revalidate = 3600;

export default async function HomePage() {
  const { products, brands, sections } = await getCatalog();
  const featured = products.filter((p) => p.featured);
  const hero = featured.length ? featured : products.slice(0, 3);
  const highlights = products.slice(0, 4);
  const catalogueCount = sections.filter((s) => !STANDALONE_SECTIONS.includes(s.slug)).length;
  const partnerCount = brands.filter(isPartnerBrand).length;

  return (
    <>
      <HeroCarousel products={hero} />

      <BrandStrip brands={brands} />

      {/* Featured products grid */}
      <section className="border-b border-outline-variant bg-surface-gray px-margin-edge py-16">
        <div className="mx-auto max-w-container-max">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="font-display text-headline-lg text-primary-container">Produits en vedette</h2>
            <Link href="/catalogue" className="inline-flex items-center gap-1 font-medium text-primary-container hover:text-primary">
              {t("seeAllCatalog")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* About / stats */}
      <section className="bg-clinical-white px-margin-edge py-16">
        <div className="mx-auto max-w-container-max">
          <div className="mb-12 grid grid-cols-2 gap-4 rounded-lg border border-outline-variant bg-surface-gray p-6 text-center md:grid-cols-4">
            <Stat value={`${partnerCount}+`} label="Marques Partenaires" />
            <Stat value={`${products.length}`} label="Produits" />
            <Stat value={`${catalogueCount}`} label="Catégories" />
            <div className="flex flex-col items-center">
              <SupportIcon className="mb-1 h-8 w-8 text-primary-container" />
              <span className="text-sm text-on-surface-variant">Support Technique</span>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-display text-headline-lg text-primary-container">{t("about")}</h2>
              <p className="mb-6 leading-relaxed text-on-surface-variant">
                OphtaHealth équipe les professionnels de la santé visuelle avec des technologies de
                pointe. Notre engagement : fournir des outils de diagnostic de haute fidélité et des
                instruments chirurgicaux garantissant précision, fiabilité et de meilleurs résultats
                pour les patients.
              </p>
              <Link href="/a-propos" className="btn-outline">
                {t("learnMore")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="h-[360px] overflow-hidden rounded-lg border border-outline-variant">
              <iframe
                title="Localisation OphtaHealth"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={site.mapEmbedUrl}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[32px] font-bold text-primary-container">{value}</span>
      <span className="text-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
