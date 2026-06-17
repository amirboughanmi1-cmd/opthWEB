"use client";

import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";
import { ChevronRight } from "./Icons";

/**
 * Product image gallery. With a single image it renders exactly like the old
 * static product image (no controls). With several it becomes a carousel:
 * cover first, then prev/next arrows, a thumbnail strip, swipe, and arrow keys.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const slides = images.filter(Boolean);
  const [i, setI] = useState(0);
  const touchX = useRef(0);
  const many = slides.length > 1;
  const idx = Math.min(i, Math.max(slides.length - 1, 0));
  const active = slides[idx] ?? "";

  const go = (n: number) => setI((slides.length + (n % slides.length)) % slides.length);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative rounded-lg border border-outline-variant bg-clinical-white p-8"
        tabIndex={many ? 0 : -1}
        role={many ? "group" : undefined}
        aria-roledescription={many ? "carrousel" : undefined}
        aria-label={many ? `${alt} — ${slides.length} images` : undefined}
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
        }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (many && Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="relative aspect-square w-full">
          <ProductImage
            src={active}
            alt={alt}
            fill
            sizes="(max-width: 768px) 90vw, 45vw"
            priority
            className="object-contain"
          />
        </div>

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(idx - 1)}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-clinical-white/90 text-on-surface-variant shadow-sm transition hover:text-primary"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-outline-variant bg-clinical-white/90 text-on-surface-variant shadow-sm transition hover:text-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-on-surface/70 px-2 py-0.5 font-mono text-label-caps text-clinical-white">
              {idx + 1}/{slides.length}
            </span>
          </>
        )}
      </div>

      {many && (
        <div className="flex flex-wrap gap-2">
          {slides.map((src, n) => (
            <button
              key={n}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Voir l'image ${n + 1}`}
              aria-current={n === idx}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-clinical-white transition ${
                n === idx ? "border-primary ring-1 ring-primary" : "border-outline-variant hover:border-primary/50"
              }`}
            >
              <ProductImage src={src} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
