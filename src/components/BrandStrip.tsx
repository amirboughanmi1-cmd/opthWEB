"use client";

import Image from "next/image";
import { isPartnerBrand, type Brand } from "@/data/brands";
import { t } from "@/i18n/ui";

/** Auto-scrolling partner logo marquee. Logos duplicated for a seamless loop. */
export function BrandStrip({ brands }: { brands: Brand[] }) {
  // Only official partners appear in the homepage strip.
  const withLogos = brands.filter((b) => b.logo && isPartnerBrand(b));
  const loop = [...withLogos, ...withLogos];

  return (
    <section className="w-full overflow-hidden border-b border-outline-variant bg-surface-gray py-12">
      <div className="container-max mb-8">
        <h2 className="section-title">{t("partnerBrands")}</h2>
      </div>
      <div className="relative flex w-full overflow-hidden">
        <div className="flex animate-scroll items-center gap-6 px-6 whitespace-nowrap">
          {loop.map((b, i) => (
            <div key={`${b.slug}-${i}`} className="brand-logo-card">
              {b.logo && (
                <Image src={b.logo} alt={b.name} width={150} height={80} className="object-contain" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
