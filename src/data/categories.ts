export type SectionSlug = "consultation" | "exploration" | "sante-oculaire" | "accessoire" | "optique" | "occasion";

export interface SubCategory {
  slug: string;
  name: string;
}

export interface Section {
  slug: SectionSlug;
  /** "Section A / B / C" label from the cahier des charges. */
  label: string;
  name: string;
  description: string;
  subcategories: SubCategory[];
}

/**
 * Offline fallback taxonomy (the live site reads this from Supabase).
 * Ophtalmologie holds 4 sections (Consultation, Exploration, Chirurgie,
 * Accessoire); Optique and Occasion are standalone families.
 */
export const sections: Section[] = [
  {
    slug: "consultation",
    label: "Section A",
    name: "Consultation",
    description:
      "Unités de consultation, lampes à fente, réfractomètres, tonomètres et tout l'équipement pour votre cabinet ophtalmologique.",
    subcategories: [
      { slug: "unite-de-consultation", name: "Unité de consultation" },
      { slug: "lampe-a-fente", name: "Lampe à fente" },
      { slug: "auto-refractometre", name: "Auto-Réfractomètre" },
      { slug: "refracteur-automatique", name: "Réfracteur Automatique" },
      { slug: "tonometre-air-rebound", name: "Tonomètre à air" },
      { slug: "frontofocometre", name: "Frontofocomètre" },
      { slug: "projecteur-ecran-test", name: "Projecteur et Écran de test" },
      { slug: "chaine-refraction-courte-distance", name: "Chaîne de réfraction courte distance" },
      { slug: "tonometre-rebound", name: "Tonomètre à Rebound" },
    ],
  },
  {
    slug: "exploration",
    label: "Section B",
    name: "Exploration",
    description:
      "Rétinographes, OCT, biomètres, topographes cornéens, microscopes spéculaires et échographie.",
    subcategories: [
      { slug: "retinographes", name: "Rétinographes" },
      { slug: "microscope-speculaire", name: "Microscope spéculaire" },
      { slug: "champ-visuel", name: "Champ visuel" },
      { slug: "oct", name: "OCT" },
      { slug: "biometre-optique", name: "Biomètre optique" },
      { slug: "echographie-ab", name: "Échographie AB" },
      { slug: "topographe-corneen", name: "Topographe cornéen" },
      { slug: "plateforme-secheresse-oculaire", name: "Diagnostique de la sécheresse oculaire" },
      { slug: "soulagement-secheresse-oculaire", name: "Traitement de la sécheresse oculaire" },
    ],
  },
  {
    slug: "sante-oculaire",
    label: "Section C",
    name: "Chirurgie",
    description:
      "Tables d'opération et équipements destinés à la chirurgie ophtalmique.",
    subcategories: [
      { slug: "table-operation-ophtalmique", name: "Table d'opération ophtalmique" },
    ],
  },
  {
    slug: "accessoire",
    label: "Section D",
    name: "Accessoire",
    description: "",
    subcategories: [],
  },
  {
    slug: "optique",
    label: "Optique",
    name: "Optique",
    description:
      "Montures, verres et accessoires optiques. Sélection gérée par l'équipe OphtaHealth.",
    subcategories: [],
  },
  {
    slug: "occasion",
    label: "Occasion",
    name: "Occasion",
    description:
      "Équipements d'occasion reconditionnés et matériel de seconde main, contrôlés par nos soins.",
    subcategories: [],
  },
];

/** Sections that live on their own dedicated nav pages, not in the main Ophtalmologie catalogue. */
export const STANDALONE_SECTIONS: SectionSlug[] = ["optique", "occasion"];

/** The ophthalmology sections shown in the /catalogue filters (Consultation, Exploration, Chirurgie, Accessoire). */
export const catalogueSections = sections.filter((s) => !STANDALONE_SECTIONS.includes(s.slug));

export const getSection = (slug: string) => sections.find((s) => s.slug === slug);

export const sectionName = (s: Section) => s.name;
