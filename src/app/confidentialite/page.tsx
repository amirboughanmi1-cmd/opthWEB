import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d'OphtaHealth : collecte, utilisation et protection des données personnelles conformément à la réglementation.",
};

const sections = [
  {
    title: "1. Introduction",
    body: [
      "Chez OphtaHealth, nous nous engageons à protéger la confidentialité et la sécurité de nos clients et utilisateurs. Cette politique décrit nos pratiques concernant la collecte, l'utilisation et la divulgation de vos informations lorsque vous utilisez nos équipements médicaux et plateformes numériques associées.",
    ],
  },
  {
    title: "2. Collecte des données",
    body: ["Nous collectons les informations que vous nous fournissez directement, notamment :"],
    list: [
      "Données professionnelles : coordonnées de la clinique, du praticien et de contact.",
      "Données de diagnostic : mesures de télémétrie et de performance anonymisées issues des appareils.",
      "Journaux d'utilisation : données d'interaction avec nos interfaces logicielles pour améliorer votre expérience.",
    ],
  },
  {
    title: "3. Utilisation des informations",
    body: ["Les informations collectées sont utilisées strictement aux fins suivantes :"],
    list: [
      "Maintenir, calibrer et améliorer nos dispositifs médicaux.",
      "Fournir un support technique et répondre aux demandes de service.",
      "Surveiller les performances du système et détecter les anomalies.",
      "Respecter les obligations réglementaires du secteur de la santé.",
    ],
  },
  {
    title: "4. Sécurité des données",
    body: ["Nous mettons en œuvre des mesures de sécurité de niveau professionnel pour protéger vos données :"],
    list: [
      "Chiffrement de bout en bout pour les données transmises entre les appareils et nos serveurs.",
      "Contrôles d'accès stricts et mécanismes d'authentification pour le personnel technique.",
      "Audits de sécurité réguliers et contrôles de conformité.",
    ],
  },
  {
    title: "5. Politique relative aux cookies",
    body: [
      "Nos plateformes numériques utilisent des cookies strictement nécessaires au fonctionnement du site ainsi que des cookies analytiques. Nous n'utilisons pas de cookies de publicité ciblée.",
      "Vous pouvez configurer votre navigateur pour refuser les cookies. Dans ce cas, certaines parties du service pourraient ne plus être disponibles.",
    ],
  },
];

export default function PrivacyPage() {
  const updated = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader eyebrow={`Dernière mise à jour : ${updated}`} title="Politique de confidentialité" />

      <div className="container-max max-w-3xl py-12">
        <div className="flex flex-col gap-6">
          {sections.map((s) => (
            <section key={s.title} className="rounded-lg border border-outline-variant bg-surface-gray p-6">
              <h2 className="mb-3 font-display text-headline-md text-primary-container">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mb-3 leading-relaxed text-on-surface-variant">{p}</p>
              ))}
              {s.list && (
                <ul className="ml-5 list-disc space-y-1.5 text-on-surface-variant">
                  {s.list.map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Pour toute question relative à cette politique, contactez{" "}
          <a href={`mailto:${site.email}`} className="text-primary-container hover:text-primary">{site.email}</a>.
        </p>
      </div>
    </>
  );
}
