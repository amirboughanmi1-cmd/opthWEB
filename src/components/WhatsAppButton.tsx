import { whatsappLink, site } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

/** Floating WhatsApp CTA shown on every page. */
export function WhatsAppButton() {
  const message = `Bonjour ${site.name}, je souhaite obtenir des informations sur vos équipements.`;

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter OphtaHealth sur WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
