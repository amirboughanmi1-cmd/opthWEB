"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Minimal search form — submits to the site-wide /recherche page. */
export function SearchForm({ placeholder, className }: { placeholder: string; className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        if (!query) return;
        router.push(`/recherche?q=${encodeURIComponent(query)}`);
      }}
    >
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className={className}
      />
    </form>
  );
}
