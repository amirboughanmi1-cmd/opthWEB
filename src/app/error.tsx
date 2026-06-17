"use client";

/**
 * Route-level error boundary. Catches render/runtime errors inside the app
 * (anything below the root layout) and shows a friendly, branded page with the
 * navbar/footer still around it — instead of Next's default error screen.
 */
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for monitoring; the visitor only ever sees the friendly message.
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="container-max flex flex-col items-center justify-center py-32 text-center">
      <p className="font-mono text-label-caps uppercase tracking-widest text-primary-container/70">
        Erreur
      </p>
      <h1 className="mt-3 font-display text-display-md font-bold text-primary-container">
        Une erreur est survenue
      </h1>
      <p className="mt-4 max-w-md text-on-surface-variant">
        Quelque chose s&apos;est mal passé de notre côté. Vous pouvez réessayer ou
        revenir à l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-solid">
          Réessayer
        </button>
        <Link href="/" className="btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
