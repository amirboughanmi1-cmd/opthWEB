import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { type Article, articleThumb, formatDate } from "@/data/blog";
import { SearchForm } from "@/components/SearchForm";
import { ArrowRight } from "@/components/Icons";

export function BlogView({ articles }: { articles: Article[] }) {
  const [featured, ...rest] = articles;
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <>
      <PageHeader
        eyebrow="Le blog OphtaHealth"
        title="Actualités & Innovation en Ophtalmologie"
        subtitle="Découvrez les dernières avancées technologiques, conseils cliniques et analyses du secteur pour les professionnels de la vision."
      />

      {!featured && (
        <div className="container-max py-24 text-center text-on-surface-variant">
          Aucun article publié pour le moment.
        </div>
      )}

      {featured && (

      <div className="container-max grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Featured */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid grid-cols-1 overflow-hidden rounded-lg border border-outline-variant bg-clinical-white transition-shadow hover:shadow-md md:grid-cols-2"
          >
            <div className="relative h-64 overflow-hidden bg-surface-container-low md:h-full">
              {articleThumb(featured) && (
                <Image
                  src={articleThumb(featured)}
                  alt={featured.title}
                  fill
                  className={featured.cover ? "object-contain p-6" : "object-cover object-top"}
                />
              )}
            </div>
            <div className="flex flex-col p-8">
              <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 font-mono text-label-caps uppercase text-primary">
                {featured.category}
              </span>
              <h2 className="mb-3 font-display text-headline-md text-on-surface group-hover:text-primary">
                {featured.title}
              </h2>
              <p className="mb-4 flex-grow text-on-surface-variant">{featured.excerpt}</p>
              <span className="text-sm text-on-surface-variant">{formatDate(featured.date)}</span>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2">
            {rest.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-clinical-white transition-shadow hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden border-b border-outline-variant bg-surface-container-low">
                  {articleThumb(a) && (
                    <Image
                      src={articleThumb(a)}
                      alt={a.title}
                      fill
                      className={a.cover ? "object-contain p-4" : "object-cover object-top"}
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-clinical-white/90 px-3 py-1 font-mono text-label-caps uppercase text-primary">
                    {a.category}
                  </span>
                </div>
                <div className="flex flex-grow flex-col p-5">
                  <h3 className="mb-2 font-display text-lg font-semibold text-on-surface group-hover:text-primary">
                    {a.title}
                  </h3>
                  <p className="mb-4 flex-grow text-sm text-on-surface-variant">{a.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">{formatDate(a.date)}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-container">
                      Lire <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex h-fit flex-col gap-6">
          <div className="rounded-lg border border-outline-variant bg-surface-gray p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-primary-container">Recherche</h3>
            <SearchForm
              placeholder="Rechercher un article…"
              className="w-full rounded border border-outline-variant bg-clinical-white px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-gray p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-primary-container">Catégories</h3>
            <ul className="flex flex-col gap-2">
              {categories.map((c) => (
                <li key={c}>
                  <span className="cursor-pointer text-on-surface-variant transition-colors hover:text-primary">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-gray p-6">
            <h3 className="mb-3 font-display text-lg font-semibold text-primary-container">Articles récents</h3>
            <ul className="flex flex-col gap-3">
              {articles.slice(0, 3).map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="text-sm text-on-surface-variant hover:text-primary">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      )}
    </>
  );
}
