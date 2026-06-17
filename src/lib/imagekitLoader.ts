/**
 * Custom next/image loader → ImageKit.
 *
 * Live content (product images, galleries, brand logos, article covers) stores
 * full ImageKit URLs in the DB. The loader appends on-the-fly optimisation:
 *   tr=w-<width>,c-at_max,f-auto   (images: resize-down, auto AVIF/WebP)
 *   tr=w-<width>,pg-1,f-jpg        (a PDF source → first-page thumbnail)
 *
 * Local assets — the site logo, section icons and the offline fallback catalog
 * under /public — and admin `data:` previews pass through unchanged.
 */
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

function ikTransforms(url: string, width: number): string {
  const isPdf = /\.pdf(\?|$)/i.test(url);
  const tr = isPdf ? `tr=w-${width},pg-1,f-jpg` : `tr=w-${width},c-at_max,f-auto`;
  return url + (url.includes("?") ? "&" : "?") + tr;
}

export default function imagekitLoader({ src, width }: LoaderArgs): string {
  // Admin uploads (base64 preview) — serve as-is.
  if (src.startsWith("data:")) return src;
  // Live ImageKit URL — append optimisation transforms.
  if (src.includes("ik.imagekit.io")) return ikTransforms(src, width);
  // Local /public asset (logo, icons, offline fallback catalog) — unchanged.
  return src;
}
