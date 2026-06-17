-- Run in the CLIENT Supabase SQL Editor (project tasvuivuzfvhukmfrfux).
-- Adds an ordered gallery of EXTRA images per product. The cover stays in
-- image_url; these are the additional shots shown after it on the product page.
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;
