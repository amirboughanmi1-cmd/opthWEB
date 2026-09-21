/** Central site configuration — edit contact details and brand info here. */

export const site = {
  name: "OphtaHealth",
  tagline: "Clinical Excellence in Ophthalmology",
  taglineFr: "Précision, innovation et confiance",
  // International format, digits only (no "+" or spaces) — used for wa.me links.
  whatsappNumber: "21699255688",
  phonePrimary: "+216 22 255 629",
  phoneSecondary: "+216 99 255 688",
  email: "info@ophtahealth.com",
  developer: "Hamza Amiri",
  // Real commerce location (Google Maps).
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1491.1017087641292!2d10.18984547564844!3d36.82144170178351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzbCsDQ5JzE3LjEiTiAxMMKwMTEnMjYuOCJF!5e0!3m2!1sen!2stn!4v1790020574600!5m2!1sen!2stn",
  mapLink:
    "https://maps.app.goo.gl/dsLs3xVakYfWML4y9",
} as const;

/** Build a WhatsApp deep link with a pre-filled message.
 *  wa.me only accepts digits — strip any "+", spaces or dashes so a number
 *  entered with formatting can never produce a broken (404) link. */
export function whatsappLink(message: string): string {
  const number = site.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

