"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAdminData } from "@/lib/store";
import { searchAll, type SearchHit, type SearchHitType } from "@/lib/search";
import { PageHeader } from "./PageHeader";
import { ArrowRight, SearchIcon } from "./Icons";

const GROUP_ORDER: SearchHitType[] = ["Produit", "Catégorie", "Marque", "Article", "Page"];
const GROUP_LABELS: Record<SearchHitType, string> = {
  Produit: "Produits",
  Catégorie: "Catégories",
  Marque: "Marques",
  Article: "Articles",
  Page: "Pages",
};

export function RechercheClient() {
  const params = useSearchParams();
  const data = useAdminData();
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const hits = useMemo(() => searchAll(data, query), [data, query]);
  const groups = useMemo(
    () =>
      GROUP_ORDER.map((type) => ({ type, items: hits.filter((h) => h.type === type) })).filter(
        (g) => g.items.length > 0
      ),
    [hits]
  );

  const q = query.trim();

  return (
    <>
      <PageHeader
        eyebrow="Recherche"
        title={q ? `Résultats pour « ${q} »` : "Recherche"}
        subtitle="Produits, catégories, marques, articles et pages du site."
      />

      <div className="container-max max-w-3xl py-12">
        {/* Query input — kept in sync with ?q= from the navbar */}
        <div className="mb-10 flex items-center rounded-full border border-outline-variant bg-surface-gray px-5 py-3">
          <SearchIcon className="mr-3 h-5 w-5 shrink-0 text-outline" />
          <input
            type="search"
            autoFocus={!q}
            placeholder="Rechercher un produit, une marque, un article…"
            aria-label="Rechercher sur le site"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-none bg-transparent text-body-md outline-none"
          />
        </div>

        {!data.ready ? (
          <p className="py-12 text-center text-on-surface-variant">Recherche…</p>
        ) : !q ? (
          <p className="py-12 text-center text-on-surface-variant">
            Saisissez un mot-clé pour rechercher dans tout le site.
          </p>
        ) : hits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline-variant bg-surface-gray p-12 text-center text-on-surface-variant">
            Aucun résultat pour « {q} ».
          </div>
        ) : (
          <>
            <p className="mb-6 font-mono text-label-caps uppercase text-on-surface-variant">
              {hits.length} résultat{hits.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-10">
              {groups.map((g) => (
                <section key={g.type}>
                  <h2 className="mb-4 font-display text-headline-md text-primary-container">
                    {GROUP_LABELS[g.type]}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {g.items.map((h) => (
                      <HitRow key={`${h.type}-${h.href}-${h.title}`} hit={h} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function HitRow({ hit }: { hit: SearchHit }) {
  return (
    <Link
      href={hit.href}
      className="group flex items-center gap-4 rounded-lg border border-outline-variant bg-clinical-white p-4 transition-shadow hover:shadow-md"
    >
      {hit.image && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-outline-variant bg-clinical-white">
          <Image src={hit.image} alt="" fill className="object-contain p-1" />
        </div>
      )}
      <div className="min-w-0 flex-grow">
        <p className="truncate font-display font-semibold text-on-surface group-hover:text-primary">
          {hit.title}
        </p>
        {hit.subtitle && <p className="truncate text-sm text-on-surface-variant">{hit.subtitle}</p>}
      </div>
      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-mono text-label-caps uppercase text-primary">
        {hit.type}
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary-container" />
    </Link>
  );
}
