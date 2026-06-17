"use client";

import Link from "next/link";
import Image from "next/image";
import { useAdminData } from "@/lib/store";
import { searchAll } from "@/lib/search";

/**
 * Live results dropdown of the navbar search.
 *
 * Loaded with next/dynamic and mounted only while the visitor types:
 * the store (and the whole supabase-js SDK behind it) stays out of the
 * shared bundle — it downloads on first search interaction instead.
 */
export function NavbarSearchResults({
  query,
  onPick,
  onAll,
}: {
  query: string;
  onPick: () => void;
  onAll: () => void;
}) {
  const data = useAdminData();
  const hits = searchAll(data, query).slice(0, 7);

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-lg border border-outline-variant bg-clinical-white shadow-lg">
      {!data.ready ? (
        <p className="px-4 py-3 text-sm text-on-surface-variant">Recherche…</p>
      ) : hits.length === 0 ? (
        <p className="px-4 py-3 text-sm text-on-surface-variant">Aucun résultat.</p>
      ) : (
        <>
          {hits.map((h) => (
            <Link
              key={`${h.type}-${h.href}-${h.title}`}
              href={h.href}
              onClick={onPick}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface"
            >
              {h.image && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-outline-variant bg-clinical-white">
                  <Image src={h.image} alt="" fill className="object-contain p-1" />
                </div>
              )}
              <div className="min-w-0 flex-grow">
                <p className="truncate text-sm font-medium text-on-surface">{h.title}</p>
                {h.subtitle && <p className="truncate text-xs text-on-surface-variant">{h.subtitle}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                {h.type}
              </span>
            </Link>
          ))}
          <button
            onClick={onAll}
            className="block w-full border-t border-outline-variant px-4 py-2.5 text-left text-sm font-medium text-primary-container transition-colors hover:bg-surface"
          >
            Voir tous les résultats
          </button>
        </>
      )}
    </div>
  );
}
