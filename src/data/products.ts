import type { SectionSlug } from "./categories";

export interface Product {
  slug: string;
  name: string;
  brand: string; // brand slug
  /** Display name resolved from the DB join — static products resolve via getBrand() instead. */
  brandName?: string;
  section: SectionSlug;
  subcategory: string; // subcategory slug
  image: string;
  /** Extra gallery images shown after the cover on the product page (ordered). */
  images?: string[];
  /** Specific photo to show in the home hero when featured (defaults to the cover). */
  heroImage?: string;
  featured?: boolean;
  /** Optional brochure file path under /public (e.g. /brochures/os1000.pdf). */
  brochure?: string;
  /** Short tagline shown in the hero carousel and used as the SEO meta description. */
  taglineFr: string;
  /** Full product description (client catalogue text). Rendered with line breaks. */
  descriptionFr: string;
}

/**
 * Offline fallback catalog (used only if Supabase is unreachable at build time).
 * The live site reads everything from Supabase. Descriptions are the client's
 * official catalogue copy; products are presented "sur commande" without specs.
 * Distribution: Consultation 23 / Exploration 12 / Chirurgie 3.
 */
export const products: Product[] = [
  // ───────────────────────── SECTION A — CONSULTATION (23) ─────────────────────────
  {
    slug: "pro500",
    name: "PRO 500",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "unite-de-consultation",
    image: "/catalog/pro500.jpeg",
    taglineFr: "Unité de consultation à deux instruments.",
    descriptionFr: `• Unité à deux instruments
• Élévation électrique de la chaise
• Disponible en version gauche ou droite
• Éclairage d’ambiance
• Panneau de commande intégré`,
  },
  {
    slug: "delta-qp",
    name: "DELTA QP",
    brand: "medinstrus",
    section: "consultation",
    subcategory: "unite-de-consultation",
    image: "/catalog/deltaqp.jpeg",
    taglineFr: "Table élévatrice pour deux instruments.",
    descriptionFr: `• Table élévatrice pour deux instruments
• Élévation électrique de la chaise
• Bras de réfracteur motorisé vertical
• Colonne avec support pour projecteur de tests
• Tiroir pour verres d’essai et tiroir supplémentaire
• Éclairage d’ambiance
• Panneau de commande intégré`,
  },
  {
    slug: "drone4",
    name: "DRONE4",
    brand: "medinstrus",
    section: "consultation",
    subcategory: "unite-de-consultation",
    image: "/catalog/drone4.jpeg",
    taglineFr: "Unité à rotation 4 instruments.",
    descriptionFr: `• Unité à rotation 4 instruments
• Bras de réfracteur à translation et inclinaison motorisées
• Élévation fauteuil + table électrique
• Lampe VP LED
• Tiroir pour verres d’essai et tiroir supplémentaire`,
  },
  {
    slug: "zulu-3",
    name: "ZULU-3",
    brand: "medinstrus",
    section: "consultation",
    subcategory: "unite-de-consultation",
    image: "/catalog/zulu3.jpeg",
    taglineFr: "Unité à 3 instruments, structure tout métal.",
    descriptionFr: `• Unité à 3 instruments
• Structure extrêmement robuste (fabrication entièrement en métal)
• Pilotage de l’unité avec commande intégré
• Fauteuil électrique + table électrique
• Lampe VP LED`,
  },
  {
    slug: "elite",
    name: "ELITE",
    brand: "medinstrus",
    section: "consultation",
    subcategory: "unite-de-consultation",
    image: "/catalog/elite.jpeg",
    taglineFr: "Unité de réfraction tout automatisée.",
    descriptionFr: `• Unité de réfraction tout automatisée
• Élévation de la chaise et plateau motorisé
• Un bras de réfracteur motorisé
• Translation du plateau électrique
• Fauteuil patient amovible pour accès en fauteuil roulant`,
  },
  {
    slug: "rsl-2600",
    name: "RSL 2600 / 2600 Digital",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "lampe-a-fente",
    image: "/catalog/rsl2600.jpeg",
    taglineFr: "Lampe à fente Galiléen, option numérique.",
    descriptionFr: `• Type : Galiléen parallèle
• Mode de grossissement : par barillet rotatif
• Grossissements : 6.25X, 10X, 16X, 25X, 40X
• Oculaire : 12.5X
• Largeur de fente : continue de 0 mm à 14 mm
• Champ : 6.25x(ø33) 10x(ø22) 16x(ø14) 25x(ø8.6) 40x(ø5.6)
• Plage de distance pupillaire : 45 – 82 mm
• Source LED`,
  },
  {
    slug: "rsl-4500",
    name: "RSL 4500 / 4500 Digital",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "lampe-a-fente",
    image: "/catalog/rsl-4500-digital.jpeg",
    taglineFr: "Lampe à fente LED haute résolution.",
    descriptionFr: `• Système optique à haute résolution
• Observation très claire des cellules endothéliales et des cytopathies telles que les troubles de la chambre antérieure
• Oculaire performant et confortable offrant 14 mm d’ouverture pour de plus larges applications
• Optique à transmission élevée permettant d’observer les lésions avec un éclairage réduit, au bénéfice du patient comme de l’opérateur
• Filtre IR et UV intégrés
• Éclairage par LED (fabrication Europe) à la couleur naturelle non bleutée, non éblouissante, pour une illumination puissante, homogène et détaillée, ainsi qu’une durée de vie jusqu’à 50 000 heures
• Mécanique entièrement en métal pour une parfaite stabilité et durabilité`,
  },
  {
    slug: "sl-1s",
    name: "SL-1S",
    brand: "main-meditech",
    section: "consultation",
    subcategory: "lampe-a-fente",
    image: "/catalog/sl-1s.jpeg",
    taglineFr: "Lampe à fente de table stéréoscopique.",
    descriptionFr: `Le système de lampe à fente Galiléen parallèle offre une vision stéréoscopique binoculaire précise avec un éclairage LED à lumière chaude pour protéger les tissus oculaires, un changeur de grossissement pratique et un réglage continu de la luminosité stable grâce au PWM, le tout évolutif vers une version d’enseignement ou numérique avec caméra.`,
  },
  {
    slug: "dslc200",
    name: "DSLC200",
    brand: "sbm-sistemi",
    section: "consultation",
    subcategory: "lampe-a-fente",
    image: "/catalog/dslc200.jpeg",
    taglineFr: "Module d’imagerie numérique pour lampe à fente.",
    descriptionFr: `Module d’imagerie numérique pour lampe à fente.

Le DSLC200 est un système d’imagerie qui transforme votre lampe à fente classique en une lampe à fente numérique de haute qualité, capable de capturer des images et vidéos détaillées. Grâce à son système optique avec distance de mise au point réglable, le DSLC200 s’adapte aux besoins spécifiques de l’examen et garantit une qualité d’image optimale. Ce module est compatible avec la plupart des lampes à fente disponibles sur le marché. Contrairement à de nombreuses caméras montées directement sur l’oculaire, le DSLC200 utilise un véritable diviseur optique, installé entre les oculaires et le système de grossissement de la lampe à fente.`,
  },
  {
    slug: "alino",
    name: "ALINO®",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "auto-refractometre",
    image: "/catalog/alino.jpeg",
    taglineFr: "Combinaison unique de 5+1 systèmes.",
    descriptionFr: `• Combinaison unique de 5+1 systèmes réunis dans un seul appareil
• Réfraction / Kérato, Tono / Pachy, topographie et observation du syndrome de l’œil sec
• Mode spécial Quick Ref pour patients peu coopérants
• Prise de mesure automatique ou manuelle
• Gain de place
• Installation sur unité de consultation ou au secrétariat
• Fonctions d’export disponibles pour tous les logiciels métiers
• Ensemble interconnecté`,
  },
  {
    slug: "rmk-700",
    name: "RMK-700",
    brand: "supore",
    section: "consultation",
    subcategory: "auto-refractometre",
    image: "/catalog/rmk-700.jpeg",
    taglineFr: "Auto-réfracto-kératomètre Hartmann.",
    descriptionFr: `• Design innovant
• Technologie Hartmann permettant la mesure précise des aberrations optiques de l’œil
• Mesures rapides et fiables
• Modes de mesure disponibles :
   – K&R : Réfraction + Kératométrie
   – CLBC : Mesure de la courbure des lentilles de contact
   – SIZE : Mesure du diamètre pupillaire
   – IOL : Calcul de lentilles intraoculaires
   – ILM : rétro-illumination`,
  },
  {
    slug: "easyref-pro",
    name: "easyRef PRO",
    brand: "moptim",
    section: "consultation",
    subcategory: "auto-refractometre",
    image: "/catalog/easyref-pro.jpeg",
    taglineFr: "Auto-réfracteur portable front d’ondes.",
    descriptionFr: `L’easyRef PRO est un auto-réfracteur portable front d’ondes innovant qui mesure avec précision les défauts de réfraction en 2 secondes. Idéal pour les prises de mesures à domicile.`,
  },
  {
    slug: "sw-800",
    name: "SW-800",
    brand: "suoer",
    section: "consultation",
    subcategory: "auto-refractometre",
    image: "/catalog/sw-800.jpeg",
    taglineFr: "Réfractomètre portable, mesure des 2 yeux.",
    descriptionFr: `Le réfractomètre automatique portable Suoer est très facile d’utilisation. Il est parfait pour les enfants de plus de 6 mois et pour les patients difficiles à examiner, et prend la mesure simultanée des 2 yeux en moins d’une seconde.`,
  },
  {
    slug: "phoromat-2000",
    name: "Phoromat 2000",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "refracteur-automatique",
    image: "/catalog/phoromat-200.jpeg",
    taglineFr: "Réfracteur automatique ergonomique.",
    descriptionFr: `Le réfracteur automatique Phoromat 2000 est un outil ergonomique aussi bien pour le patient que pour le praticien. Il peut s’adapter sur tous types d’unité de consultation, ou bien en « stand-alone » sur un bras de réfracteur classique, et garantit au patient un confort accru en diminuant de façon très significative le temps de l’examen de vue.`,
  },
  {
    slug: "vt-800",
    name: "VT-800",
    brand: "supore",
    section: "consultation",
    subcategory: "refracteur-automatique",
    image: "/catalog/vt-800.jpeg",
    taglineFr: "Réfracteur automatique à interface intuitive.",
    descriptionFr: `Effectuez un examen plus précis avec divers tests de vision allant des tests de base aux plus sophistiqués. Découvrez une interface graphique intuitive répondant aux exigences les plus élevées : une interface utilisateur simple et conviviale pour une utilisation efficace et intuitive.`,
  },
  {
    slug: "topascope",
    name: "TopaScope®",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "tonometre-air-rebound",
    image: "/catalog/topascope.jpeg",
    taglineFr: "Tonomètre sans contact avec pachymétrie.",
    descriptionFr: `Tonomètre sans contact avec pachymétrie entièrement automatisé, doté d’un écran tactile, d’un suivi automatique 3D et d’une imprimante avec coupeur automatique pour obtenir les résultats directement.`,
  },
  {
    slug: "nt-700",
    name: "NT-700",
    brand: "supore",
    section: "consultation",
    subcategory: "tonometre-air-rebound",
    image: "/catalog/nt-700.jpeg",
    taglineFr: "Tonomètre à air, interface claire et intuitive.",
    descriptionFr: `• Utilisation simple et pratique
• Gestion des informations des patients, permettant de consulter et de maintenir facilement l’historique des dossiers
• Interface utilisateur claire et intuitive, avec affichage des résultats simple et facile à interpréter`,
  },
  {
    slug: "al-6600",
    name: "AL 6600",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "frontofocometre",
    image: "/catalog/al-6600.jpeg",
    taglineFr: "Frontofocomètre Wavefront Shack-Hartmann.",
    descriptionFr: `• Technologie Wavefront avec capteur Shack-Hartmann (117 points)
• Mesure simultanée de la puissance, transmission aux UV et à la lumière bleue
• Support pour faciliter la recherche des marques sur les verres
• Cartographie de puissance
• Connexion Wifi, Lan et RS-232C`,
  },
  {
    slug: "vt-700a",
    name: "VT-700A",
    brand: "supore",
    section: "consultation",
    subcategory: "frontofocometre",
    image: "/catalog/vt-700a.jpeg",
    taglineFr: "Frontofocomètre numérique à écran tactile.",
    descriptionFr: `• Mesure la transmission de la lumière bleue
• Technologie « wavefront » et capteur Hartmann
• Précision accrue grâce au faisceau de lumière verte
• Détection automatique du verre
• Mesure UV
• Écran couleur 7"
• Détection des prismes simple`,
  },
  {
    slug: "cv-600",
    name: "CV 600",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "projecteur-ecran-test",
    image: "/catalog/cv-600.jpeg",
    taglineFr: "Écran de test connecté multifonction.",
    descriptionFr: `• Connexion Bluetooth ou WIFI
• Grande variété de tests de vision
• Tests rouge-vert et / ou polarisés
• Tableau de Snellen, ETDRS, interaction de contour
• Tests de basse vision
• Tests de vision des couleurs
• Séquences de tests programmables`,
  },
  {
    slug: "rodachart-422",
    name: "Rodachart 422",
    brand: "rodenstock",
    section: "consultation",
    subcategory: "projecteur-ecran-test",
    image: "/catalog/rodachart-422.jpeg",
    taglineFr: "Projecteur de tests LED sans maintenance.",
    descriptionFr: `• Projection lumineuse et nette
• Large gamme de tests
• Design affiné et encombrement réduit
• Ajustement pratique de la focalisation
• Éclairage LED sans maintenance`,
  },
  {
    slug: "acp-800",
    name: "ACP-800",
    brand: "supore",
    section: "consultation",
    subcategory: "projecteur-ecran-test",
    image: "/catalog/acp-800.jpeg",
    taglineFr: "Projecteur de tests à source LED.",
    descriptionFr: `Projecteur avec source lumineuse LED qui permet la réalisation d’examens d’acuité visuelle précis et homogènes.`,
  },
  {
    slug: "acp-1000",
    name: "ACP-1000",
    brand: "supore",
    section: "consultation",
    subcategory: "chaine-refraction-courte-distance",
    image: "/catalog/acp-1000.jpeg",
    taglineFr: "Chaîne de réfraction courte distance.",
    descriptionFr: `Système de réfraction subjective innovant et compact, permettant de réaliser un examen visuel complet, aussi bien de loin que de près. Il intègre un afficheur de tests visuels associé au réfracteur automatique, offrant une approche moderne et optimisée de l’examen de la vue.`,
  },

  // ───────────────────────── SECTION B — EXPLORATION (12) ─────────────────────────
  {
    slug: "fundusscope",
    name: "FundusScope",
    brand: "rodenstock",
    section: "exploration",
    subcategory: "retinographes",
    image: "/catalog/fundusscope.jpeg",
    taglineFr: "Rétinographe non mydriatique 45°.",
    descriptionFr: `Rétinographe non-mydriatique.
• Eye-Tracking
• Autofocus / Autoshot
• Champ 45° x 45°
• Capteur 12 MP
• Imagerie de segment antérieur
• Image du fond d’œil en 15 secondes
• Affichage multi-images`,
  },
  {
    slug: "reticam-3100",
    name: "RetiCam 3100",
    brand: "syseye",
    section: "exploration",
    subcategory: "retinographes",
    image: "/catalog/reticam-3100.jpeg",
    taglineFr: "Rétinographe grand champ 176°.",
    descriptionFr: `Rétinographe non mydriatique grand champ 176 degrés.

Il délivre une image haute qualité de 176 degrés en une seule acquisition. Conçu pour la simplicité, le RetiCam 3100 plus offre l’alignement, la mise au point et la capture automatiques, permettant une acquisition d’image efficace et nécessitant une formation minimale de l’utilisateur. Un champ de vision de 220 à 260 degrés est disponible grâce à la fonction de montage.`,
  },
  {
    slug: "cfc-x",
    name: "CFC-X",
    brand: "mocular-medical",
    section: "exploration",
    subcategory: "retinographes",
    image: "/catalog/cfc-x.jpeg",
    taglineFr: "Rétinographe portable non mydriatique.",
    descriptionFr: `• Non mydriatique
• Angle de prise de vue : 50°
• Format des images : JPEG / AVI
• Diamètre minimal de la pupille : 2,5 mm
• Mode de mise au point : manuel
• Alimentation : batterie rechargeable Nickel-Métal Hydrure 3,7 V – 2600 mAh
• Écran intégré : 3,5 pouces`,
  },
  {
    slug: "rb-800",
    name: "RB-800",
    brand: "visionstar",
    section: "exploration",
    subcategory: "tonometre-rebound",
    image: "/catalog/rb-800.jpeg",
    taglineFr: "Tonomètre à rebond, sans anesthésie.",
    descriptionFr: `Tonomètre à rebond.
• Convient à tous types de patients
• Mesures rapides
• Facile à utiliser
• Séquence de mesure automatisée
• Mesures précises et reproductibles
• Aucune goutte anesthésique, jet d’air ou étalonnage nécessaire`,
  },
  {
    slug: "rem-4000",
    name: "REM 4000",
    brand: "rodenstock",
    section: "exploration",
    subcategory: "microscope-speculaire",
    image: "/catalog/rem-4000.jpeg",
    taglineFr: "Microscope spéculaire endothélial automatisé.",
    descriptionFr: `Mesure sans contact, Eye-tracker 3D et analyse automatique de l’endothélium font du microscope spéculaire REM-4000 un outil professionnel et rapide. Le temps d’examen est de 4 secondes pour les deux yeux. Grâce à l’alignement automatique, il est désormais possible de répéter la mesure sur la même zone d’analyse en assurant la reproductibilité du comptage cellulaire.

• Autonome, rapide et ergonomique
• Alignement et mesure automatiques
• Pachymétrie sans contact
• Base de données et imprimante intégrées
• Analyse automatique (l-count / core method / dark area)`,
  },
  {
    slug: "mocean-4000",
    name: "Mocean 4000",
    brand: "moptim",
    section: "exploration",
    subcategory: "oct",
    image: "/catalog/mocean-4000.jpeg",
    taglineFr: "OCT haute vitesse avec eye-tracker SLO.",
    descriptionFr: `• Vitesse d’acquisition de 130 000 A-scans/s
• OCT-A en option
• Balayage de 12 mm de large pour le segment postérieur
• SLO en temps réel de haute qualité
• Eye-tracker (suivi de l’œil) basé sur l’imagerie rétinienne SLO
• Le mode DCI (Deep Choroidal Imaging) révèle plus de détails de la choroïde
• Analyse logicielle complète de la rétine, du glaucome et de la cornée`,
  },
  {
    slug: "peristat-2",
    name: "Peristat 2",
    brand: "rodenstock",
    section: "exploration",
    subcategory: "champ-visuel",
    image: "/catalog/peristat-2.jpeg",
    taglineFr: "Périmètre automatique compact.",
    descriptionFr: `Le périmètre automatique Peristat 2 est un analyseur de champ visuel compact et complet, simple à installer et à utiliser. Une conception brillante combinée à un logiciel propriétaire intuitif offre des options de test étendues pour optimiser la gestion de vos patients avec les nouveaux tests TIA.`,
  },
  {
    slug: "svf-7000",
    name: "SVF-7000",
    brand: "main-meditech",
    section: "exploration",
    subcategory: "champ-visuel",
    image: "/catalog/svf-7000.jpeg",
    taglineFr: "Champ visuel conforme aux normes Goldmann.",
    descriptionFr: `Le SVF-7000, entièrement conforme aux normes de Goldmann, mesure avec précision l’étendue dans laquelle un patient peut détecter une stimulation. Il évalue le champ visuel en utilisant différentes tailles et intensités, mises en relation avec la combinaison de blanc et de noir en arrière-plan, mesurant ainsi la sensibilité et l’étendue visuelle.`,
  },
  {
    slug: "colombo-iol-ii",
    name: "Colombo IOL II",
    brand: "moptim",
    section: "exploration",
    subcategory: "biometre-optique",
    image: "/catalog/colombo-iol-ii.jpeg",
    featured: true,
    taglineFr: "Biomètre optique pour calcul d’implant.",
    descriptionFr: `• Longueur d’onde 1050 ± 20 nm pour une excellente pénétration
• Mesures : AXL, CCT, K, ACD, WTW, RT, PD, LT et CT (optionnel)
• Imagerie HD simultanée des segments antérieur et postérieur de l’œil
• Alignement et capture automatiques`,
  },
  {
    slug: "retiwave-1000",
    name: "RetiWave 1000",
    brand: "syseye",
    section: "exploration",
    subcategory: "echographie-ab",
    image: "/catalog/retiwave-1000.jpeg",
    featured: true,
    taglineFr: "Échographe ophtalmique A/B de haute précision.",
    descriptionFr: `• Scan A : mesure de la profondeur de chambre antérieure, de l’épaisseur du cristallin et de la longueur axiale, et calcule la IOL
• Scan B : affiche le profil du globe oculaire, permettant un diagnostic précis de cataracte, traumatismes, décollements, maladies de la macula et tumeurs intraoculaires`,
  },
  {
    slug: "sw-21-delta",
    name: "SW-21 Delta",
    brand: "suoer",
    section: "exploration",
    subcategory: "echographie-ab",
    image: "/catalog/sw-21-delta.jpeg",
    taglineFr: "Imagerie ultrasonique A/B, UBM et pachymétrie.",
    descriptionFr: `Le système SW-21 Delta Scan se distingue comme une solution complète et performante en imagerie ultrasonique ophtalmologique. Grâce à l’intégration des modes A-Scan, B-Scan, UBM et pachymétrie, ainsi qu’à l’utilisation de formules avancées de calcul d’implants intraoculaires (IOL), il permet une évaluation précise et fiable des structures oculaires. Sa haute résolution, ses capacités de traitement d’images et son interface intuitive contribuent à améliorer la qualité du diagnostic et l’efficacité du travail clinique.`,
  },
  {
    slug: "os1000",
    name: "OS1000",
    brand: "sbm-sistemi",
    section: "exploration",
    subcategory: "topographe-corneen",
    image: "/catalog/os1000.jpeg",
    featured: true,
    taglineFr: "Topographe cornéen tout-en-un.",
    descriptionFr: `• Topographie cornéenne complète
• Dépistage du kératocône
• Simulation d’adaptation de lentilles de contact
• Évaluation de la sécheresse oculaire tout-en-un
• Rapports et suivis détaillés`,
  },

  // ───────────────────────── SECTION C — CHIRURGIE (3) ─────────────────────────
  {
    slug: "idra",
    name: "IDRA",
    brand: "sbm-sistemi",
    section: "sante-oculaire",
    subcategory: "plateforme-secheresse-oculaire",
    image: "/catalog/idra.jpeg",
    taglineFr: "Plateforme de diagnostic de l’œil sec.",
    descriptionFr: `IDRA : plateforme dédiée à l’œil sec.

L’IDRA de SBM Sistemi est un système de diagnostic avancé dédié à l’analyse complète du film lacrymal et de la surface oculaire, conçu pour aider les professionnels de la vision à évaluer avec précision les causes de la sécheresse oculaire.`,
  },
  {
    slug: "activa",
    name: "ACTIVA",
    brand: "sbm-sistemi",
    section: "sante-oculaire",
    subcategory: "soulagement-secheresse-oculaire",
    image: "/catalog/activa.jpeg",
    taglineFr: "Soulagement de la sécheresse oculaire.",
    descriptionFr: `L’Activa de SBM Sistemi est un nouveau modèle de prise en charge des patients souffrant de sécheresse oculaire. Cet appareil améliore le bien-être des yeux grâce à une technologie complète de chauffage et de massage automatique, rapide et indolore.`,
  },
  {
    slug: "pi-mabel",
    name: "PI Mabel",
    brand: "mabel",
    section: "sante-oculaire",
    subcategory: "table-operation-ophtalmique",
    image: "/catalog/pi-mabel.jpeg",
    taglineFr: "Table d’opération ophtalmique robuste.",
    descriptionFr: `La table d’opération ophtalmique PI se distingue par sa conception robuste, sa capacité de charge élevée et sa grande flexibilité d’ajustement. Grâce à ses dimensions optimisées et à ses réglages ergonomiques, elle assure un confort optimal pour le patient ainsi qu’une excellente accessibilité pour le praticien. Fiable et performante, elle constitue un équipement essentiel pour garantir des conditions de travail efficaces et sécurisées lors des interventions chirurgicales.`,
  },
];

export const productTagline = (p: Product) => p.taglineFr;
export const productDescription = (p: Product) => p.descriptionFr;
