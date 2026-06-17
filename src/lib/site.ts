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
  address: "P1, Grombalia",
mapEmbedUrl:
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3203.019520578901!2d10.4959548!3d36.6018389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd5b000ad3db3d%3A0xa77ed5eb1f833345!2sOphtaHealth!5e0!3m2!1sen!2stn!4v1781732289724!5m2!1sen!2stn",
mapLink:
  "https://www.google.com/maps/place/OphtaHealth/@36.6020174,10.4962915,238m/data=!3m1!1e3!4m15!1m8!3m7!1s0x12fd5bbcb6ca7385:0x9a822a360889b221!2sP1,+Grombalia!3b1!8m2!3d36.6019038!4d10.4962632!16s%2Fg%2F11bw4ml4nk!3m5!1s0x12fd5b000ad3db3d:0xa77ed5eb1f833345!8m2!3d36.601936!4d10.4961521!16s%2Fg%2F11npt347c1?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
} as const;

/** Build a WhatsApp deep link with a pre-filled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

