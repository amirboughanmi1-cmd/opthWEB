import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/server-data";
import { isPartnerBrand } from "@/data/brands";
import { CheckIcon } from "@/components/Icons";
import { t } from "@/i18n/ui";

export const metadata: Metadata = {
  title: "À Propos",
  description:
    "OphtaHealth, distributeur d'équipements médicaux ophtalmiques. Notre mission, nos valeurs et nos marques partenaires de renom.",
};

const values = [
  {
    title: "Précision clinique",
    text: "Des instruments de diagnostic de haute fidélité pour des résultats fiables et reproductibles.",
  },
  {
    title: "Marques de confiance",
    text: "Nous représentons des fabricants de renommée mondiale, sélectionnés pour leur qualité.",
  },
  {
    title: "Support technique",
    text: "Une équipe d'ingénieurs dédiée à l'installation, la maintenance et la formation.",
  },
];

/** ISR safety net — the admin dashboard revalidates on-demand after writes. */
export const revalidate = 3600;

export default async function AboutPage() {
  const { brands, products, sections } = await getCatalog();
  const partnerBrands = brands.filter(isPartnerBrand);
  return (
    <>
      <PageHeader
        eyebrow="Qui sommes-nous"
        title="À Propos d'OphtaHealth"
        subtitle="Spécialiste de la distribution d'équipements médicaux ophtalmiques et optique pour les professionnels de la santé visuelle."
      />

      {/* Mission */}
      <section className="container-max grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2">
        <div>
          <h2 className="mb-6 font-display text-headline-lg text-primary-container">Notre Mission</h2>
          <p className="mb-4 leading-relaxed text-on-surface-variant">
            OphtaHealth est une société spécialisée dans la distribution d'équipements médicaux
            ophtalmiques. Nous représentons plusieurs marques partenaires de renom et proposons un
            catalogue structuré d'appareils destinés aux professionnels de la santé visuelle.
          </p>
          <p className="leading-relaxed text-on-surface-variant">
            Notre engagement : faire le lien entre l'ingénierie technologique de pointe et la
            pratique clinique quotidienne, afin de garantir précision, fiabilité et de meilleurs
            résultats pour les patients.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat value={`${partnerBrands.length}+`} label="Marques" />
          <Stat value={`${products.length}`} label="Produits" />
          <Stat value={`${sections.length}`} label="Sections" />
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-outline-variant bg-surface-gray px-margin-edge py-16">
        <div className="mx-auto max-w-container-max">
          <h2 className="section-title mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border border-outline-variant bg-clinical-white p-6">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary-container/10 text-primary-container">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold text-on-surface">{v.title}</h3>
                <p className="text-on-surface-variant">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="container-max py-16">
        <h2 className="section-title mb-12">{t("partnerBrands")}</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {partnerBrands.map((b) => (
            <div key={b.slug} className="flex h-28 items-center justify-center rounded-lg border border-outline-variant bg-clinical-white p-4">
              {b.logo ? (
                <Image src={b.logo} alt={b.name} width={150} height={70} className="max-h-full w-auto object-contain" />
              ) : (
                <span className="font-mono text-label-caps uppercase text-primary-container">{b.name}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-outline-variant bg-surface-gray px-margin-edge py-16 text-center">
        <h2 className="mb-4 font-display text-headline-lg text-primary-container">
          Vous avez un projet d'équipement ?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-on-surface-variant">
          Notre équipe est à votre disposition pour vous conseiller et vous accompagner.
        </p>
        <Link href="/support" className="btn-solid">{t("contactUs")}</Link>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface-gray py-8">
      <span className="font-display text-display-md font-bold text-primary-container">{value}</span>
      <span className="text-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
