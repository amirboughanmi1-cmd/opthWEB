"use client";

/**
 * Last-resort error boundary: catches errors thrown in the ROOT layout itself
 * (e.g. the Supabase taxonomy fetch failing at the very top). It replaces the
 * whole document, so it must render its own <html>/<body> and can't rely on the
 * app's CSS — styles are inlined with the brand palette so it always renders.
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          background: "#ffffff",
          color: "#0b1c30",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#206171", margin: 0 }}>
          Une erreur est survenue
        </h1>
        <p style={{ marginTop: "0.75rem", maxWidth: "28rem", color: "#40484b" }}>
          Le site a rencontré un problème inattendu. Veuillez réessayer dans un
          instant.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.65rem 1.75rem",
            border: "none",
            borderRadius: "6px",
            background: "#206171",
            color: "#ffffff",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
