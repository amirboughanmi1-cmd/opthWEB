import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieBanner } from "@/components/CookieBanner";
import { site } from "@/lib/site";
import { SITE_URL } from "@/lib/site-url";
import { getCatalog } from "@/lib/server-data";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name}`,
    template: `%s — ${site.name}`,
  },
  description:
    "OphtaHealth distribue des équipements médicaux ophtalmiques de haute précision : consultation, exploration et santé oculaire. 9 marques partenaires de renom.",
  keywords: [
    "ophtalmologie",
    "équipement médical",
    "OCT",
    "lampe à fente",
    "rétinographe",
    "tonomètre",
    "OphtaHealth",
  ],
  openGraph: {
    title: `${site.name} — Équipements Médicaux Ophtalmiques`,
    description: "Catalogue d'équipements ophtalmiques de haute précision.",
    type: "website",
    locale: "fr_FR",
    // public/ is empty — the logo lives on ImageKit (absolute URL required by OG anyway).
    images: ["https://ik.imagekit.io/rntjotcwu/brand/ophtahealth-logo.webp?tr=w-1200"],
  },
  verification: {
    // Bing Webmaster Tools site ownership (keep even after verification).
    other: { "msvalidate.01": "D74AFD7A9729B47F94FD98204632B716" },
    // Google Search Console site ownership (keep even after verification).
    google: "Z4mEZ6Y1HPv46DnT3jyhcBw-AxZsFkDkWPWVng6PxxU",
  },
  // Icons are file-based: src/app/icon.png + src/app/apple-icon.png.
};

/** ISR — the navbar taxonomy is read from Supabase; admin writes revalidate it. */
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { sections } = await getCatalog();
  return (
    <html lang="fr" className={`${hanken.variable} ${jetbrains.variable}`}>
      <head>
        {/* Speed up first image load from the ImageKit CDN (improves LCP). */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
      </head>
      <body className="bg-clinical-white font-sans text-body-md text-on-surface antialiased">
        <Navbar sections={sections} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CookieBanner />
      </body>
    </html>
  );
}
