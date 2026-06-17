"use client";

import Link from "next/link";
import { useAdminData } from "@/lib/store";
import { getSection } from "@/data/categories";
import { ProductCard } from "./ProductCard";
import { PageHeader } from "./PageHeader";
import { ArrowRight, EyeIcon, TagIcon } from "./Icons";
import { t } from "@/i18n/ui";

const icons = { eye: EyeIcon, tag: TagIcon } as const;

interface Props {
  /** Section slug ("optique" | "occasion"). */
  section: string;
  title: string;
  /** Optional sub-title under the page heading. */
  subtitle?: string;
  /** Coming-soon copy when no product has been added yet. */
  comingSoon: string;
  /** Icon shown in the empty / coming-soon state. */
  icon: keyof typeof icons;
}

export function SectionProductsView({ section, title, subtitle, comingSoon, icon }: Props) {
  const Icon = icons[icon];
  const data = useAdminData();
  const meta = getSection(section);
  const items = data.products.filter((p) => p.section === section);

  return (
    <>
      <PageHeader eyebrow={meta?.label ?? title} title={title} subtitle={subtitle} />

      {!data.ready ? (
        <div className="container-max py-24 text-center text-on-surface-variant">Chargement…</div>
      ) : items.length === 0 ? (
        <section className="container-max flex flex-col items-center py-24 text-center">
          <span className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary-container/10 text-primary-container">
            <Icon className="h-10 w-10" />
          </span>
          <h2 className="mb-4 font-display text-headline-lg text-primary-container">
            Page en cours d&apos;implémentation
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-on-surface-variant">{comingSoon}</p>
          <Link href="/support" className="btn-solid">
            {t("contactUs")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      ) : (
        <div className="container-max py-12">
          <p className="mb-6 font-mono text-label-caps uppercase text-on-surface-variant">
            {items.length} produit{items.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
