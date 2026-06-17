"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Use fill layout instead of fixed width/height. */
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * next/image wrapper with a graceful fallback.
 * If the source fails to load, a clean branded placeholder is shown
 * instead of an empty colored box.
 */
export function ProductImage({ src, alt, width, height, fill, sizes, className, priority }: Props) {
  const [failed, setFailed] = useState(false);

  // Empty src (product without image yet) renders the placeholder directly —
  // passing "" to next/image triggers a console error and a useless request.
  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-clinical-white text-primary-container/40 ${
          fill ? "absolute inset-0" : ""
        } ${className ?? ""}`}
        style={!fill && width && height ? { width, height } : undefined}
        role="img"
        aria-label={alt}
      >
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" aria-hidden>
          <path
            d="M4 24c4.5-8 11.5-13 20-13s15.5 5 20 13c-4.5 8-11.5 13-20 13S8.5 32 4 24Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="24" r="6" fill="currentColor" />
        </svg>
        <span className="px-2 text-center font-mono text-label-caps uppercase">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width: width ?? 400, height: height ?? 300 })}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
