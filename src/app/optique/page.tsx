import type { Metadata } from "next";
import { SectionProductsView } from "@/components/SectionProductsView";
import { t } from "@/i18n/ui";

export const metadata: Metadata = {
  title: "Optique",
  description: "Montures, verres et accessoires optiques proposés par OphtaHealth.",
};

export default function OptiquePage() {
  return (
    <SectionProductsView
      section="optique"
      title={t("optique")}
      subtitle="Découvrez notre sélection d'équipements et d'accessoires d'optique conçus pour répondre aux besoins des professionnels de la vision. Nous proposons des solutions fiables, performantes et innovantes pour les magasins d'optique."
      icon="eye"
    />
  );
}
