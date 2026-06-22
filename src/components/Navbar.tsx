"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { catalogueSections as staticCatalogueSections, sectionName, STANDALONE_SECTIONS, type Section } from "@/data/categories";
import { t } from "@/i18n/ui";
import { ChevronDown, ChevronRight, SearchIcon, MenuIcon, CloseIcon } from "./Icons";

/**
 * The dropdown pulls the Supabase store — loading it lazily keeps the whole
 * supabase-js SDK (~220 KB) out of the initial bundle of every page.
 */
const SearchResults = dynamic(
  () => import("./NavbarSearchResults").then((m) => m.NavbarSearchResults),
  {
    ssr: false,
    loading: () => (
      <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-outline-variant bg-clinical-white px-4 py-3 text-sm text-on-surface-variant shadow-lg">
        Recherche…
      </div>
    ),
  }
);

const navLinks = [
  { href: "/optique", label: t("optique") },
  { href: "/occasion", label: t("occasion") },
  { href: "/sav", label: t("sav") },
  { href: "/a-propos", label: t("about") },
];

export function Navbar({ sections }: { sections?: Section[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  // Live taxonomy from the DB (passed by the server layout) drives the dropdown
  // so admin-added subcategories appear; fall back to the static list offline.
  const catalogueSections =
    sections && sections.length
      ? sections.filter((s) => !STANDALONE_SECTIONS.includes(s.slug))
      : staticCatalogueSections;

  // Close the mobile menu when the user actually scrolls, so the sticky header
  // never keeps it pinned over the content. We listen for real user gestures
  // (wheel/touch) rather than the "scroll" event — opening the menu grows the
  // header, and the browser's scroll-anchoring fires a spurious "scroll" that
  // would otherwise slam the menu shut the instant it opens.
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => {
      setMobileOpen(false);
      setMobileCatOpen(false);
    };
    window.addEventListener("wheel", close, { passive: true });
    window.addEventListener("touchmove", close, { passive: true });
    return () => {
      window.removeEventListener("wheel", close);
      window.removeEventListener("touchmove", close);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-outline-variant bg-clinical-white">
      <div className="container-max flex h-20 items-center justify-between">
        <Logo />

        {/* Desktop nav — needs ~1100px to fit; below lg the burger menu takes over */}
        <div className="hidden h-full items-center gap-6 whitespace-nowrap lg:flex xl:gap-8">
          <Link
            href="/"
            className={`flex h-full items-center transition-colors ${
              isActive("/") ? "border-b-2 border-primary pb-1 text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {t("home")}
          </Link>

          {/* Categories dropdown */}
          <div className="group relative flex h-full items-center">
            <button
              className={`flex h-full items-center gap-1 transition-colors ${
                isActive("/catalogue") ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {t("categories")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 min-w-[220px] rounded border border-primary-container bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {catalogueSections.map((section, i) => {
                const hasSubs = section.subcategories.length > 0;
                return (
                  <div key={section.slug} className="group/sub relative">
                    <Link
                      href={`/catalogue?section=${section.slug}`}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-on-surface transition-colors hover:bg-surface hover:text-primary ${
                        i > 0 ? "border-t border-surface-dim" : ""
                      }`}
                    >
                      {sectionName(section).toUpperCase()}
                      {hasSubs && <ChevronRight className="h-4 w-4" />}
                    </Link>
                    {/* Only render the flyout when there ARE subcategories — otherwise an
                        empty teal-bordered box appears beside the item (the "green line"). */}
                    {hasSubs && (
                      <div className="invisible absolute left-full top-0 z-50 min-w-[280px] rounded border border-primary-container bg-white opacity-0 shadow-lg transition-all group-hover/sub:visible group-hover/sub:opacity-100">
                        {section.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/catalogue?section=${section.slug}&sub=${sub.slug}`}
                            className="block px-4 py-2.5 text-on-surface transition-colors hover:bg-surface hover:text-primary"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex h-full items-center transition-colors ${
                isActive(l.href) ? "border-b-2 border-primary pb-1 text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          <SearchBox />
          {/* lg→xl: not enough room for the full box — icon linking to /recherche */}
          <Link
            href="/recherche"
            aria-label={t("search")}
            className="hidden rounded-full border border-outline-variant bg-surface-gray p-2.5 text-on-surface-variant transition-colors hover:text-primary lg:flex xl:hidden"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link href="/support" className="hidden btn-outline sm:inline-flex">
            {t("contact")}
          </Link>
          <button
            className="text-on-surface lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-outline-variant bg-clinical-white lg:hidden">
          <div className="container-max flex flex-col py-4">
            <MobileSearch onNavigate={() => setMobileOpen(false)} />
            <Link href="/" onClick={() => setMobileOpen(false)} className="py-3 text-on-surface-variant hover:text-primary">
              {t("home")}
            </Link>
            <button
              className="flex items-center justify-between py-3 text-on-surface-variant hover:text-primary"
              onClick={() => setMobileCatOpen((o) => !o)}
            >
              {t("categories")}
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileCatOpen && (
              <div className="flex flex-col pl-4">
                {catalogueSections.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/catalogue?section=${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm text-on-surface-variant hover:text-primary"
                  >
                    {sectionName(s)}
                  </Link>
                ))}
              </div>
            )}
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-on-surface-variant hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/support" onClick={() => setMobileOpen(false)} className="btn-outline mt-3 justify-center">
              {t("contact")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ───────────────── Search ───────────────── */

function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close the suggestions when clicking anywhere outside the box.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const close = () => {
    setOpen(false);
    setQ("");
  };
  const goToResults = () => {
    const query = q.trim();
    if (!query) return;
    close();
    router.push(`/recherche?q=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={boxRef} className="relative hidden xl:block">
      <div className="flex items-center rounded-full border border-outline-variant bg-surface-gray px-4 py-2">
        <SearchIcon className="mr-2 h-5 w-5 text-outline" />
        <input
          type="text"
          placeholder={t("search")}
          aria-label={t("search")}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") goToResults();
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-32 border-none bg-transparent text-body-md outline-none transition-all focus:w-48"
        />
      </div>
      {/* Mounted only while searching → the catalog fetch stays lazy. */}
      {open && q.trim() && <SearchResults query={q} onPick={close} onAll={goToResults} />}
    </div>
  );
}

function MobileSearch({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;
        onNavigate();
        router.push(`/recherche?q=${encodeURIComponent(query)}`);
      }}
      className="mb-2 flex items-center rounded-full border border-outline-variant bg-surface-gray px-4 py-2"
    >
      <SearchIcon className="mr-2 h-5 w-5 shrink-0 text-outline" />
      <input
        type="search"
        placeholder={t("search")}
        aria-label={t("search")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full border-none bg-transparent text-body-md outline-none"
      />
    </form>
  );
}
