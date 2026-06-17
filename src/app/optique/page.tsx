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
      comingSoon="Notre offre Optique (montures, verres et accessoires) sera bientôt disponible sur cette page. En attendant, notre équipe reste à votre disposition pour toute demande."
      icon="eye"
    />
  );
}
