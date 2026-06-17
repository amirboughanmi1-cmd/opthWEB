export interface Brand {
  slug: string;
  name: string;
  /** Logo path under /public, or null when no logo asset is available yet. */
  logo: string | null;
  /**
   * Official OphtaHealth partner. Only partners appear in the homepage
   * brand strip and the brand filter/search. Non-partners (e.g. a manufacturer
   * we merely resell from) keep their products but stay out of those lists.
   * Treat `undefined` as a partner (back-compat for the static fallback).
   */
  isPartner?: boolean;
}

/** A brand counts as a partner unless it is explicitly flagged otherwise. */
export const isPartnerBrand = (b: Brand) => b.isPartner !== false;

/**
 * Partner brands distributed by OphtaHealth — all 11 have logo assets.
 * (Huvitz lives only in the DB and is flagged as a non-partner.)
 */
export const brands: Brand[] = [
  { slug: "rodenstock", name: "Rodenstock", logo: "/sponsors/rodenstock.png" },
  { slug: "medinstrus", name: "Medinstrus", logo: "/sponsors/medinstrus.png" },
  { slug: "main-meditech", name: "Main Meditech", logo: "/sponsors/main-meditech.png" },
  { slug: "sbm-sistemi", name: "SBM Sistemi", logo: "/sponsors/sbm-sistemi.png" },
  { slug: "supore", name: "Supore", logo: "/sponsors/supore.jpg" },
  { slug: "moptim", name: "Moptim", logo: "/sponsors/moptim.png" },
  { slug: "suoer", name: "Suoer", logo: "/sponsors/suoer.png" },
  { slug: "syseye", name: "Syseye", logo: "/sponsors/syseye.png" },
  { slug: "mocular-medical", name: "Mocular Medical", logo: "/sponsors/mocular-medical.jpg" },
  { slug: "visionstar", name: "Visionstar", logo: "/sponsors/visionstar.png" },
  { slug: "mabel", name: "Mabel", logo: "/sponsors/mabel.png" },
];

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
