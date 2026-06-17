import type { Metadata } from "next";

/**
 * Keeps the whole /admin area (dashboard + login) out of search engines.
 *
 * `robots: noindex` is the authoritative "do not list this page" signal. For
 * Google to honor it, the page must be crawlable — so /admin is intentionally
 * NOT disallowed in robots.txt (a robots-disallowed page can still surface as a
 * bare URL when something links to it, e.g. the footer "Espace gestion" link).
 * The same directive is also sent as an X-Robots-Tag HTTP header (next.config),
 * which is the most reliable channel since these pages render client-side.
 */
export const metadata: Metadata = {
  title: "Espace de gestion",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
