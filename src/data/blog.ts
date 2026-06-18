export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  cover: string;
  /** Full editorial content (DB `description`) — paragraphs separated by blank lines. */
  body?: string;
  /** Attached PDF (ImageKit URL) — shown in an inline viewer with download. */
  pdf?: string;
  /** Admin-only: unpublished articles are hidden from the public blog (RLS). */
  published?: boolean;
}

/**
 * Real articles live in Supabase (`articles` table, managed from the admin).
 * This list is only the offline fallback — kept EMPTY so demo content can
 * never resurface; the blog shows its "no articles" state instead.
 */
export const articles: Article[] = [];

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/**
 * First page of a PDF as an image.
 * ImageKit renders it via the named `ik-thumbnail` path (this account doesn't
 * have the `tr=pg-1` query transform enabled — it returns the raw PDF). Width
 * is applied later by the next/image loader.
 */
export const pdfFirstPageImage = (url: string): string => {
  if (!url.includes("ik.imagekit.io")) return url;
  return `${url.split("?")[0]}/ik-thumbnail.jpg`;
};

/**
 * Card thumbnail for an article: the cover image if set, otherwise the attached
 * PDF — handed to the next/image loader, which rasterises page 1 (tr=pg-1,f-jpg).
 */
export const articleThumb = (a: Article): string => {
  if (a.cover) return a.cover;
  if (a.pdf) return pdfFirstPageImage(a.pdf);
  return "";
};
