-- ════════════════════════════════════════════════════════════════════════
-- seed-blog.sql — run in the Supabase SQL editor (AFTER schema + RLS).
-- 1) Adds the `category` column the blog UI displays as a badge.
-- 2) Imports the 6 demo articles currently hard-coded in the frontend.
-- Re-runnable: existing slugs are skipped (on conflict do nothing).
-- ════════════════════════════════════════════════════════════════════════

alter table articles add column if not exists category text;

insert into articles (slug, title, description, category, image_url, published, created_at)
values
  (
    'evolution-chirurgie-laser-2024',
    $$L'évolution de la chirurgie au laser en 2024$$,
    $$Une analyse approfondie des nouveaux systèmes de suivi oculaire intégrés aux lasers femtosecondes de dernière génération.$$,
    'Technologie',
    '/catalog/os1000.jpeg',
    true,
    '2024-09-18'
  ),
  (
    'optimisation-flux-travail-clinique',
    'Optimisation du flux de travail en clinique',
    $$Stratégies pour réduire les temps d'attente tout en maintenant une qualité de diagnostic exceptionnelle lors des consultations de routine.$$,
    'Conseils Cliniques',
    '/catalog/elite.jpeg',
    true,
    '2024-08-05'
  ),
  (
    'resume-congres-europeen-ophtalmologie',
    $$Résumé : Congrès Européen d'Ophtalmologie$$,
    $$Les points clés et annonces majeures concernant l'imagerie rétinienne présentés lors du sommet de cette année à Paris.$$,
    'Événements',
    '/catalog/retiwave-1000.jpeg',
    true,
    '2024-07-22'
  ),
  (
    'ia-detection-precoce-glaucome',
    'IA et détection précoce du glaucome',
    $$Comment les nouveaux algorithmes d'apprentissage automatique améliorent la précision du dépistage à partir des données OCT.$$,
    'Innovation',
    '/catalog/mocean-4000.jpeg',
    true,
    '2024-06-30'
  ),
  (
    'entretien-lampe-a-fente-bonnes-pratiques',
    'Entretien de la lampe à fente : bonnes pratiques',
    $$Un guide pratique pour prolonger la durée de vie de vos instruments et garantir des mesures fiables au quotidien.$$,
    'Maintenance',
    '/catalog/sl-1s.jpeg',
    true,
    '2024-05-14'
  ),
  (
    'biometrie-optique-calcul-implant',
    $$Biométrie optique et calcul d'implant$$,
    $$Pourquoi la biométrie optique sans contact est devenue la référence pour la planification de la chirurgie de la cataracte.$$,
    'Technologie',
    '/catalog/colombo-iol-ii.jpeg',
    true,
    '2024-04-02'
  )
on conflict (slug) do nothing;

-- sanity check — expect 6 (or more if you already created articles)
select count(*) as articles from articles;
