"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DownloadIcon, WhatsAppIcon } from "./Icons";

// Lazy: the modal needs the Supabase store (lead insert) — only download it
// once the visitor actually clicks "Télécharger la brochure".
const BrochureModal = dynamic(() => import("./BrochureModal").then((m) => m.BrochureModal), {
  ssr: false,
});
import { whatsappLink, site } from "@/lib/site";
import { t } from "@/i18n/ui";

export function ProductActions({
  productName,
  productSlug,
  brandName,
  brochure,
}: {
  productName: string;
  productSlug: string;
  brandName: string;
  brochure?: string;
}) {
  const [open, setOpen] = useState(false);

  const message = `Bonjour ${site.name}, je souhaite commander le produit "${productName}" (marque ${brandName}). Merci de me recontacter.`;
  const waHref = whatsappLink(message);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={() => setOpen(true)} className="btn-outline flex-1">
          <DownloadIcon className="h-5 w-5" />
          {t("downloadBrochure")}
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded bg-whatsapp-dark px-6 py-2.5 font-medium text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp-dark focus-visible:ring-offset-2"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("orderWhatsApp")}
        </a>
      </div>
      {open && (
        <BrochureModal
          productName={productName}
          productSlug={productSlug}
          brochure={brochure}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
