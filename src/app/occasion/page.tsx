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
      subtitle="Vous recherchez un équipement ophtalmologique d'occasion ou souhaitez vendre le vôtre ? Profitez de notre plateforme spécialisée pour acheter et vendre en toute confiance. Contactez-nous dès aujourd'hui pour publier votre annonce ou trouver l'équipement qu'il vous faut."
      icon="tag"
    />
  );
}
