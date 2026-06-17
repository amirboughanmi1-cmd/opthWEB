import { Suspense } from "react";
import type { Metadata } from "next";
import { RechercheClient } from "@/components/RechercheClient";

export const metadata: Metadata = {
  title: "Recherche",
  description:
    "Recherchez dans tout le site OphtaHealth : produits, catégories, marques, articles de blog et pages d'information.",
};

export default function RecherchePage() {
  return (
    <Suspense fallback={<div className="container-max py-12 text-on-surface-variant">…</div>}>
      <RechercheClient />
    </Suspense>
  );
}
