import type { Metadata } from "next";
import { SectionProductsView } from "@/components/SectionProductsView";
import { t } from "@/i18n/ui";

export const metadata: Metadata = {
  title: "Occasion",
  description: "Équipements d'occasion reconditionnés et matériel de seconde main d'OphtaHealth.",
};

export default function OccasionPage() {
  return (
    <SectionProductsView
      section="occasion"
      title={t("occasion")}
      subtitle="Découvrez notre sélection d'équipements et d'accessoires d'optique conçus pour répondre aux besoins des professionnels de la vision. Nous proposons des solutions fiables, performantes et innovantes pour les magasins d'optique."
      icon="tag"
    />
  );
}
