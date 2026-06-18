"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { LocationIcon } from "./Icons";

/**
 * Google Maps embed with a click-to-load facade.
 *
 * The Maps iframe pulls a large amount of third-party JavaScript and spawns
 * long main-thread tasks. Rendering it only after the user opts in keeps all of
 * that off the initial page load (faster TTI, fewer requests) while the map is
 * still one click away.
 */
export function MapEmbed({ title = "Localisation OphtaHealth" }: { title?: string }) {
  const [show, setShow] = useState(false);

  if (show) {
    return (
      <iframe
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={site.mapEmbedUrl}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShow(true)}
      aria-label="Afficher la carte"
      className="group flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-gray text-on-surface-variant transition-colors hover:bg-surface-container"
    >
      <LocationIcon className="h-10 w-10 text-primary-container transition-transform group-hover:scale-110" />
      <span className="font-medium text-primary-container">Afficher la carte</span>
      <span className="text-sm">{site.address}</span>
    </button>
  );
}
