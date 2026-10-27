/** schema.org JSON-LD — invisible to visitors, tells search engines that
 *  OphtaHealth is a Tunisian business serving Tunisia (local SEO). */

import { site } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";

const LOGO_URL = "https://ik.imagekit.io/rntjotcwu/brand/ophtahealth-logo.webp?tr=w-512";

export const businessJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: site.name,
      description:
        "Distributeur d'équipements médicaux ophtalmiques en Tunisie : consultation, exploration et santé oculaire.",
      url: SITE_URL,
      logo: LOGO_URL,
      image: LOGO_URL,
      email: site.email,
      telephone: site.phonePrimary,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: site.phonePrimary,
          contactType: "sales",
          areaServed: "TN",
          availableLanguage: ["French", "Arabic", "English"],
        },
        {
          "@type": "ContactPoint",
          telephone: site.phoneSecondary,
          contactType: "customer support",
          areaServed: "TN",
          availableLanguage: ["French", "Arabic", "English"],
        },
      ],
      // Same point as the Google Maps embed in site.ts.
      address: {
        "@type": "PostalAddress",
        addressLocality: "Tunis",
        addressCountry: "TN",
      },
      geo: { "@type": "GeoCoordinates", latitude: 36.82144, longitude: 10.18985 },
      hasMap: site.mapLink,
      areaServed: { "@type": "Country", name: "Tunisie" },
      knowsLanguage: ["fr", "ar", "en"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: site.name,
      inLanguage: "fr-TN",
      publisher: { "@id": `${SITE_URL}/#business` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/recherche?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};
