import type { Metadata } from "next";
import { SectionProductsView } from "@/components/SectionProductsView";
import { t } from "@/i18n/ui";

export const metadata: Metadata = {
  title: "Occasion",
    description: "Equipements d'occasion reconditionnes et materiel de seconde main d'OphtaHealth.",
};

export default function OccasionPage() {
  return (
    <SectionProductsView
      section="occasion"
      title={t("occasion")}
      comingSoonTitle={t("occasion")}
      comingSoon="Vous recherchez un equipement ophtalmologique d'occasion ou souhaitez vendre le votre ? Profitez de notre plateforme specialisee pour acheter et vendre en toute confiance. Contactez-nous des aujourd'hui pour publier votre annonce ou trouver l'equipement qu'il vous faut."
      icon="tag"
    />
  );
}
