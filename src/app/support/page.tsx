import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, type QA } from "@/components/Accordion";
import { MapEmbed } from "@/components/MapEmbed";
import { site, whatsappLink } from "@/lib/site";
import { PhoneIcon, MailIcon, LocationIcon, WhatsAppIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Contactez l'équipe OphtaHealth pour toute demande d'information, devis ou support technique sur nos équipements ophtalmiques.",
};

const faq: QA[] = [
  {
    q: "Comment planifier une maintenance de routine ?",
    a: "Contactez-nous par téléphone, e-mail ou WhatsApp en indiquant le modèle de votre appareil. Notre équipe planifiera l'intervention.",
  },
  {
    q: "Quelle est votre politique pour les pièces de rechange ?",
    a: "Nous fournissons des pièces d'origine pour l'ensemble des marques que nous distribuons, sous réserve de disponibilité.",
  },
  {
    q: "Proposez-vous un support technique à distance ?",
    a: "Oui, nos ingénieurs cliniques assurent un support à distance et sur site selon la nature de la demande.",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nous sommes là pour vous aider"
        title="Contact & Support"
        subtitle="Notre équipe est à votre disposition pour la maintenance de vos équipements, les demandes techniques et toute information générale."
      />

      {/* Contact cards */}
      <section className="container-max grid grid-cols-1 gap-gutter py-12 md:grid-cols-3">
        <ContactCard icon={<PhoneIcon className="h-7 w-7" />} title="Téléphone" subtitle="Du lundi au vendredi, 9h00 – 18h00 (GMT+1)">
          <a href={`tel:${site.phonePrimary}`} className="block text-primary-container hover:text-primary">{site.phonePrimary}</a>
          <a href={`tel:${site.phoneSecondary}`} className="block text-primary-container hover:text-primary">{site.phoneSecondary}</a>
        </ContactCard>

        <ContactCard icon={<MailIcon className="h-7 w-7" />} title="E-mail" subtitle="Pour toute demande détaillée ou non urgente.">
          <a href={`mailto:${site.email}`} className="block text-primary-container hover:text-primary">{site.email}</a>
        </ContactCard>

        <ContactCard icon={<WhatsAppIcon className="h-7 w-7" />} title="WhatsApp" subtitle="Réponse rapide pour vos demandes commerciales.">
          <a
            href={whatsappLink(`Bonjour ${site.name}, j'ai une question.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-whatsapp-dark px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Démarrer une discussion
          </a>
        </ContactCard>
      </section>

      {/* FAQ + Location */}
      <section className="border-t border-outline-variant bg-surface-gray px-margin-edge py-16">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-headline-md text-primary-container">Questions fréquentes</h2>
            <Accordion items={faq} />
          </div>
          <div>
            <h2 className="mb-6 font-display text-headline-md text-primary-container">Nous rendre visite</h2>
            <p className="mb-4 flex items-center gap-2 text-on-surface-variant">
              <LocationIcon className="h-5 w-5 text-primary-container" />
              {site.address}
            </p>
            <div className="h-[320px] overflow-hidden rounded-lg border border-outline-variant">
              <MapEmbed />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-outline-variant bg-clinical-white p-8 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary-container/10 text-primary-container">{icon}</span>
      {/* h2: these cards follow the page h1 directly — an h3 would skip a level (a11y heading-order) */}
      <h2 className="mb-2 font-display text-lg font-semibold text-on-surface">{title}</h2>
      <p className="mb-4 text-sm text-on-surface-variant">{subtitle}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
