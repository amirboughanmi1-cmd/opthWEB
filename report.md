# OphtaHealth Project Report

## 1. Project Overview

OphtaHealth is a Next.js storefront and lead-generation site for ophthalmic medical equipment. The project presents a structured catalog of products, partner brands, editorial blog content, and support pages for a French-speaking audience.

The app is organized around three main goals:

- Showcase ophthalmology equipment by category, brand, and product detail.
- Convert visitors through contact, WhatsApp, and brochure-download flows.
- Provide a lightweight admin area for managing catalog content, brands, categories, leads, and blog-style editorial content.

The current implementation is mostly front-end driven. The site behaves like a production marketing catalog, but the admin and content persistence are still demo/local-first rather than backed by a real server database.

## 2. Technology Stack

- Next.js 14 with the App Router.
- React 18 and TypeScript.
- Tailwind CSS for the design system and layout utilities.
- next/image for media handling and fallback rendering.
- Browser localStorage for demo auth and editable admin data.

There is no API layer, ORM, or external database in the current codebase. The architecture is intentionally simple and optimized for a content-heavy front-end.

## 3. Architecture

### 3.1 Application Shell

The global shell lives in `src/app/layout.tsx` and wraps every page with:

- `Navbar`
- `Footer`
- floating `WhatsAppButton`
- `CookieBanner`

It also sets metadata, fonts, and a preconnect hint for ImageKit images.

### 3.2 Routing Model

The site uses the App Router and is split into route-based pages under `src/app`:

- `/` home page
- `/catalogue` product catalog with filters
- `/produits/[slug]` product details
- `/blog` and `/blog/[slug]`
- `/a-propos`
- `/support`
- `/faq`
- `/confidentialite`
- `/optique` and `/occasion` as placeholder / in-progress sections
- `/admin` and `/admin/login`

Each route is mostly rendered from a dedicated server component or a client component when the page needs interactivity.

### 3.3 Data-Driven Core

The project is centered on a small set of canonical data modules:

- `src/data/products.ts` for the catalog.
- `src/data/categories.ts` for the section and subcategory taxonomy.
- `src/data/brands.ts` for partner brands.
- `src/data/blog.ts` for editorial articles.
- `src/lib/site.ts` for contact details, map links, and WhatsApp deep links.
- `src/i18n/ui.ts` for shared French UI strings.

This means most of the site structure is derived from data rather than hardcoded page-by-page content.

## 4. Core Business Model

### 4.1 Catalog Structure

The catalog is the heart of the site. Products are grouped into three major sections:

- Consultation
- Exploration
- Santé Oculaire

Each product carries:

- a slug and display name,
- a brand reference,
- a section and subcategory,
- an image path,
- stock status,
- optional brochure path,
- a short marketing tagline,
- a longer French description,
- a small list of technical specifications.

The catalog is large enough to feel real, but still static enough to be edited directly in TypeScript.

### 4.2 Brands and Taxonomy

Brands and categories are normalized separately from products. That gives the UI a consistent way to build:

- the homepage brand strip,
- the mega-menu in the navbar,
- the filters in the catalog,
- the product detail breadcrumb and related-products view,
- the admin forms for assigning brands and subcategories.

### 4.3 Lead Capture

The main conversion path is the brochure download flow on product pages:

- The user opens a brochure modal.
- They submit contact details.
- The lead is stored locally in the admin data store.
- The PDF download is triggered immediately.

This is not an email or backend workflow yet. It is a front-end demo flow that simulates lead collection.

## 5. Key User Flows

### 5.1 Home Page

The homepage combines the main commercial blocks:

- a rotating `HeroCarousel` for featured products,
- an auto-scrolling `BrandStrip`,
- category cards built from the taxonomy,
- a featured-products grid,
- a company/about summary,
- a map embed.

This page is the primary marketing surface and gives a quick path into catalog browsing.

### 5.2 Catalog Browsing

`src/components/CatalogueClient.tsx` powers the catalog page with client-side filtering by:

- section,
- subcategory,
- brand.

The filter state is synchronized with query parameters for section and subcategory, so category links from the homepage and navbar land users in a filtered catalog view.

### 5.3 Product Detail

`src/app/produits/[slug]/page.tsx` resolves a product from the seed data and renders `ProductView`.

The product detail page includes:

- breadcrumb navigation,
- a larger product image,
- brand and category context,
- technical specs,
- brochure download CTA,
- WhatsApp ordering CTA,
- related products from the same section.

This is the strongest conversion page in the site and the clearest expression of the business logic.

### 5.4 Blog and Content Pages

The blog is data-driven but editorial rather than transactional. It uses a static article list and renders:

- a blog landing page with a featured article and sidebar widgets,
- article detail pages generated from slugs.

The supporting pages (`À Propos`, `Support`, `FAQ`, `Confidentialité`) are content-rich, mostly static, and designed to reinforce trust and answer operational questions.

### 5.5 Admin Area

The admin area is a front-end demo dashboard protected by a simple localStorage-based login.

The dashboard currently manages:

- products,
- categories,
- subcategory types,
- brands,
- leads.

Important detail: changes are persisted locally in the browser, not on a server. That makes the admin usable for demos and prototyping, but it is not a secure or shared production CMS.

## 6. Admin Data Layer

`src/lib/store.ts` is the central mutable state layer for the admin experience. It:

- seeds initial data from the static catalog modules,
- persists data in `localStorage`,
- exposes a reactive `useAdminData` hook,
- provides CRUD helpers for products, brands, categories, subcategories, and leads,
- stores a version key for local schema invalidation.

This is effectively a client-side mini CMS.

`src/lib/auth.ts` provides a similarly lightweight auth model:

- hard-coded demo credentials,
- login state in `localStorage`,
- reactive auth updates via `useSyncExternalStore`.

## 7. Design System and UI Layer

The visual language is controlled primarily through Tailwind config and shared utility classes.

### 7.1 Theme

`tailwind.config.ts` defines:

- brand colors,
- surface and text colors,
- typography scales,
- spacing tokens,
- container width,
- border radii,
- a few key animations.

The site uses a clinical, trust-oriented palette with blue-green brand tones and neutral surfaces.

### 7.2 Shared Components

Notable shared UI primitives include:

- `PageHeader` for inner-page hero banners,
- `ProductCard` and `ProductImage` for catalog cards,
- `HeroCarousel` for homepage merchandising,
- `BrandStrip` for partner credibility,
- `Accordion` for FAQ content,
- `BrochureModal` for lead capture,
- `CookieBanner` for consent messaging,
- `WhatsAppButton` for persistent contact access.

The repeated structure keeps the site visually coherent even though many routes are content-heavy and distinct.

## 8. Content and Routing Notes

The project is French-first. Shared UI strings live in `src/i18n/ui.ts`, but the app is not structured as a full multilingual system. It is more accurate to think of it as a French UI dictionary than an i18n platform.

The `optique` and `occasion` pages are present as placeholders, which suggests the repository is already prepared for future product-line expansion beyond the current ophthalmology catalog.

## 9. Main Strengths

- Clear separation between catalog data, UI components, and route pages.
- Strong catalog browsing experience with filters and product detail pages.
- Cohesive design system with reusable primitives.
- Useful demo admin workflow for content editing and lead review.
- Good SEO posture through static routes, metadata, and structured content pages.

## 10. Main Limitations

- Admin auth is not secure and should not be used as-is in production.
- Content persistence is browser-local only.
- There is no server-side source of truth or shared database.
- Brochure download and lead capture are simulated client-side.
- Some routes are still placeholders and not fully implemented.

## 11. Bottom Line

The core of the project is a polished ophthalmology catalog with strong visual merchandising and a simple conversion funnel. Architecturally, it is a well-structured Next.js front-end built around static seed data, client-side filters, and a demo admin layer that mimics a CMS without backend infrastructure.