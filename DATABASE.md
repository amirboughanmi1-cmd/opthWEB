# OphtaHealth — Supabase Database Design (v2, optimized)

The data model behind the OphtaHealth site and admin dashboard. This replaces the current
front-end / `localStorage` data layer (`src/data/*.ts` + `src/lib/store.ts`).

**Catalog hierarchy (3 levels):**

```
family  →  subcategory  →  type  →  product
```

- **Ophtalmologie** is the only family with the full depth: it has **subcategories**
  (Consultation, Exploration, Santé Oculaire), and each subcategory has **types**
  (e.g. *Unité de consultation* → Consultation).
- **Optique** and **Occasion** are families with **no** subcategories/types — products attach
  straight to the family.

> Table/column names are kept in English to match the frontend code. The French domain term is
> noted in comments (e.g. `brands` = *marques*, `families` = *familles*).

---

## 1. Design decisions (the "optimized" part)

| Decision | Why |
|---|---|
| **Auth via Supabase Auth**, not a custom `users`/`sessions` table | Password hashing, reset emails and JWT sessions are handled for you. We only keep a thin `profiles` table for role/phone. Storing plaintext passwords or a "recovery password" is a security risk and is dropped. |
| **One depth, nullable FKs** (`subcategory_id`, `type_id` nullable) | Optique/Occasion products simply leave them `NULL` instead of forcing fake sub-levels. |
| **`brand_id` nullable** | Some products have no *marque*. `NULL` = no brand; the UI hides the brand line. No fake "Sans marque" row needed. |
| **`specs` as `JSONB`** | Specs are a small, display-only ordered list `[{label,value}]`. A JSONB column avoids an extra join table and an N+1 query on every product page. |
| **UUID PKs + unique `slug`** | UUIDs are safe to expose; `slug` drives clean URLs (`/produits/pro500`). |
| **`updated_at` triggers + FK indexes** | Cheap, standard hygiene for fast filters and audit. |
| **Denormalized `product_name` on `leads`** | A lead keeps the product label even after that product is deleted. |
| **RLS everywhere** | Public can read the catalog, anonymous visitors can submit a lead, only the admin can write. |

---

## 2. Storage buckets

Files (images, brochure PDFs, logos) live in Supabase **Storage**; tables store only the URL.

| Bucket | Access | Holds |
|--------|--------|-------|
| `product-images` | public read / admin write | product photos |
| `brochures` | public read / admin write | product brochures (PDF) |
| `brand-logos` | public read / admin write | brand (*marque*) logos |
| `family-covers` | public read / admin write | family & subcategory cover images |
| `blog-covers` | public read / admin write | article covers |

(You may collapse these into a single `media` bucket with folders if you prefer.)

---

## 3. Entity overview

```
auth.users ─1:1─ profiles                         (admin account)

families ─1:N─ subcategories ─1:N─ types
   │                │                 │
   └───────┐        │       ┌─────────┘
           ▼        ▼       ▼
brands ─0:N─────── products ───0:N─► leads
                      │
                  (specs jsonb)

articles                                           (standalone blog)
```

- `products.family_id` → required
- `products.subcategory_id`, `products.type_id`, `products.brand_id` → nullable
- `leads.product_id` → nullable (+ denormalized `product_name`)

---

## 4. Schema (run in the Supabase SQL editor)

```sql
create extension if not exists "pgcrypto";

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ─────────────── PROFILES (admin, linked to Supabase Auth) ───────────────
create table profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  phone     text,
  role      text not null default 'admin',
  created_at timestamptz default now()
);

-- ─────────────── FAMILIES (familles) ───────────────
create table families (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,                 -- ophtalmologie | optique | occasion
  name        text not null,
  description text,
  cover_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create trigger trg_families_updated before update on families
  for each row execute function set_updated_at();

-- ─────────────── SUBCATEGORIES (sous-catégories: Consultation, …) ───────────────
create table subcategories (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  cover_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (family_id, slug)
);
create index on subcategories (family_id);
create trigger trg_subcategories_updated before update on subcategories
  for each row execute function set_updated_at();

-- ─────────────── TYPES (Unité de consultation → Consultation) ───────────────
create table types (
  id              uuid primary key default gen_random_uuid(),
  subcategory_id  uuid not null references subcategories(id) on delete cascade,
  slug            text not null,
  name            text not null,
  sort_order      int default 0,
  unique (subcategory_id, slug)
);
create index on types (subcategory_id);

-- ─────────────── BRANDS (marques) ───────────────
create table brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  logo_url    text,                                 -- null = no logo asset yet
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create trigger trg_brands_updated before update on brands
  for each row execute function set_updated_at();

-- ─────────────── PRODUCTS ───────────────
create table products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  family_id       uuid not null references families(id)       on delete restrict,
  subcategory_id  uuid          references subcategories(id)   on delete set null,  -- null for optique/occasion
  type_id         uuid          references types(id)           on delete set null,  -- null for optique/occasion
  brand_id        uuid          references brands(id)          on delete set null,  -- null = no marque
  image_url       text,
  brochure_url    text,                                        -- PDF in brochures bucket
  tagline         text,                                        -- "accroche" on cards
  description     text,
  specs           jsonb not null default '[]'::jsonb,          -- [{ "label": "...", "value": "..." }]
  featured        boolean not null default false,              -- show on homepage
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index on products (family_id);
create index on products (subcategory_id);
create index on products (type_id);
create index on products (brand_id);
create index on products (featured) where featured;
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

-- ─────────────── ARTICLES (blog) ───────────────
create table articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  description  text,                                 -- rich text / markdown / HTML
  image_url    text,
  published    boolean not null default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index on articles (created_at desc);
create trigger trg_articles_updated before update on articles
  for each row execute function set_updated_at();

-- ─────────────── LEADS (brochure downloads) ───────────────
create table leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                       -- nom complet
  email         text not null,
  phone         text,                                -- téléphone
  organization  text,                                -- établissement
  product_id    uuid references products(id) on delete set null,
  product_name  text,                                -- denormalized, survives product deletion
  created_at    timestamptz default now()            -- the "date" the admin sees
);
create index on leads (created_at desc);
```

### Optional integrity guard (depth rule)

A product in **Optique/Occasion** must have no subcategory/type; a product in **Ophtalmologie**
should have both. CHECK can't read other tables, so enforce with a trigger if you want it strict:

```sql
create or replace function enforce_product_depth()
returns trigger language plpgsql as $$
declare fam text;
begin
  select slug into fam from families where id = new.family_id;
  if fam = 'ophtalmologie' then
    if new.subcategory_id is null or new.type_id is null then
      raise exception 'Ophtalmologie products require a subcategory and a type';
    end if;
  else
    new.subcategory_id := null;
    new.type_id := null;
  end if;
  return new;
end; $$;

create trigger trg_product_depth before insert or update on products
  for each row execute function enforce_product_depth();
```

---

## 5. Row Level Security

```sql
alter table profiles      enable row level security;
alter table families      enable row level security;
alter table subcategories enable row level security;
alter table types         enable row level security;
alter table brands        enable row level security;
alter table products      enable row level security;
alter table articles      enable row level security;
alter table leads         enable row level security;

-- admin check
create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from profiles p where p.id = auth.uid());
$$;

-- public READ (catalog)
create policy "read families"      on families      for select using (true);
create policy "read subcategories" on subcategories for select using (true);
create policy "read types"         on types         for select using (true);
create policy "read brands"        on brands        for select using (true);
create policy "read products"      on products      for select using (true);
create policy "read articles"      on articles      for select using (published);

-- admin WRITE (catalog + blog)
create policy "admin families"      on families      for all using (is_admin()) with check (is_admin());
create policy "admin subcategories" on subcategories for all using (is_admin()) with check (is_admin());
create policy "admin types"         on types         for all using (is_admin()) with check (is_admin());
create policy "admin brands"        on brands        for all using (is_admin()) with check (is_admin());
create policy "admin products"      on products      for all using (is_admin()) with check (is_admin());
create policy "admin articles"      on articles      for all using (is_admin()) with check (is_admin());

-- leads: anyone may submit, only admin may read/delete
create policy "submit lead"      on leads for insert with check (true);
create policy "admin read leads" on leads for select using (is_admin());
create policy "admin del leads"  on leads for delete using (is_admin());

-- profiles: a user reads their own row
create policy "read own profile" on profiles for select using (auth.uid() = id);
```

**Storage policy pattern** (repeat per bucket):
```sql
create policy "read product-images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin product-images" on storage.objects
  for all using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());
```

---

## 6. Admin account

1. **Authentication → Users → Add user** (the client's email + password).
2. Flag them as admin:
   ```sql
   insert into profiles (id, phone, role)
   values ('<auth-user-uuid>', '+216...', 'admin');
   ```
3. Password reset = Supabase's built-in "send reset email" flow. No custom recovery column.

---

## 7. Seed data (current catalog)

```sql
-- Families
insert into families (slug, name, sort_order) values
  ('ophtalmologie', 'Ophtalmologie', 1),
  ('optique',       'Optique',       2),
  ('occasion',      'Occasion',      3);

-- Subcategories (only under Ophtalmologie)
insert into subcategories (family_id, slug, name, sort_order)
select f.id, v.slug, v.name, v.sort_order
from families f
join (values
  ('consultation',   'Consultation',   1),
  ('exploration',    'Exploration',    2),
  ('sante-oculaire', 'Santé Oculaire', 3)
) as v(slug, name, sort_order) on true
where f.slug = 'ophtalmologie';

-- Brands (marques) — 11
insert into brands (slug, name, logo_url) values
  ('rodenstock','Rodenstock','/sponsors/rodenstock.png'),
  ('medinstrus','Medinstrus','/sponsors/medinstrus.png'),
  ('main-meditech','Main Meditech','/sponsors/main-meditech.png'),
  ('sbm-sistemi','SBM Sistemi','/sponsors/sbm-sistemi.png'),
  ('supore','Supore','/sponsors/supore.jpg'),
  ('moptim','Moptim','/sponsors/moptim.png'),
  ('suoer','Suoer','/sponsors/suoer.png'),
  ('syseye','Syseye','/sponsors/syseye.png'),
  ('mocular-medical','Mocular Medical','/sponsors/mocular-medical.jpg'),
  ('visionstar','Visionstar','/sponsors/visionstar.png'),
  ('mabel','Mabel','/sponsors/mabel.png');
```

> **Types** (Unité de consultation, Lampe à fente, …) and the **38 products** can be generated
> from the current `src/data/categories.ts` and `src/data/products.ts` — say the word and I'll
> produce the full seed `INSERT`s.

---

## 8. Field → frontend mapping

| Frontend (`src/...`) | DB |
|---|---|
| `Section` (consultation/exploration/santé) | `subcategories` (under family ophtalmologie) |
| `SubCategory` ("Type" in admin UI) | `types` |
| Optique / Occasion (faked as sections) | `families` rows |
| `Product.image/brochure/taglineFr/descriptionFr/specs/featured` | `products.image_url/brochure_url/tagline/description/specs/featured` |
| `Product.brand` (required slug) | `products.brand_id` (**nullable**) |
| `Brand.slug/name/logo` | `brands.slug/name/logo_url` |
| `Article.title/excerpt/cover/date` | `articles.title/description/image_url/created_at` |
| `Lead.*` | `leads.*` |

> **Frontend changes needed to match this DB** (next coding phase): (1) introduce the `family`
> level above today's `sections`; (2) make `brand` optional and hide the label when absent;
> (3) navbar "Ophtalmologie" dropdown already lists only the 3 subcategories ✅.
> `inStock` is intentionally dropped — everything is *Sur commande*.
```
