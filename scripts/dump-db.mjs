/**
 * Generates `client-migration.sql` — a complete, runnable recreation of the
 * OphtaHealth database (schema + RLS + triggers + all current catalog data) for
 * the client's Supabase project.
 *
 * Reads the CURRENT project via the service-role key in .env.local (bypasses RLS),
 * so descriptions with newlines/quotes are escaped correctly (no copy/paste risk).
 *
 * Run:  node scripts/dump-db.mjs
 * Then: paste client-migration.sql into the client's Supabase SQL editor.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// ── load .env.local manually (no extra deps) ──
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
const sb = createClient(URL, SERVICE, { auth: { persistSession: false } });

// ── SQL literal helper (single-quoted; real newlines stay real, which is valid SQL) ──
function lit(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function row(table, cols, r) {
  return `insert into public.${table} (${cols.join(",")}) values (${cols.map((c) => lit(r[c])).join(",")});`;
}
async function dump(table, cols, order) {
  let q = sb.from(table).select("*");
  if (order) q = q.order(order.col, { ascending: order.asc });
  const { data, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return data.map((r) => row(table, cols, r)).join("\n");
}

const SCHEMA = `-- ════════════════════════════════════════════════════════════════════
--  OphtaHealth — full database recreation (run once in a FRESH project)
--  Schema · triggers · RLS · catalog data. Admin account is added at the end.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ─────────────── PROFILES (admin, linked to Supabase Auth) ───────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  phone      text,
  role       text not null default 'admin',
  created_at timestamptz default now()
);

-- ─────────────── FAMILIES ───────────────
create table if not exists public.families (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  cover_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
drop trigger if exists trg_families_updated on public.families;
create trigger trg_families_updated before update on public.families
  for each row execute function public.set_updated_at();

-- ─────────────── SUBCATEGORIES ───────────────
create table if not exists public.subcategories (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  slug        text not null,
  name        text not null,
  description text,
  cover_url   text,
  sort_order  int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (family_id, slug)
);
create index if not exists subcategories_family_id_idx on public.subcategories (family_id);
drop trigger if exists trg_subcategories_updated on public.subcategories;
create trigger trg_subcategories_updated before update on public.subcategories
  for each row execute function public.set_updated_at();

-- ─────────────── TYPES ───────────────
create table if not exists public.types (
  id             uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.subcategories(id) on delete cascade,
  slug           text not null,
  name           text not null,
  sort_order     int default 0,
  unique (subcategory_id, slug)
);
create index if not exists types_subcategory_id_idx on public.types (subcategory_id);

-- ─────────────── BRANDS ───────────────
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  logo_url    text,
  sort_order  int default 0,
  is_partner  boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
drop trigger if exists trg_brands_updated on public.brands;
create trigger trg_brands_updated before update on public.brands
  for each row execute function public.set_updated_at();

-- ─────────────── PRODUCTS ───────────────
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  family_id      uuid not null references public.families(id)      on delete restrict,
  subcategory_id uuid          references public.subcategories(id)  on delete set null,
  type_id        uuid          references public.types(id)          on delete set null,
  brand_id       uuid          references public.brands(id)         on delete set null,
  image_url      text,
  brochure_url   text,
  tagline        text,
  description    text,
  specs          jsonb not null default '[]'::jsonb,
  featured       boolean not null default false,
  sort_order     int default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists products_family_id_idx on public.products (family_id);
create index if not exists products_subcategory_id_idx on public.products (subcategory_id);
create index if not exists products_type_id_idx on public.products (type_id);
create index if not exists products_brand_id_idx on public.products (brand_id);
create index if not exists products_featured_idx on public.products (featured) where featured;
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ─────────────── ARTICLES (blog) ───────────────
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  image_url   text,
  category    text,
  pdf_url     text,
  published   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists articles_created_at_idx on public.articles (created_at desc);
drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

-- ─────────────── LEADS (brochure downloads) ───────────────
create table if not exists public.leads (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  organization text,
  product_id   uuid references public.products(id) on delete set null,
  product_name text,
  created_at   timestamptz default now()
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════
alter table public.profiles      enable row level security;
alter table public.families      enable row level security;
alter table public.subcategories enable row level security;
alter table public.types         enable row level security;
alter table public.brands        enable row level security;
alter table public.products      enable row level security;
alter table public.articles      enable row level security;
alter table public.leads         enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid());
$$;

create policy "read families"      on public.families      for select using (true);
create policy "read subcategories" on public.subcategories for select using (true);
create policy "read types"         on public.types         for select using (true);
create policy "read brands"        on public.brands        for select using (true);
create policy "read products"      on public.products      for select using (true);
create policy "read articles"      on public.articles      for select using (published);

create policy "admin families"      on public.families      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin subcategories" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin types"         on public.types         for all using (public.is_admin()) with check (public.is_admin());
create policy "admin brands"        on public.brands        for all using (public.is_admin()) with check (public.is_admin());
create policy "admin products"      on public.products      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin articles"      on public.articles      for all using (public.is_admin()) with check (public.is_admin());

create policy "submit lead"      on public.leads for insert with check (true);
create policy "admin read leads" on public.leads for select using (public.is_admin());
create policy "admin del leads"  on public.leads for delete using (public.is_admin());

create policy "read own profile" on public.profiles for select using (auth.uid() = id);
`;

// ── build data section ──
const fams = await dump("families", ["id", "slug", "name", "description", "cover_url", "sort_order"], { col: "sort_order", asc: true });
const subs = await dump("subcategories", ["id", "family_id", "slug", "name", "description", "cover_url", "sort_order"], { col: "sort_order", asc: true });
const typs = await dump("types", ["id", "subcategory_id", "slug", "name", "sort_order"], { col: "sort_order", asc: true });
const brs = await dump("brands", ["id", "slug", "name", "logo_url", "sort_order", "is_partner"], { col: "name", asc: true });
const prods = await dump("products", ["id", "slug", "name", "family_id", "subcategory_id", "type_id", "brand_id", "image_url", "brochure_url", "tagline", "description", "specs", "featured", "sort_order", "created_at"], { col: "created_at", asc: true });
const arts = await dump("articles", ["id", "slug", "title", "description", "image_url", "category", "pdf_url", "published", "created_at"], { col: "created_at", asc: true });

const DATA = `-- ════════════════════════════════════════════════════════════════════
--  CATALOG DATA (current live content)
-- ════════════════════════════════════════════════════════════════════

-- Families
${fams}

-- Subcategories (sections under Ophtalmologie)
${subs}

-- Types
${typs}

-- Brands (Huvitz is_partner=false; all others true)
${brs}

-- Products
${prods}

-- Articles (blog)
${arts}
`;

const ADMIN = `
-- ════════════════════════════════════════════════════════════════════
--  ADMIN ACCOUNT  (do these AFTER running everything above)
-- ════════════════════════════════════════════════════════════════════
-- 1) Supabase dashboard → Authentication → Users → "Add user" → the client's
--    email + a password (tick "Auto-confirm").
-- 2) Copy that new user's UUID, then run (replace the UUID):
--
--    insert into public.profiles (id, role) values ('PASTE-AUTH-USER-UUID', 'admin');
--
-- After that, the admin can log in at /admin/login and the dashboard works.
`;

const out = [SCHEMA, DATA, ADMIN].join("\n");
writeFileSync(join(root, "client-migration.sql"), out, "utf8");
console.log(`Wrote client-migration.sql (${(out.length / 1024).toFixed(1)} KB)`);
console.log(`Counts → families/subcats/types/brands/products/articles`);
