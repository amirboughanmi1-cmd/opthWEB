/** Central site configuration — edit contact details and brand info here. */
export const site = {
  name: "OphtaHealth",
  tagline: "Clinical Excellence in Ophthalmology",
  taglineFr: "L'excellence clinique en ophtalmologie",
  // International format without "+" or spaces, used to build wa.me links.
  whatsappNumber: "21622255629",
  phonePrimary: "+216 22 255 629",
  phoneSecondary: "+216 99 255 688",
  email: "info@ophtahealth.com",
  address: "Tunis, Tunisie",
  developer: "Amiri Hamza",
  // Real commerce location (Google Maps).
  mapEmbedUrl: "https://maps.google.com/maps?q=36.6019145,10.4961051&z=16&hl=fr&output=embed",
  mapLink:
    "https://www.google.com/maps/place/OphtaHealth/@36.6019145,10.4961051,699m/data=!3m2!1e3!4b1!4m6!3m5!1s0x12fd5b000ad3db3d:0xa77ed5eb1f833345!8m2!3d36.6019145!4d10.4961051!16s%2Fg%2F11npt347c1",
} as const;

/** Build a WhatsApp deep link with a pre-filled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

