-- Run in the CLIENT Supabase SQL Editor (project tasvuivuzfvhukmfrfux).
-- Lets a featured product show a SPECIFIC photo in the home hero ("produit
-- phare"). NULL = fall back to the product's cover (image_url).
alter table public.products
  add column if not exists hero_image text;
