import type { Metadata } from "next";
import { getCatalog } from "@/lib/server-data";
import { SavView } from "@/components/SavView";

export const metadata: Metadata = {
  title: "SAV — Service Après-Vente",
  description:
    "Service Après-Vente OphtaHealth : signalez une réclamation, une panne ou une demande de réparation sur votre équipement. Notre équipe technique vous recontacte.",
};

/** ISR — the product list feeding the form's autocomplete comes from Supabase. */
export const revalidate = 3600;

export default async function SavPage() {
  const { products } = await getCatalog();
  const productNames = products.map((p) => p.name).sort((a, b) => a.localeCompare(b, "fr"));
  return <SavView products={productNames} />;
}
