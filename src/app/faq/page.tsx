import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, type QA } from "@/components/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Foire aux questions OphtaHealth : calibration, support technique, livraison et maintenance des équipements ophtalmiques.",
};

const calibration: QA[] = [
  {
    q: "À quelle fréquence le système OCT doit-il être calibré ?",
    a: "Nous recommandons une calibration annuelle par un technicien agréé, ou selon les préconisations du fabricant indiquées dans la documentation de l'appareil.",
  },
  {
    q: "Quelle est la tolérance acceptable pour l'alignement laser ?",
    a: "La tolérance dépend du modèle. Nos ingénieurs vérifient l'alignement lors de chaque intervention de maintenance préventive.",
  },
];

const support: QA[] = [
  {
    q: "Comment exporter les fichiers DICOM pour une analyse externe ?",
    a: "La plupart de nos appareils permettent l'export DICOM via le menu d'exportation. Notre équipe peut vous accompagner dans la configuration.",
  },
  {
    q: "Fournissez-vous un support technique à distance ?",
    a: "Oui. Nos ingénieurs cliniques proposent un support à distance ainsi qu'une assistance sur site pour les interventions plus complexes.",
  },
];

const logistics: QA[] = [
  {
    q: "Quels sont vos délais de livraison et d'installation ?",
    a: "Les délais varient selon la disponibilité du produit. Tous nos équipements sont proposés sur commande.",
  },
  {
    q: "Proposez-vous des contrats de maintenance ?",
    a: "Oui, nous proposons des contrats de service incluant maintenance préventive, pièces de rechange et interventions prioritaires.",
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support & documentation"
        title="Foire aux Questions"
        subtitle="Documentation technique et réponses aux questions fréquentes sur nos systèmes de diagnostic et d'imagerie."
      />

      <div className="container-max flex flex-col gap-12 py-12">
        <Group title="Calibration des équipements" items={calibration} />
        <Group title="Support technique" items={support} />
        <Group title="Livraison & maintenance" items={logistics} />
      </div>

      <section className="border-t border-outline-variant bg-surface-gray px-margin-edge py-16 text-center">
        <h2 className="mb-3 font-display text-headline-lg text-primary-container">
          Vous ne trouvez pas votre réponse ?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-on-surface-variant">
          Nos ingénieurs de support clinique sont disponibles pour vous assister.
        </p>
        <Link href="/support" className="btn-solid">
          Contacter le support
        </Link>
      </section>
    </>
  );
}

function Group({ title, items }: { title: string; items: QA[] }) {
  return (
    <section>
      <h2 className="mb-5 font-display text-headline-md text-primary-container">{title}</h2>
      <Accordion items={items} />
    </section>
  );
}
