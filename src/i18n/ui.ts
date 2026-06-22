/** Shared UI strings. Site is French-only. */
const fr = {
  // Nav
  home: "Accueil",
  categories: "Ophtalmologie",
  optique: "Optique",
  occasion: "Occasion",
  sav: "SAV",
  about: "À Propos",
  contact: "Contact",
  search: "Rechercher...",
  madeToOrder: "Sur commande",
  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  // Common buttons / labels
  seeProduct: "Voir le produit",
  seeAllCatalog: "Voir tout le catalogue",
  learnMore: "En savoir plus",
  knowMore: "Savoir plus",
  contactUs: "Nous contacter",
  brand: "Marque",
  featuredProduct: "Produit phare",
  // Footer
  privacyPolicy: "Politique de confidentialité",
  faq: "FAQ",
  support: "Support",
  rightsReserved: "Tous droits réservés.",
  developedBy: "Développé par",
  // Brochure modal
  downloadBrochure: "Télécharger la brochure",
  downloadStarted: "Téléchargement lancé",
  brochureIntro: "Renseignez vos coordonnées pour télécharger la brochure technique de",
  fullName: "Nom complet",
  email: "E-mail",
  phone: "Téléphone",
  organization: "Établissement",
  brochureSuccess: "Merci ! Le téléchargement de la brochure a démarré automatiquement.",
  clickHere: "cliquez ici",
  ifNothing: "Si rien ne se passe,",
  close: "Fermer",
  orderWhatsApp: "Commander via WhatsApp",
  // Cookie banner
  cookieText:
    "Nous utilisons des cookies strictement nécessaires au fonctionnement du site ainsi que des cookies analytiques pour améliorer votre expérience.",
  essentialOnly: "Nécessaires uniquement",
  acceptAll: "Tout accepter",
  // Misc
  partnerBrands: "Nos Marques Partenaires",
} as const;

export type UIKey = keyof typeof fr;

/** Returns the French string for a key. */
export function t(key: UIKey): string {
  return fr[key];
}
